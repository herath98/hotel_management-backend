// routes/menuRoutes.js
import express from 'express';
import MenuController from '../controllers/menuController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MenuItem:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the menu item
 *         name:
 *           type: string
 *           description: Name of the menu item
 *         description:
 *           type: string
 *           description: Description of the menu item
 *         price:
 *           type: number
 *           format: decimal
 *           description: Price of the menu item
 *         category:
 *           type: string
 *           description: Category of the menu item
 *         is_available:
 *           type: boolean
 *           description: Availability status of the menu item
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /menu/items:
 *   post:
 *     summary: Create a new menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItem'
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Invalid input data
 */
router.post('/menu/items', MenuController.createMenu);

/**
 * @swagger
 * /menu/items:
 *   get:
 *     summary: Get all menu items
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MenuItem'
 */
router.get('/menu/items', MenuController.listMenus);

/**
 * @swagger
 * /menu/items/update:
 *   post:
 *     summary: Update a menu item
 *     tags: [Menu]
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
 *                 description: ID of the menu item to update
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               is_available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MenuItem'
 *       404:
 *         description: Menu item not found
 */
router.post('/menu/items/update', async (req, res) => {
    const { id, ...updateData } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }
    return MenuController.updateMenu({ params: { id }, body: updateData }, res);
});

/**
 * @swagger
 * /menu/items/delete:
 *   post:
 *     summary: Delete a menu item
 *     tags: [Menu]
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
 *                 description: ID of the menu item to delete
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 *       404:
 *         description: Menu item not found
 */
router.post('/menu/items/delete', async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }
    return MenuController.deleteMenu({ params: { id } }, res);
});

export default router;