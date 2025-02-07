import pool from '../config/database.js';

export const createTask = async (task) => {
    const { room_id, task_name, task_status, scheduled_date, start_time, end_time, assigned_to } = task;
    
    try {
        // Verify that room_id exists
        const roomCheck = await pool.query('SELECT id FROM rooms WHERE id = $1', [room_id]);
        if (roomCheck.rows.length === 0) {
            throw new Error('Invalid room_id: Room does not exist');
        }

        // Verify that assigned_to user exists
        const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [assigned_to]);
        if (userCheck.rows.length === 0) {
            throw new Error('Invalid assigned_to: User does not exist');
        }

        // Convert date and times to proper timestamp with timezone
        const startTimestamp = start_time.includes('T') 
            ? start_time 
            : new Date(`${scheduled_date}T${start_time}`).toISOString();
        const endTimestamp = end_time.includes('T') 
            ? end_time 
            : new Date(`${scheduled_date}T${end_time}`).toISOString();
        
        // Add manual_status_override flag
        const query = `
          INSERT INTO housekeeping_tasks 
            (room_id, task_name, task_status, scheduled_date, start_time, end_time, assigned_to, manual_status_override)
          VALUES 
            ($1, $2, $3, $4, $5, $6, $7, false)
          RETURNING *`;
        
        const values = [
            room_id,
            task_name,
            task_status || 'Pending',
            scheduled_date,
            startTimestamp,
            endTimestamp,
            assigned_to
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

export const getTasks = async () => {
    const query = `
        SELECT 
            ht.*,
            u.username as assigned_to_name
        FROM 
            housekeeping_tasks ht
        LEFT JOIN 
            users u ON ht.assigned_to = u.id
        ORDER BY 
            scheduled_date ASC, start_time ASC`;
    const result = await pool.query(query);
    return result.rows;
};

export const getTasksByAssignedTo = async (userId) => {
    const query = `
        SELECT 
            ht.*,
            u.username as assigned_to_name
        FROM 
            housekeeping_tasks ht
        LEFT JOIN 
            users u ON ht.assigned_to = u.id
        WHERE 
            ht.assigned_to = $1
        ORDER BY 
            scheduled_date ASC, start_time ASC`;
    const values = [userId];
    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error in getTasksByAssignedTo:', error);
        throw error;
    }
};

export const updateTaskStatus = async (id, status, isManualUpdate = true) => {
    try {
        // First, check if the task exists and get its current end time
        const checkQuery = 'SELECT end_time FROM housekeeping_tasks WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [id]);
        
        if (checkResult.rows.length === 0) {
            throw new Error('Task not found');
        }

        // Update the task with the new status and set manual_status_override
        const query = `
            UPDATE housekeeping_tasks 
            SET 
                task_status = $1,
                manual_status_override = $2,
                last_manual_update = CASE WHEN $2 = true THEN CURRENT_TIMESTAMP ELSE last_manual_update END
            WHERE id = $3 
            RETURNING *`;
            
        const values = [status, isManualUpdate, id];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating task status:', error);
        throw error;
    }
};

export const updateTask = async (id, updates) => {
    const { task_name, task_status, scheduled_date, start_time, end_time, assigned_to } = updates;
    let query = 'UPDATE housekeeping_tasks SET ';
    const values = [];
    let i = 1;
    
    if (task_name) {
        query += `task_name = $${i}, `;
        values.push(task_name);
        i++;
    }
    if (task_status) {
        query += `task_status = $${i}, `;
        values.push(task_status);
        i++;
    }
    if (scheduled_date) {
        query += `scheduled_date = $${i}, `;
        values.push(scheduled_date);
        i++;
    }
    if (start_time) {
        const startTimestamp = start_time.includes('T') 
            ? start_time 
            : new Date(`${scheduled_date || updates.scheduled_date}T${start_time}`).toISOString();
        query += `start_time = $${i}, `;
        values.push(startTimestamp);
        i++;
    }
    if (end_time) {
        const endTimestamp = end_time.includes('T') 
            ? end_time 
            : new Date(`${scheduled_date || updates.scheduled_date}T${end_time}`).toISOString();
        query += `end_time = $${i}, `;
        values.push(endTimestamp);
        i++;
    }
    if (assigned_to) {
        query += `assigned_to = $${i}, `;
        values.push(assigned_to);
        i++;
    }
    
    query = query.slice(0, -2); // remove trailing comma and space
    query += ` WHERE id = $${i} RETURNING *`;
    values.push(id);
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
};

export const updateExpiredTasks = async () => {
    try {
        const query = `
            UPDATE housekeeping_tasks
            SET 
                task_status = 'Incomplete',
                manual_status_override = false
            WHERE 
                end_time < CURRENT_TIMESTAMP 
                AND task_status NOT IN ('Completed', 'Cancelled')
                AND (
                    manual_status_override = false 
                    OR (CURRENT_TIMESTAMP - last_manual_update) > interval '24 hours'
                )
            RETURNING *`;
            
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error updating expired tasks:', error);
        throw error;
    }
};
export const deleteTask = async (taskId) => {
    try {
        const query = `
            DELETE FROM housekeeping_tasks
            WHERE id = $1
            RETURNING *`;
            
        const values = [taskId];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
};