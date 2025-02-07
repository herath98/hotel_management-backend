// controllers/payrollController.js
import { calculateSalary, getSalaryRecord, getAllSalaryRecords, updateSalaryStatus } from '../models/payrollModel.js';

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
            return res.status(400).json({
                success: false,
                message: 'employee_id, month, and year are required'
            });
        }

        // Validate month and year
        if (month < 1 || month > 12) {
            return res.status(400).json({
                success: false,
                message: 'Invalid month. Must be between 1 and 12'
            });
        }

        if (year < 2000 || year > 2100) {
            return res.status(400).json({
                success: false,
                message: 'Invalid year'
            });
        }

        // Validate hourly_rate and base_salary if provided
        if (hourly_rate && (isNaN(hourly_rate) || hourly_rate <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid hourly_rate. Must be a positive number'
            });
        }

        if (base_salary && (isNaN(base_salary) || base_salary < 0)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid base_salary. Must be a non-negative number'
            });
        }

        const salaryRecord = await calculateSalary(
            employee_id, 
            month, 
            year, 
            hourly_rate || null,  // If not provided, will use rate from database
            base_salary || 0      // If not provided, defaults to 0
        );
        
        res.status(200).json({ 
            success: true, 
            data: salaryRecord 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export const getSalaryDetails = async (req, res) => {
    try {
        const { employee_id, month, year } = req.body;
        
        if (!employee_id || !month || !year) {
            return res.status(400).json({
                success: false,
                message: 'employee_id, month, and year are required'
            });
        }

        const salaryRecord = await getSalaryRecord(employee_id, month, year);
        
        if (!salaryRecord) {
            return res.status(404).json({
                success: false,
                message: 'Salary record not found'
            });
        }

        res.status(200).json({ 
            success: true, 
            data: salaryRecord 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export const getMonthlySalaries = async (req, res) => {
    try {
        const { month, year } = req.body;
        
        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'month and year are required'
            });
        }

        const salaryRecords = await getAllSalaryRecords(month, year);
        res.status(200).json({ 
            success: true, 
            data: salaryRecords 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export const updatePaymentStatus = async (req, res) => {
    try {
        const { record_id, status } = req.body;
        
        if (!record_id || !status) {
            return res.status(400).json({
                success: false,
                message: 'record_id and status are required'
            });
        }

        if (!['Pending', 'Paid', 'Cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be Pending, Paid, or Cancelled'
            });
        }

        const updatedRecord = await updateSalaryStatus(record_id, status);
        res.status(200).json({ 
            success: true, 
            data: updatedRecord 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
