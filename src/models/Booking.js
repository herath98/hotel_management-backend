import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const checkRoomAvailability = async (roomId) => {
    const room = await prisma.rooms.findUnique({
        where: { id: roomId },
        select: { status: true },
    });
    return room?.status === 'Available';
};

export const createBookingInDB = async (bookingData) => {
    return await prisma.$transaction(async (prisma) => {
        const isAvailable = await checkRoomAvailability(bookingData.roomId);
        if (!isAvailable) {
            throw new Error('Room is not available for booking');
        }

        const newBooking = await prisma.bookings.create({
            data: bookingData,
        });

        await prisma.rooms.update({
            where: { id: bookingData.roomId },
            data: { status: 'Unavailable' },
        });

        return newBooking;
    });
};

export const updateBookingInDB = async (bookingId, updateData) => {
    return await prisma.bookings.update({
        where: { id: bookingId },
        data: updateData,
    });
};

export const getBookingListFromDB = async (status = null) => {
    const where = status ? { status } : {};
    return await prisma.bookings.findMany({
        where,
        orderBy: {
            created_at: 'desc',
        },
    });
};

export const getBookingByIdFromDB = async (bookingId) => {
    return await prisma.bookings.findUnique({
        where: { id: bookingId },
    });
};

export const updateBookingStatusInDB = async (bookingId, status) => {
    return await prisma.$transaction(async (prisma) => {
        const booking = await prisma.bookings.findUnique({
            where: { id: bookingId },
            select: { room_id: true },
        });

        if (!booking) {
            throw new Error('Booking not found');
        }

        const updatedBooking = await prisma.bookings.update({
            where: { id: bookingId },
            data: { status },
        });

        if (status === 'cancelled') {
            await prisma.rooms.update({
                where: { id: booking.room_id },
                data: { status: 'Available' },
            });
        }

        return updatedBooking;
    });
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
