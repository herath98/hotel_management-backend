import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createRoom, updateRoomDetails, getRoomAvailability, getRoomNotCleaned, updateRoomByStatus, deleteRoomById, getRoomUsingId, getBookedRoomsList,viewAllRooms, deleteMultipleRooms, updateRoomStatusBulkController } from '../controllers/roomController.js';
import { deleteRoomImage} from '../models/roomModel.js';
import { verifyUser, requireRole } from '../middleware/validationMiddleware.js';

const router = express.Router();
// Create upload directory if it doesn't exist
const uploadDir = 'uploads/rooms';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Double-check directory exists before saving
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 5 // Maximum 5 files
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       required:
 *         - room_number
 *         - room_type
 *         - capacity
 *         - bed_type
 *         - room_size
 *         - base_price
 *       properties:
 *         room_number:
 *           type: string
 *           description: Unique room identifier
 *         room_type:
 *           type: string
 *           description: Type of room (e.g., Standard, Deluxe, Suite)
 *         status:
 *           type: string
 *           enum: [Available, Occupied, Maintenance, 'Available Not Cleaned']
 *           default: Available
 *         capacity:
 *           type: integer
 *           description: Maximum number of guests
 *         bed_type:
 *           type: string
 *           description: Type of bed (e.g., King, Queen, Twin)
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *           description: List of room amenities
 *         room_size:
 *           type: string
 *           description: Size of the room in square feet/meters
 *         view_type:
 *           type: string
 *           description: Type of view from the room
 *         floor_number:
 *           type: integer
 *           description: Floor number of the room
 *         description:
 *           type: string
 *           description: Detailed room description
 *         image_urls:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs of room images
 *         room_category:
 *           type: string
 *           description: Category of the room
 *         maintenance_status:
 *           type: string
 *           enum: [Operational, Under Maintenance, Needs Inspection]
 *           default: Operational
 *         is_smoking:
 *           type: boolean
 *           description: Whether smoking is allowed
 *         base_price:
 *           type: number
 *           description: Standard room rate
 *         seasonal_pricing:
 *           type: object
 *           description: Special rates for different seasons
 *         tax_rate:
 *           type: number
 *           description: Applicable tax rate
 *         discount_rules:
 *           type: object
 *           description: Applicable discount rules
 */

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Add a new room
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: images
 *         type: array
 *         items:
 *           type: file
 *         description: Room images (max 5)
 *         required: false
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Missing required field: room_number"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post('/rooms', 
    verifyUser, 
    requireRole(['admin', 'manager']), 
    upload.array('images', 5),
    handleMulterError,
    createRoom
  );
  
/**
 * @swagger
 * /rooms/bulk/delete:
 *   post:
 *     summary: Delete multiple rooms by IDs
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of room IDs to delete
 *     responses:
 *       200:
 *         description: Rooms deleted successfully
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
 *                     $ref: '#/components/schemas/Room'
 *       400:
 *         description: Bad request - missing or invalid IDs
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: No rooms found with provided IDs
 *       500:
 *         description: Internal server error
 */
router.post('/rooms/bulk/delete', verifyUser, requireRole(['admin', 'manager']), deleteMultipleRooms);

/**
 * @swagger
 * /rooms/bulk/status:
 *   post:
 *     summary: Update status for multiple rooms
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *               - status
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of room IDs to update
 *               status:
 *                 type: string
 *                 description: The new status to set for the rooms
 *     responses:
 *       200:
 *         description: Rooms status updated successfully
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
 *                     $ref: '#/components/schemas/Room'
 *       400:
 *         description: Bad request - missing or invalid IDs or status
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post('/rooms/bulk/status',
  verifyUser,
  requireRole(['admin', 'manager']),
  updateRoomStatusBulkController
);
  
/**
 * @swagger
 * /rooms/view:
 *   post:
 *     summary: Get a room by ID
 *     tags:
 *       - Rooms
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
 *                 description: Room ID to retrieve
 *     responses:
 *       200:
 *         description: Room retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
router.post('/rooms/view', verifyUser, requireRole(['admin', 'manager', 'staff']), getRoomUsingId);

/**
 * @swagger
 * /rooms/update:
 *   post:
 *     summary: Update room details
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Room'
 *               - type: object
 *                 required:
 *                   - id
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Room ID
 *     responses:
 *       200:
 *         description: Room updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       400:
 *         description: Bad request - missing room ID
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
router.post('/rooms/update',
    verifyUser,
    requireRole(['admin', 'manager']),
    upload.array('images', 5),
    handleMulterError,
    updateRoomDetails
  );

/**
 * @swagger
 * /rooms/availability:
 *   get:
 *     summary: Get available rooms
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available rooms
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
 *                     $ref: '#/components/schemas/Room'
 *       500:
 *         description: Internal server error
 */
router.get('/rooms/availability', verifyUser, requireRole(['admin', 'manager']), getRoomAvailability);
/**
 * @swagger
 * /rooms/all/list:
 *   get:
 *     summary: Get all rooms
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all rooms
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
 *                     $ref: '#/components/schemas/Room'
 *       500:
 *         description: Internal server error
 */
router.get('/rooms/all/list', verifyUser, requireRole(['admin', 'manager']), viewAllRooms);

/**
 * @swagger
 * /rooms/not_cleaned/list:
 *   get:
 *     summary: Get rooms that need cleaning
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rooms needing cleaning
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
 *                     $ref: '#/components/schemas/Room'
 *       500:
 *         description: Internal server error
 */
router.get('/rooms/not_cleaned/list', verifyUser, requireRole(['admin', 'manager']), getRoomNotCleaned);
/**
 * @swagger
 * /rooms/booking/list:
 *   get:
 *     summary: Get rooms booked
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rooms needing cleaning
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
 *                     $ref: '#/components/schemas/Room'
 *       500:
 *         description: Internal server error
 */
router.get('/rooms/booking/list', verifyUser, requireRole(['admin', 'manager']), getBookedRoomsList);

/**
 * @swagger
 * /rooms/status:
 *   post:
 *     summary: Update room status
 *     tags:
 *       - Rooms
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
 *               - status
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Room ID
 *               status:
 *                 type: string
 *                 enum: [Available, Occupied, Maintenance, 'Available Not Cleaned']
 *                 description: New room status
 *     responses:
 *       200:
 *         description: Room status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
router.post('/rooms/status', verifyUser, requireRole(['admin']), updateRoomByStatus);

/**
 * @swagger
 * /rooms/delete:
 *   post:
 *     summary: Delete a room
 *     tags:
 *       - Rooms
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
 *                 description: Room ID to delete
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
router.post('/rooms/delete', verifyUser, requireRole(['admin', 'manager']), deleteRoomById);

router.post('/rooms/delete-image',
  verifyUser,
  requireRole(['admin', 'manager']),
  deleteRoomImage
);
/**
 * @swagger
 * /rooms/getall:
 *   get:
 *     summary: Get all rooms
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all rooms
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
 *                     $ref: '#/components/schemas/Room'
 *       500:
 *         description: Internal server error
 */
router.get('/rooms/getall', verifyUser, requireRole(['admin', 'manager']), viewAllRooms);

export default router;
