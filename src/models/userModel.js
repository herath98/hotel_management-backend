// src/models/userModel.js
import pool from '../config/database.js';

export const createUser = async (username, firstName, lastName, email, hashedPassword, role, mobile, address) => {
    const query = 'INSERT INTO users (username, firstName, lastName, email, password, role, mobile, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
    const values = [username, firstName, lastName, email, hashedPassword, role, mobile, address];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const findUserByUsername = async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    const { rows } = await pool.query(query, [username]);
    return rows[0];
};


export const findUserById = async (userId) => {
    const query = 'SELECT * FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, role } = req.body;
    
    // Only admin can update to admin role
    if (role === 'admin' && req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Only admins can assign admin role' });
    }

    try {
        const result = await pool.query(
            'UPDATE users SET username = $1, role = $2 WHERE id = $3 RETURNING *',
            [username, role, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
};


export const getAllUsersFromDB = async () => {
    const query = 'SELECT id, username, role , firstName , lastName , email , mobile , address  FROM users';
    const { rows } = await pool.query(query);
    return rows;
};

export const deleteUserById = async (id) => {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
};

export const getReportsData = async () => {
    const query = `
        SELECT 
            u.role,
            COUNT(*) as user_count,
            MAX(u.created_at) as latest_activity
        FROM users u
        GROUP BY u.role
    `;
    const { rows } = await pool.query(query);
    return rows;
};

export const getStaffData = async () => {
    const query = `
        SELECT 
            id,
            username,
            role,
            created_at,
            last_login
        FROM users 
        WHERE role = 'staff'
    `;
    const { rows } = await pool.query(query);
    return rows;
};

export const updateUserInDB = async (id, username, role, firstName, lastName, email, mobile, address) => {
    const query = `
        UPDATE users 
        SET 
            username = COALESCE($1, username),
            role = COALESCE($2, role),
            firstName = COALESCE($3, firstName),
            lastName = COALESCE($4, lastName),
            email = COALESCE($5, email),
            mobile = COALESCE($6, mobile),
            address = COALESCE($7, address),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $8 
        RETURNING id, username, role, firstName, lastName, email, mobile, address
    `;
    const { rows } = await pool.query(query, [username, role, firstName, lastName, email, mobile, address, id]);
    return rows[0];
};

export const getAllManagersFromDB = async () => {
    const query = `SELECT * FROM users WHERE role = 'manager'`;
    const { rows } = await pool.query(query);
    return rows;
};
export const getAllStaffFromDB = async () => {
    const query = `SELECT * FROM users WHERE role = 'staff'`;
    const { rows } = await pool.query(query);
    return rows;
};

export const changePassword = async (userId, newHashedPassword) => {
    const query = `UPDATE users SET password = $1 WHERE id = $2`;
    await pool.query(query, [newHashedPassword, userId]);
};
export const getUserById = async (userId) => {
    const query = 'SELECT * FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
};
