// controllers/bookingController.js
import {
    createBookingInDB,
    updateBookingInDB,
    getBookingListFromDB,
    getBookingByIdFromDB,
    updateBookingStatusInDB,
    checkRoomAvailability
} from '../models/Booking.js';
import { sendNotificationEmail } from '../utils/email.js';
import { getRoomById } from '../models/roomModel.js';
import { findUserById } from '../models/userModel.js';
import { sendResponse, ResponseStatus } from '../utils/responseHandler.js';

export const createBooking = async (req, res, next) => {
    try {
        const bookingData = req.body;
        
        try {
            const booking = await createBookingInDB(bookingData);
            
            if (booking.email) {
                const roomDetails = await getRoomById(booking.room_id);
                const userDetails = await findUserById(booking.user_id);
               
                
                if (!roomDetails || !userDetails) {
                    throw new Error('Room or user details not found');
                }
                
                await sendNotificationEmail(
                    booking.email,
                    "Confirm Your Booking Invoice",
                    booking,
                    roomDetails,
                    userDetails
                );
            } else {
                console.error('No email provided for booking:', booking);
            }
            
            return sendResponse(res, ResponseStatus.CREATED, "Booking created successfully", booking);
        } catch (error) {
            if (error.message === 'Room is not available for booking') {
                return sendResponse(res, ResponseStatus.BAD_REQUEST, error.message);
            }
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

// Update the updateBooking and updateBookingStatus functions similarly
export const updateBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const updateData = req.body;
        const updatedBooking = await updateBookingInDB(bookingId, updateData);
        
        if (!updatedBooking) {
            return sendResponse(res, ResponseStatus.NOT_FOUND, "Booking not found");
        }

        const roomDetails = await  getRoomById(updatedBooking.room_id);
        const userDetails = await findUserById(updatedBooking.user_id);

        await sendNotificationEmail(
            updatedBooking.email,
            "Booking Update - Updated Invoice",
            updatedBooking,
            roomDetails,
            userDetails
        );

        return sendResponse(res, ResponseStatus.SUCCESS, "Booking updated successfully", updatedBooking);
    } catch (error) {
        next(error);
    }
};

export const updateBookingStatus = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST, "Invalid status. Must be one of: " + validStatuses.join(', '));
        }

        const updatedBooking = await updateBookingStatusInDB(bookingId, status);
        
        if (!updatedBooking) {
            return sendResponse(res, ResponseStatus.NOT_FOUND, "Booking not found");
        }

        const roomDetails = await  getRoomById(updatedBooking.room_id);
        const userDetails = await findUserById(updatedBooking.user_id);

        await sendNotificationEmail(
            updatedBooking.email,
            `Booking ${status.charAt(0).toUpperCase() + status.slice(1)} - Updated Invoice`,
            updatedBooking,
            roomDetails,
            userDetails
        );

        return sendResponse(res, ResponseStatus.SUCCESS, "Booking status updated successfully", updatedBooking);
    } catch (error) {
        next(error);
    }
};

export const getBookingList = async (req, res, next) => {
    try {
        const { status } = req.query;
        const bookings = await getBookingListFromDB(status);
        return sendResponse(res, ResponseStatus.SUCCESS, "Bookings retrieved successfully", bookings);
    } catch (error) {
        next(error);
    }
};

export const getBookingById = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const booking = await getBookingByIdFromDB(bookingId);
        
        if (!booking) {
            return sendResponse(res, ResponseStatus.NOT_FOUND, "Booking not found");
        }

        return sendResponse(res, ResponseStatus.SUCCESS, "Booking retrieved successfully", booking);
    } catch (error) {
        next(error);
    }
};

