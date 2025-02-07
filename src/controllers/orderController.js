import { getAllOrdersDB, getOrderByIdDB, createOrderDB, updateOrderStatusDB, deleteOrderDB } from '../models/OrderModel.js';
import pool from '../config/database.js';

export const getAllOrders = async (req, res) => {
    try {
        const orders = await getAllOrdersDB();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await getOrderByIdDB(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { items, totalPrice, status, roomNumber, specialNotes } = req.body;

        // Validate that items is a valid JSON array
        if (!Array.isArray(items)) {
            return res.status(400).json({ message: 'Invalid input: items must be a JSON array' });
        }

        const newOrder = await createOrderDB({ items, totalPrice, status, roomNumber, specialNotes });
        res.status(201).json({ message: 'Order created successfully', newOrder });
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const updatedOrder = await updateOrderStatusDB(req.params.id, req.body.status);
        if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order status updated successfully', updatedOrder });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order', error: error.message });
    }
};

export const viewOrder = async (req, res) => {
    try {
        const { id } = req.body;
        const order = await getOrderByIdDB(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const { id, status, totalPrice, items, roomNumber, specialNotes } = req.body;
        const result = await pool.query(
            'UPDATE orders SET status = $1, total_price = $2, items = $3::jsonb, room_number = $4, special_notes = $5 WHERE id = $6 RETURNING *',
            [status, totalPrice, JSON.stringify(items), roomNumber, specialNotes, id]
        );
        if (!result.rows[0]) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order updated successfully', order: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order', error: error.message });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.body;
        const deletedOrder = await deleteOrderDB(id);
        if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted successfully', deletedOrder });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
};