// controllers/payrollController.js
import { calculateSalary, getSalaryRecord, getAllSalaryRecords, updateSalaryStatus } from '../models/payrollModel.js';
import { sendResponse, ResponseStatus } from '../utils/responseHandler.js';

export const generateSalary = async (req, res) => {
    try {
        const { 
            employee_id, 
            month, 
            year, 
            hourly_rate, 
            base_salary 
        } = req.body;
        
        if (!employee_id || !month || !year) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'employee_id, month, and year are required');
        }

        // Validate month and year
        if (month < 1 || month > 12) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Invalid month. Must be between 1 and 12');
        }

        if (year < 2000 || year > 2100) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Invalid year');
        }

        // Validate hourly_rate and base_salary if provided
        if (hourly_rate && (isNaN(hourly_rate) || hourly_rate <= 0)) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Invalid hourly_rate. Must be a positive number');
        }

        if (base_salary && (isNaN(base_salary) || base_salary < 0)) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Invalid base_salary. Must be a non-negative number');
        }

        const salaryRecord = await calculateSalary(
            employee_id, 
            month, 
            year, 
            hourly_rate || null,  // If not provided, will use rate from database
            base_salary || 0      // If not provided, defaults to 0
        );
        
        return sendResponse(res, ResponseStatus.SUCCESS, 'Salary generated successfully', salaryRecord);
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error generating salary', null, error.message);
    }
};

export const getSalaryDetails = async (req, res) => {
    try {
        const { employee_id, month, year } = req.body;
        
        if (!employee_id || !month || !year) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'employee_id, month, and year are required');
        }

        const salaryRecord = await getSalaryRecord(employee_id, month, year);
        
        if (!salaryRecord) {
            return sendResponse(res, ResponseStatus.NOT_FOUND, 'Salary record not found');
        }

        return sendResponse(res, ResponseStatus.SUCCESS, 'Salary details retrieved successfully', salaryRecord);
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error retrieving salary details', null, error.message);
    }
};

export const getMonthlySalaries = async (req, res) => {
    try {
        const { month, year } = req.body;
        
        if (!month || !year) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'month and year are required');
        }

        const salaryRecords = await getAllSalaryRecords(month, year);
        return sendResponse(res, ResponseStatus.SUCCESS, 'Monthly salaries retrieved successfully', salaryRecords);
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error retrieving monthly salaries', null, error.message);
    }
};

export const updatePaymentStatus = async (req, res) => {
    try {
        const { record_id, status } = req.body;
        
        if (!record_id || !status) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'record_id and status are required');
        }

        if (!['Pending', 'Paid', 'Cancelled'].includes(status)) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Invalid status. Must be Pending, Paid, or Cancelled');
        }

        const updatedRecord = await updateSalaryStatus(record_id, status);
        return sendResponse(res, ResponseStatus.SUCCESS, 'Payment status updated successfully', updatedRecord);
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error updating payment status', null, error.message);
    }
};
