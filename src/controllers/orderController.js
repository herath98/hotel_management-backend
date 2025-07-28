import {
  createOrderDB,
  getAllOrdersDB,
  getOrderByIdDB,
  updateOrderStatusDB,
  deleteOrderDB,
  updateOrderInDB
} from '../models/OrderModel.js';
import { sendResponse, ResponseStatus } from '../utils/responseHandler.js';

export const getAllOrders = async (req, res) => {
    try {
        const orders = await getAllOrdersDB();
        return sendResponse(res, ResponseStatus.SUCCESS, 'Orders retrieved successfully', orders);
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error fetching orders', null, error.message);
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await getOrderByIdDB(req.params.id);
        if (!order) return sendResponse(res, ResponseStatus.NOT_FOUND, 'Order not found');
        return sendResponse(res, ResponseStatus.SUCCESS, 'Order retrieved successfully', order);
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error fetching order', null, error.message);
    }
};

export const createOrder = async (req, res) => {
    try {
        const { items, totalPrice, status, roomNumber, specialNotes } = req.body;

        // Validate that items is a valid JSON array
        if (!Array.isArray(items)) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, 'Invalid input: items must be a JSON array');
        }

        const newOrder = await createOrderDB({ items, totalPrice, status, roomNumber, specialNotes });
        return sendResponse(res, ResponseStatus.CREATED, 'Order created successfully', newOrder);
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error creating order', null, error.message);
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const updatedOrder = await updateOrderStatusDB(req.params.id, req.body.status);
        if (!updatedOrder) return sendResponse(res, ResponseStatus.NOT_FOUND, 'Order not found');
        return sendResponse(res, ResponseStatus.SUCCESS, 'Order status updated successfully', updatedOrder);
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error updating order', null, error.message);
    }
};

export const viewOrder = async (req, res) => {
    try {
        const { id } = req.body;
        const order = await getOrderByIdDB(id);
        if (!order) return sendResponse(res, ResponseStatus.NOT_FOUND, 'Order not found');
        return sendResponse(res, ResponseStatus.SUCCESS, 'Order retrieved successfully', order);
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error fetching order', null, error.message);
    }
};

export const updateOrder = async (req, res) => {
    try {
        const { id, status, totalPrice, items, roomNumber, specialNotes } = req.body;
        const updatedOrder = await updateOrderInDB(id, {
            status,
            total_price: totalPrice,
            items,
            room_number: roomNumber,
            special_notes: specialNotes,
        });
        if (!updatedOrder) return sendResponse(res, ResponseStatus.NOT_FOUND, 'Order not found');
        return sendResponse(res, ResponseStatus.SUCCESS, 'Order updated successfully', updatedOrder);
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error updating order', null, error.message);
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.body;
        const deletedOrder = await deleteOrderDB(id);
        if (!deletedOrder) return sendResponse(res, ResponseStatus.NOT_FOUND, 'Order not found');
        return sendResponse(res, ResponseStatus.SUCCESS, 'Order deleted successfully', deletedOrder);
    } catch (error) {
        return sendResponse(res, ResponseStatus.SERVER_ERROR, 'Error deleting order', null, error.message);
    }
};
