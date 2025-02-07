// utils/email.js
import { sendNotificationEmail } from './email.js';
import { generateBookingEmailTemplate } from './emailTemplates.js';

const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

const calculateTotalAmount = (pricePerNight, checkIn, checkOut) => {
    const nights = calculateNights(checkIn, checkOut);
    return (pricePerNight * nights).toFixed(2);
};

export const sendBookingEmail = async (booking, user, room) => {
    const emailContent = generateBookingEmailTemplate(booking, user, room);
    
    await sendNotificationEmail(
        booking.email,
        "Your Booking Confirmation",
        emailContent,
        true // Set HTML flag to true
    );
};