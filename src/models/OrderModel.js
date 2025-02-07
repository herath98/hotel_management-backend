import pool from '../config/database.js';

export const createOrderDB = async ({ items, totalPrice, status, roomNumber, specialNotes }) => {
    const result = await pool.query(
        'INSERT INTO orders (items, total_price, status, room_number, special_notes) VALUES ($1::jsonb, $2, $3, $4, $5) RETURNING *',
        [JSON.stringify(items), totalPrice, status, roomNumber, specialNotes]
    );
    return result.rows[0];
};

// Add type casting for the getAllOrders query
export const getAllOrdersDB = async () => {
    const result = await pool.query('SELECT *, items::json as items FROM orders');
    return result.rows;
};

// Add type casting for the getOrderById query
export const getOrderByIdDB = async (id) => {
    const result = await pool.query('SELECT *, items::json as items FROM orders WHERE id = $1', [id]);
    return result.rows[0];
};

export const updateOrderStatusDB = async (id, status) => {
    const result = await pool.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
    );
    return result.rows[0];
};

export const deleteOrderDB = async (id) => {
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};