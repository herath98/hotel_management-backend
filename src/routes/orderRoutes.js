import express from 'express';
import { getAllOrders, createOrder, viewOrder, updateOrder, deleteOrder } from '../controllers/orderController.js';

const router = express.Router();

/**
 * @swagger
 * /order/create:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
  *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - totalPrice
 *               - status
 *               - roomNumber
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               totalPrice:
 *                 type: number
 *               status:
 *                 type: string
 *               roomNumber:
 *                 type: string
 *               specialNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/order/create', createOrder)
/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
  *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 */
router.get('/orders', getAllOrders);

/**
 * @swagger
 * /order/view:
 *   post:
 *     summary: View a specific order
 *     tags: [Orders]
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
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post('/order/view', viewOrder);

/**
 * @swagger
 * /order/update:
 *   post:
 *     summary: Update an order
 *     tags: [Orders]
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
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               totalPrice:
 *                 type: number
 *               status:
 *                 type: string
 *               roomNumber:
 *                 type: string
 *               specialNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post('/order/update', updateOrder);

/**
 * @swagger
 * /order/delete:
 *   post:
 *     summary: Delete an order
 *     tags: [Orders]
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
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post('/order/delete', deleteOrder);

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               quantity:
 *                 type: integer
 *         totalPrice:
 *           type: number
 *         status:
 *           type: string
 *         roomNumber:
 *           type: string
 *         specialNotes:
 *           type: string
 */

export default router;