// routes/guestRoutes.js
import express from 'express';
import {
    viewGuestProfile,
  createGuestProfile,
  updateGuestProfile,
  deleteGuestProfile,
  listGuestProfiles
} from '../controllers/guestController.js';
import { verifyUser, requireRole } from '../middleware/validationMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /guests/list:
 *   get:
 *     summary: Get all guests
 *     description: Retrieve a list of all guest profiles
 *     tags:
 *       - Guest
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of guests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       contact:
 *                         type: string
 *                       preferences:
 *                         type: object
 *                       stay_history:
 *                         type: object
 *                       loyalty_points:
 *                         type: integer
 *                       dietary_needs:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get('/guests/list',verifyUser,requireRole(['admin','manager']),listGuestProfiles);

/**
 * @swagger
 * /guest/view:
 *   post:
 *     summary: View a guest profile
 *     description: Retrieve a specific guest's details using their ID
 *     tags:
 *       - Guest
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Guest profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     contact:
 *                       type: string
 *                     preferences:
 *                       type: object
 *                     stay_history:
 *                       type: object
 *                     loyalty_points:
 *                       type: integer
 *                     dietary_needs:
 *                       type: string
 *       400:
 *         description: Missing guest ID
 *       404:
 *         description: Guest not found
 *       500:
 *         description: Server error
 */
router.post('/guest/view',verifyUser,requireRole(['admin','manager']),viewGuestProfile);

/**
 * @swagger
 * /guest/create:
 *   post:
 *     summary: Create a new guest profile
 *     description: Add a new guest to the system
 *     tags:
 *       - Guest
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - contact
 *             properties:
 *               name:
 *                 type: string
 *               contact:
 *                 type: string
 *               preferences:
 *                 type: object
 *               stay_history:
 *                 type: object
 *               loyalty_points:
 *                 type: integer
 *               dietary_needs:
 *                 type: string
 *     responses:
 *       201:
 *         description: Guest created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 contact:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/guest/create', verifyUser,requireRole(['admin','manager']),createGuestProfile);

/**
 * @swagger
 * /guest/update:
 *   post:
 *     summary: Update a guest profile
 *     description: Update an existing guest's information
 *     tags:
 *       - Guest
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               contact:
 *                 type: string
 *               preferences:
 *                 type: object
 *               stay_history:
 *                 type: object
 *               loyalty_points:
 *                 type: integer
 *               dietary_needs:
 *                 type: string
 *     responses:
 *       200:
 *         description: Guest updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 contact:
 *                   type: string
 *       400:
 *         description: Missing guest ID
 *       404:
 *         description: Guest not found
 *       500:
 *         description: Server error
 */
router.post('/guest/update',verifyUser,requireRole(['admin','manager']), updateGuestProfile);

/**
 * @swagger
 * /guest/delete:
 *   post:
 *     summary: Delete a guest profile
 *     description: Remove a guest from the system
 *     tags:
 *       - Guest
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Guest deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 guest:
 *                   type: object
 *       400:
 *         description: Missing guest ID
 *       404:
 *         description: Guest not found
 *       500:
 *         description: Server error
 */
router.post('/guest/delete', verifyUser,requireRole(['admin','manager']),deleteGuestProfile);

export default router;