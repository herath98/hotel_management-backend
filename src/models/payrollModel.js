import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const calculateSalary = async (employeeId, month, year, providedHourlyRate = null, providedBaseSalary = 0) => {
    const employee = await prisma.users.findUnique({ where: { id: employeeId } });
    if (!employee) {
        throw new Error('Employee not found');
    }

    const hourly_rate = providedHourlyRate ?? employee.hourly_rate;
    const base_salary = providedBaseSalary === 0 ? employee.base_salary || 0 : providedBaseSalary;

    const tasks = await prisma.housekeeping_tasks.findMany({
        where: {
            assigned_to: employeeId,
            scheduled_date: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
            },
            task_status: 'Complete',
        },
    });

    const totalHours = tasks.reduce((sum, task) => {
        const hours = (task.end_time.getTime() - task.start_time.getTime()) / 3600000;
        return sum + hours;
    }, 0);

    const completedTasks = tasks.map((task) => ({
        task_id: task.id,
        hours: (task.end_time.getTime() - task.start_time.getTime()) / 3600000,
    }));

    const standardHours = 160;
    const overtimeHours = Math.max(0, totalHours - standardHours);
    const regularHours = Math.min(totalHours, standardHours);

    const regularPay = hourly_rate * regularHours + base_salary;
    const overtimePay = hourly_rate * 1.5 * overtimeHours;
    const totalSalary = regularPay + overtimePay;

    const salaryRecord = await prisma.salary_records.create({
        data: {
            employee_id: employeeId,
            month,
            year,
            regular_hours: regularHours,
            overtime_hours: overtimeHours,
            regular_pay: regularPay,
            overtime_pay: overtimePay,
            total_salary: totalSalary,
            completed_tasks: completedTasks,
            status: 'Pending',
            base_salary,
            applied_hourly_rate: hourly_rate,
        },
    });

    salaryRecord.breakdown = {
        completed_tasks: completedTasks,
        total_hours: totalHours,
        regular_hours: regularHours,
        overtime_hours: overtimeHours,
        hourly_rate: hourly_rate,
        base_salary: base_salary,
        regular_pay: regularPay,
        overtime_pay: overtimePay,
        total_salary: totalSalary,
    };

    return salaryRecord;
};

export const getSalaryRecord = async (employeeId, month, year) => {
    return await prisma.salary_records.findFirst({
        where: {
            employee_id: employeeId,
            month,
            year,
        },
        include: {
            users: {
                select: {
                    username: true,
                    email: true,
                    hourly_rate: true,
                    base_salary: true,
                },
            },
        },
    });
};

export const getAllSalaryRecords = async (month, year) => {
    return await prisma.salary_records.findMany({
        where: {
            month,
            year,
        },
        include: {
            users: {
                select: {
                    username: true,
                    email: true,
                    hourly_rate: true,
                    base_salary: true,
                },
            },
        },
        orderBy: {
            employee_id: 'asc',
        },
    });
};

export const updateSalaryStatus = async (recordId, status) => {
    return await prisma.salary_records.update({
        where: { id: recordId },
        data: {
            status,
        },
    });
};


// SELECT id, username, hourly_rate 
// FROM users 
// WHERE id = 1;  -- replace with an actual user id


// UPDATE users 
// SET hourly_rate = 15.00  -- replace with actual hourly rate
// WHERE id = 1;  -- replace with actual user id
