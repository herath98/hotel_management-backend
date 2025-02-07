// models/payrollModel.js
import pool from '../config/database.js';

export const calculateSalary = async (employeeId, month, year, providedHourlyRate = null, providedBaseSalary = 0) => {
    try {
        // Get hourly rate from employee details if not provided
        let hourly_rate = providedHourlyRate;
        if (hourly_rate === null) {
            const employeeQuery = `
                SELECT hourly_rate, base_salary 
                FROM users 
                WHERE id = $1`;
            const employeeResult = await pool.query(employeeQuery, [employeeId]);
            
            if (employeeResult.rows.length === 0) {
                throw new Error('Employee not found');
            }

            hourly_rate = employeeResult.rows[0].hourly_rate;
            if (providedBaseSalary === 0) {
                providedBaseSalary = employeeResult.rows[0].base_salary || 0;
            }
        }

        // Get all completed tasks and their hours for the month
        const tasksQuery = `
            SELECT 
                id,
                start_time,
                end_time,
                EXTRACT(EPOCH FROM (end_time - start_time))/3600 as hours_worked
            FROM housekeeping_tasks
            WHERE 
                assigned_to = $1 
                AND EXTRACT(MONTH FROM scheduled_date) = $2
                AND EXTRACT(YEAR FROM scheduled_date) = $3
                AND task_status = 'Complete'`;

        const tasksResult = await pool.query(tasksQuery, [employeeId, month, year]);
        
        // Calculate total hours from completed tasks
        const totalHours = tasksResult.rows.reduce((sum, task) => sum + parseFloat(task.hours_worked), 0);
        
        // Get task details for the salary record
        const completedTasks = tasksResult.rows.map(task => ({
            task_id: task.id,
            hours: parseFloat(task.hours_worked)
        }));

        // Calculate overtime (assuming standard 160 hours per month)
        const standardHours = 160;
        const overtimeHours = Math.max(0, totalHours - standardHours);
        const regularHours = Math.min(totalHours, standardHours);
        
        // Calculate salary components
        const regularPay = (hourly_rate * regularHours) + providedBaseSalary;
        const overtimePay = (hourly_rate * 1.5) * overtimeHours;
        const totalSalary = regularPay + overtimePay;

        // Store salary record with task details
        const insertQuery = `
            INSERT INTO salary_records (
                employee_id,
                month,
                year,
                regular_hours,
                overtime_hours,
                regular_pay,
                overtime_pay,
                total_salary,
                completed_tasks,
                status,
                base_salary,
                applied_hourly_rate,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *`;

        const values = [
            employeeId,
            month,
            year,
            regularHours,
            overtimeHours,
            regularPay,
            overtimePay,
            totalSalary,
            JSON.stringify(completedTasks),
            'Pending',
            providedBaseSalary,
            hourly_rate
        ];

        const result = await pool.query(insertQuery, values);
        
        // Add detailed breakdown to the response
        const salaryRecord = result.rows[0];
        salaryRecord.breakdown = {
            completed_tasks: completedTasks,
            total_hours: totalHours,
            regular_hours: regularHours,
            overtime_hours: overtimeHours,
            hourly_rate: hourly_rate,
            base_salary: providedBaseSalary,
            regular_pay: regularPay,
            overtime_pay: overtimePay,
            total_salary: totalSalary
        };

        return salaryRecord;
    } catch (error) {
        throw error;
    }
};

export const getSalaryRecord = async (employeeId, month, year) => {
    const query = `
        SELECT 
            sr.*,
            u.username,
            u.email,
            u.hourly_rate,
            u.base_salary as default_base_salary
        FROM salary_records sr
        JOIN users u ON sr.employee_id = u.id
        WHERE sr.employee_id = $1 
        AND sr.month = $2 
        AND sr.year = $3`;
    
    const result = await pool.query(query, [employeeId, month, year]);
    return result.rows[0];
};

export const getAllSalaryRecords = async (month, year) => {
    const query = `
        SELECT 
            sr.*,
            u.username,
            u.email,
            u.hourly_rate as default_hourly_rate,
            u.base_salary as default_base_salary
        FROM salary_records sr
        JOIN users u ON sr.employee_id = u.id
        WHERE sr.month = $1 
        AND sr.year = $2
        ORDER BY sr.employee_id`;
    
    const result = await pool.query(query, [month, year]);
    return result.rows;
};

export const updateSalaryStatus = async (recordId, status) => {
    const query = `
        UPDATE salary_records
        SET 
            status = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *`;
    
    const result = await pool.query(query, [status, recordId]);
    return result.rows[0];
};


// SELECT id, username, hourly_rate 
// FROM users 
// WHERE id = 1;  -- replace with an actual user id


// UPDATE users 
// SET hourly_rate = 15.00  -- replace with actual hourly rate
// WHERE id = 1;  -- replace with actual user id