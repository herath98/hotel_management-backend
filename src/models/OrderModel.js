import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const createOrderDB = async ({ items, totalPrice, status, roomNumber, specialNotes }) => {
    return await prisma.orders.create({
        data: {
            items,
            total_price: totalPrice,
            status,
            room_number: roomNumber,
            special_notes: specialNotes,
        },
    });
};

export const getAllOrdersDB = async () => {
    return await prisma.orders.findMany();
};

export const getOrderByIdDB = async (id) => {
    return await prisma.orders.findUnique({
        where: { id },
    });
};

export const updateOrderStatusDB = async (id, status) => {
    return await prisma.orders.update({
        where: { id },
        data: { status },
    });
};

export const deleteOrderDB = async (id) => {
    return await prisma.orders.delete({
        where: { id },
    });
};

export const updateOrderInDB = async (id, data) => {
    return await prisma.orders.update({
        where: { id },
        data,
    });
};
