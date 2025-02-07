import cron from 'node-cron';
import pool from '../config/database.js';

// Schedule a cron job to check and update task statuses every minute
cron.schedule('* * * * *', async () => {
  try {
    const query = `
      UPDATE housekeeping_tasks
      SET task_status = 'Incomplete'
      WHERE end_time <= NOW() AND task_status != 'Complete'`;
    const result = await pool.query(query);
    console.log(`Updated ${result.rowCount} tasks to 'Incomplete'`);
  } catch (err) {
    console.error('Error updating task statuses:', err);
  }
});
