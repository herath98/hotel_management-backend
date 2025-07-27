import cron from 'node-cron';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// Schedule a cron job to check and update task statuses every minute
cron.schedule('* * * * *', async () => {
  try {
    const result = await prisma.housekeeping_tasks.updateMany({
      where: {
        end_time: {
          lte: new Date(),
        },
        task_status: {
          not: 'Complete',
        },
      },
      data: {
        task_status: 'Incomplete',
      },
    });
    console.log(`Updated ${result.count} tasks to 'Incomplete'`);
  } catch (err) {
    console.error('Error updating task statuses:', err);
  }
});
