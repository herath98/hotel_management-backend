// routes/bookingRoutes.js
import express from 'express';
import { 
    createBooking, 
    updateBooking, 
    getBookingList,
    getBookingById,
    updateBookingStatus
} from '../controllers/bookingController.js';
import { verifyUser, requireRole } from '../middleware/validationMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /booking/list:
 *   get:
 *     summary: Get a list of all bookings
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter bookings by status
 *     tags:
 *       - Booking
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of bookings
 */
router.get('/booking/list', verifyUser, requireRole(['admin', 'manager']),getBookingList);

/**
 * @swagger
 * /booking/view/{bookingId}:
 *   get:
 *     summary: Get a booking by ID
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         description: ID of the booking to retrieve
 *         schema:
 *           type: string
 *     tags:
 *       - Booking
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the booking
 *       404:
 *         description: Booking not found
 */
router.get('/booking/view/:bookingId', verifyUser,requireRole(['admin', 'manager','guest']),getBookingById);

/**
 * @swagger
 * /booking/create:
 *   post:
 *     summary: Create a new booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               roomId:
 *                 type: string
 *               checkInDate:
 *                 type: string
 *                 format: date
 *               checkOutDate:
 *                 type: string
 *                 format: date
 *               email:
 *                 type: string
 *               status:
 *                 type: string
 *                 example: "Confirmed"
 *     tags:
 *       - Booking
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post('/booking/create', verifyUser,requireRole(['admin', 'manager','guest']),createBooking);

/**
 * @swagger
 * /booking/update:
 *   post:
 *     summary: Update an existing booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['bookingId', 'checkInDate', 'checkOutDate', 'status']
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 example: 12
 *               checkInDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-11"
 *               checkOutDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-11"
 *               status:
 *                 type: string
 *                 example: "string"
 *     tags:
 *       - Booking
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking updated successfully
 */
router.post('/booking/update', verifyUser, requireRole(['admin', 'manager', 'guest']), updateBooking);

/**
 * @swagger
 * /booking/status/change:
 *   post:
 *     summary: Update booking status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['bookingId', 'status']
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 example: 12
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed]
 *                 example: "pending"
 *     tags:
 *       - Booking
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 */
router.post('/booking/status/change', verifyUser, requireRole(['admin', 'manager', 'guest']), updateBookingStatus);


export default router;