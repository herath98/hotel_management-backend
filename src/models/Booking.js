// models/Booking.js
import pool from '../config/database.js';

export const checkRoomAvailability = async (roomId) => {
    const query = 'SELECT status FROM rooms WHERE id = $1';
    const { rows } = await pool.query(query, [roomId]);
    return rows[0]?.status === 'Available';
};

export const createBookingInDB = async (bookingData) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const isAvailable = await checkRoomAvailability(bookingData.roomId);
        if (!isAvailable) {
            throw new Error('Room is not available for booking');
        }
        
        const { userId, roomId, checkInDate, checkOutDate, email, status } = bookingData;
        const bookingQuery = `
            INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, email, status)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
        const bookingValues = [userId, roomId, checkInDate, checkOutDate, email, status];
        const bookingResult = await client.query(bookingQuery, bookingValues);
        
        const roomQuery = `
            UPDATE rooms 
            SET status = 'Unavailable',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 
            RETURNING *;
        `;
        await client.query(roomQuery, [roomId]);
        
        await client.query('COMMIT');
        return bookingResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const updateBookingInDB = async (bookingId, updateData) => {
    const { checkInDate, checkOutDate, status } = updateData;
    const query = `
        UPDATE bookings 
        SET check_in_date = $1, 
            check_out_date = $2, 
            status = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 RETURNING *;
    `;
    const values = [checkInDate, checkOutDate, status, bookingId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const getBookingListFromDB = async (status = null) => {
    let query = 'SELECT * FROM bookings';
    const values = [];

    if (status) {
        query += ' WHERE status = $1';
        values.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { rows } = await pool.query(query, values);
    return rows;
};

export const getBookingByIdFromDB = async (bookingId) => {
    const query = 'SELECT * FROM bookings WHERE id = $1';
    const { rows } = await pool.query(query, [bookingId]);
    return rows[0];
};

export const updateBookingStatusInDB = async (bookingId, status) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const getBookingQuery = 'SELECT room_id FROM bookings WHERE id = $1';
        const bookingResult = await client.query(getBookingQuery, [bookingId]);
        const booking = bookingResult.rows[0];
        
        if (!booking) {
            throw new Error('Booking not found');
        }
        
        const bookingQuery = `
            UPDATE bookings 
            SET status = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 
            RETURNING *;
        `;
        const bookingUpdateResult = await client.query(bookingQuery, [status, bookingId]);
        
        if (status === 'cancelled') {
            const roomQuery = `
                UPDATE rooms 
                SET status = 'Available',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1 
                RETURNING *;
            `;
            await client.query(roomQuery, [booking.room_id]);
        }
        
        await client.query('COMMIT');
        return bookingUpdateResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};


// CREATE TABLE bookings (
//     id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
//     user_id INT NOT NULL, -- User ID who made the booking
//     room_id INT NOT NULL, -- Room ID being booked
//     check_in_date DATE NOT NULL, -- Check-in date
//     check_out_date DATE NOT NULL, -- Check-out date
//     email VARCHAR(255) NOT NULL, -- Email of the user for notifications
//     status VARCHAR(50) NOT NULL DEFAULT 'pending', -- Booking status
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for when the booking was created
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp for the last update
// );
