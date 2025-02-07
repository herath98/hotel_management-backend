// utils/email.js
import nodemailer from 'nodemailer';
import { generateBookingEmailTemplate } from './emailTemplates.js';

export const sendNotificationEmail = async (to, subject, booking, roomDetails, userDetails) => {
    if (!to) {
        console.error('No recipient email provided. Subject:', subject);
        return;
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const emailContent = generateBookingEmailTemplate(booking, roomDetails, userDetails);

    const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        text: emailContent,
        html: emailContent.replace(/\n/g, '<br>'),
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};