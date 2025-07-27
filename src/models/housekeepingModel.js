import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const createTask = async (task) => {
    const { room_id, assigned_to } = task;

    const roomExists = await prisma.rooms.findUnique({ where: { id: room_id } });
    if (!roomExists) {
        throw new Error('Invalid room_id: Room does not exist');
    }

    const userExists = await prisma.users.findUnique({ where: { id: assigned_to } });
    if (!userExists) {
        throw new Error('Invalid assigned_to: User does not exist');
    }

    return await prisma.housekeeping_tasks.create({
        data: {
            ...task,
            manual_status_override: false,
        },
    });
};

export const getTasks = async () => {
    return await prisma.housekeeping_tasks.findMany({
        include: {
            users: {
                select: {
                    username: true,
                },
            },
        },
        orderBy: [
            {
                scheduled_date: 'asc',
            },
            {
                start_time: 'asc',
            },
        ],
    });
};

export const getTasksByAssignedTo = async (userId) => {
    return await prisma.housekeeping_tasks.findMany({
        where: {
            assigned_to: userId,
        },
        include: {
            users: {
                select: {
                    username: true,
                },
            },
        },
        orderBy: [
            {
                scheduled_date: 'asc',
            },
            {
                start_time: 'asc',
            },
        ],
    });
};

export const updateTaskStatus = async (id, status, isManualUpdate = true) => {
    const task = await prisma.housekeeping_tasks.findUnique({ where: { id } });
    if (!task) {
        throw new Error('Task not found');
    }

    return await prisma.housekeeping_tasks.update({
        where: { id },
        data: {
            task_status: status,
            manual_status_override: isManualUpdate,
            last_manual_update: isManualUpdate ? new Date() : task.last_manual_update,
        },
    });
};

export const updateTask = async (id, updates) => {
    return await prisma.housekeeping_tasks.update({
        where: { id },
        data: updates,
    });
};

export const updateExpiredTasks = async () => {
    return await prisma.housekeeping_tasks.updateMany({
        where: {
            end_time: {
                lt: new Date(),
            },
            task_status: {
                notIn: ['Completed', 'Cancelled'],
            },
            OR: [
                {
                    manual_status_override: false,
                },
                {
                    last_manual_update: {
                        lt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
                    },
                },
            ],
        },
        data: {
            task_status: 'Incomplete',
            manual_status_override: false,
        },
    });
};
export const deleteTask = async (taskId) => {
    return await prisma.housekeeping_tasks.delete({
        where: { id: taskId },
    });
};
