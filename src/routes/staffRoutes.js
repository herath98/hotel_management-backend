import express from 'express';
const router = express.Router();
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from '../controllers/staffController.js';

import {  createStaffValidationRules,
  updateStaffValidationRules} from '../validation/staffBodyValidation.js';
import { verifyUser, requireRole } from '../middleware/validationMiddleware.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Staff:
 *       type: object
 *       required:
 *         - user_id
 *         - department
 *         - salary
 *         - performance_score
 *         - shift
 *         - joined_date
 *         - email
 *         - phone
 *       properties:
 *         user_id:
 *           type: integer
 *           description: The ID of the user associated with this staff member.
 *         department:
 *           type: string
 *           description: The department the staff member belongs to.
 *         status:
 *           type: string
 *           default: "active"
 *           description: The status of the staff member.
 *         salary:
 *           type: number
 *           format: decimal
 *           description: The salary of the staff member.
 *         performance_score:
 *           type: number
 *           format: decimal
 *           description: The performance score of the staff member.
 *         shift:
 *           type: string
 *           description: The shift the staff member works.
 *         joined_date:
 *           type: string
 *           format: date-time
 *           description: The date the staff member joined.
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the staff member.
 *         phone:
 *           type: string
 *           description: The phone number of the staff member.
 */





/**
 * @swagger
 * /staff:
 *   post:
 *     summary: Create a new staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       201:
 *         description: The staff member was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       500:
 *         description: Some server error
 */
router.post('/staff', createStaffValidationRules,  verifyUser, requireRole(['admin', 'manager']), createStaff);

/**
 * @swagger
 * /staff:
 *   get:
 *     summary: Returns the list of all the staff members
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the staff members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Staff'
 */
router.get('/staff', verifyUser, requireRole(['admin', 'manager']), getAllStaff);

/**
 * @swagger
 * /staff/{id}:
 *   get:
 *     summary: Get the staff member by id
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The staff member id
 *     responses:
 *       200:
 *         description: The staff member description by id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       404:
 *         description: The staff member was not found
 */
router.get('/staff/:id', verifyUser, requireRole(['admin', 'manager']), getStaffById);

/**
 * @swagger
 * /staff/update/{id}:
 *   post:
 *     summary: Update a staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The staff member id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       200:
 *         description: The staff member was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       404:
 *         description: The staff member was not found
 *       500:
 *         description: Some server error
 */
router.post('/staff/update/:id',  verifyUser, requireRole(['admin', 'manager']),updateStaffValidationRules, updateStaff);

/**
 * @swagger
 * /staff/delete/{id}:
 *   post:
 *     summary: Delete a staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The staff member id
 *     responses:
 *       204:
 *         description: The staff member was successfully deleted
 *       404:
 *         description: The staff member was not found
 *       500:
 *         description: Some server error
 */
router.post('/staff/update/:id', updateStaffValidationRules,  verifyUser, requireRole(['admin', 'manager']), updateStaff);

/**
 * @swagger
 * /staff/delete/{id}:
 *   post:
 *     summary: Delete a staff member
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The staff member id
 *     responses:
 *       204:
 *         description: The staff member was successfully deleted
 *       404:
 *         description: The staff member was not found
 *       500:
 *         description: Some server error
 */
router.post('/staff/delete/:id', deleteStaff);

export default router;
