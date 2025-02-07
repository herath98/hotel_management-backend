// routes/payrollRoutes.js
import express from 'express';
import { generateSalary, getSalaryDetails, getMonthlySalaries, updatePaymentStatus } from '../controllers/payrollController.js';
import { verifyUser, requireRole } from '../middleware/validationMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SalaryRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The salary record ID
 *         employee_id:
 *           type: integer
 *           description: The employee's ID
 *         month:
 *           type: integer
 *           description: Month of the salary record (1-12)
 *         year:
 *           type: integer
 *           description: Year of the salary record
 *         regular_hours:
 *           type: number
 *           format: float
 *           description: Regular hours worked
 *         overtime_hours:
 *           type: number
 *           format: float
 *           description: Overtime hours worked
 *         regular_pay:
 *           type: number
 *           format: float
 *           description: Regular pay amount
 *         overtime_pay:
 *           type: number
 *           format: float
 *           description: Overtime pay amount
 *         total_salary:
 *           type: number
 *           format: float
 *           description: Total salary amount
 *         status:
 *           type: string
 *           enum: [Pending, Paid, Cancelled]
 *           description: Payment status
 *         base_salary:
 *           type: number
 *           format: float
 *           description: Base salary amount
 *         applied_hourly_rate:
 *           type: number
 *           format: float
 *           description: Hourly rate used for calculation
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Record last update timestamp
 *         breakdown:
 *           type: object
 *           properties:
 *             completed_tasks:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   task_id:
 *                     type: integer
 *                   hours:
 *                     type: number
 *             total_hours:
 *               type: number
 *             regular_hours:
 *               type: number
 *             overtime_hours:
 *               type: number
 *             hourly_rate:
 *               type: number
 *             base_salary:
 *               type: number
 *             regular_pay:
 *               type: number
 *             overtime_pay:
 *               type: number
 *             total_salary:
 *               type: number
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Payroll
 *   description: Payroll management endpoints
 */

/**
 * @swagger
 * /payroll/generate:
 *   post:
 *     summary: Generate salary record for an employee
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - month
 *               - year
 *             properties:
 *               employee_id:
 *                 type: integer
 *                 description: Employee ID
 *               month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 description: Month (1-12)
 *               year:
 *                 type: integer
 *                 minimum: 2000
 *                 maximum: 2100
 *                 description: Year
 *               hourly_rate:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Optional custom hourly rate
 *               base_salary:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Optional base salary
 *     responses:
 *       200:
 *         description: Salary record generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SalaryRecord'
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Server error
 */
router.post('/payroll/generate', verifyUser, requireRole(['admin', 'manager']), generateSalary);

/**
 * @swagger
 * /payroll/details:
 *   post:
 *     summary: Get salary record details
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - month
 *               - year
 *             properties:
 *               employee_id:
 *                 type: integer
 *                 description: Employee ID
 *               month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 description: Month (1-12)
 *               year:
 *                 type: integer
 *                 description: Year
 *     responses:
 *       200:
 *         description: Salary details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SalaryRecord'
 *       404:
 *         description: Salary record not found
 */
router.post('/payroll/details', verifyUser, getSalaryDetails);

/**
 * @swagger
 * /payroll/monthly:
 *   post:
 *     summary: Get all salary records for a specific month
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - month
 *               - year
 *             properties:
 *               month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 description: Month (1-12)
 *               year:
 *                 type: integer
 *                 description: Year
 *     responses:
 *       200:
 *         description: Monthly salary records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SalaryRecord'
 */
router.post('/payroll/monthly', verifyUser, requireRole(['admin', 'manager']), getMonthlySalaries);

/**
 * @swagger
 * /payroll/status:
 *   put:
 *     summary: Update payment status of a salary record
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - record_id
 *               - status
 *             properties:
 *               record_id:
 *                 type: integer
 *                 description: Salary record ID
 *               status:
 *                 type: string
 *                 enum: [Pending, Paid, Cancelled]
 *                 description: New payment status
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SalaryRecord'
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Salary record not found
 */
router.put('/payroll/status', verifyUser, requireRole(['admin', 'manager']), updatePaymentStatus);

export default router;