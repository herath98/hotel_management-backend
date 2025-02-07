// utils/emailTemplates.js
export const generateBookingEmailTemplate = (booking, roomDetails, userDetails) => {
    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
    <!--[if mso]>
    <noscript>
    <xml>
    <o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    </noscript>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; min-width: 100%; font-family: 'Poppins', Arial, sans-serif; line-height: 1.5; background-color: #F3F4F6; color: #1F2937;">
    <center style="width: 100%; table-layout: fixed; background-color: #F3F4F6; padding-bottom: 40px;">
        <div style="max-width: 600px; background-color: #FFFFFF; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <!-- Header -->
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                <tr>
                    <td align="center" valign="top" style="padding: 40px 0; background-color: #1E40AF;">
                        <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 600; margin: 0;">Our Luxury Hotel</h1>
                        <p style="color: #E5E7EB; font-size: 16px; margin: 10px 0 0;">Booking Confirmation</p>
                    </td>
                </tr>
            </table>
            <!-- Main Content -->
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                <tr>
                    <td style="padding: 30px 30px 20px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">Dear ${userDetails.username},</p>
                        <p style="font-size: 16px; margin-bottom: 20px;">Thank you for choosing Our Luxury Hotel for your upcoming stay. Please confirm your booking.</p>
                        
                        <!-- Booking Summary -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F3F4F6; border-radius: 8px; margin-bottom: 30px;">
                            <tr>
                                <td style="padding: 20px;">
                                    <h2 style="color: #1E40AF; font-size: 20px; margin: 0 0 15px;">Booking Summary</h2>
                                    <p style="margin: 5px 0;"><strong>Booking Reference:</strong> #${booking.id}</p>
                                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: 600;">${booking.status.toUpperCase()}</span></p>
                                    <p style="margin: 5px 0;"><strong>Check-in:</strong> ${formatDate(booking.check_in_date)}</p>
                                    <p style="margin: 5px 0;"><strong>Check-out:</strong> ${formatDate(booking.check_out_date)}</p>
                                    <p style="margin: 5px 0;"><strong>Duration:</strong> ${calculateNights(booking.check_in_date, booking.check_out_date)} nights</p>
                                    <p style="font-size: 16px; margin: 20px 0;">If you have any questions or need to modify your booking, please contact our front desk:</p>
                                    <div style="margin-top: 20px;">
                                        <a href="http://localhost:5173/${userDetails.id}/bookings/${booking.id}" style="display: inline-block; padding: 10px 20px; background-color: #1E40AF; color: #FFFFFF; text-decoration: none; border-radius: 5px; font-weight: 600;">
                                            Confirm Booking
                                        </a>
                                        <p style="margin-top: 10px; font-size: 14px;">
                                            Or visit: <a href="http://localhost:5173/${userDetails.id}/bookings/${booking.id}" style="color: #1E40AF; text-decoration: underline;">http://localhost:5173/${userDetails.id}/bookings/${booking.id}</a>
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Room Details -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 10px;">
                            <tr>
                                <td style="padding-bottom: 20px;">
                                    <h2 style="color: #1E40AF; font-size: 20px; margin: 0 0 15px;">Room Details</h2>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <img src="https://images.unsplash.com/photo-1505577058444-a3dab90d4253?q=80&w=1870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Luxury Room" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p style="margin: 5px 0;"><strong>Room Type:</strong> ${roomDetails.room_type}</p>
                                    <p style="margin: 5px 0;"><strong>Room Number:</strong> ${roomDetails.room_number}</p>
                                    <p style="margin: 5px 0;"><strong>Floor:</strong> ${roomDetails.floor}</p>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Price Breakdown -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 10px;">
                            <tr>
                                <td style="padding-bottom: 20px;">
                                    <h2 style="color: #1E40AF; font-size: 20px; margin: 0 0 15px;">Price Breakdown</h2>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: separate; border-spacing: 0 10px;">
                                        <tr>
                                            <td style="padding: 10px; background-color: #F3F4F6; border-radius: 4px;">Room Rate per Night</td>
                                            <td style="padding: 10px; background-color: #F3F4F6; border-radius: 4px; text-align: right;">${formatCurrency(roomDetails.price)}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; background-color: #F3F4F6; border-radius: 4px;">Number of Nights</td>
                                            <td style="padding: 10px; background-color: #F3F4F6; border-radius: 4px; text-align: right;">${calculateNights(booking.check_in_date, booking.check_out_date)}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; background-color: #F3F4F6; border-radius: 4px;">Subtotal</td>
                                            <td style="padding: 10px; background-color: #F3F4F6; border-radius: 4px; text-align: right;">${formatCurrency(roomDetails.price * calculateNights(booking.check_in_date, booking.check_out_date))}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; background-color: #F3F4F6; border-radius: 4px;">Tax (${roomDetails.tax_rate}%)</td>
                                            <td style="padding: 10px; background-color: #F3F4F6; border-radius: 4px; text-align: right;">${formatCurrency((roomDetails.price * calculateNights(booking.check_in_date, booking.check_out_date)) * (roomDetails.tax_rate / 100))}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; background-color: #1E40AF; color: #FFFFFF; font-weight: 600; border-radius: 4px;">Total Amount</td>
                                            <td style="padding: 10px; background-color: #1E40AF; color: #FFFFFF; font-weight: 600; border-radius: 4px; text-align: right;">${formatCurrency(calculateTotal(roomDetails.price, calculateNights(booking.check_in_date, booking.check_out_date), roomDetails.tax_rate))}</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Guest Information -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 10px;">
                            <tr>
                                <td style="padding-bottom: 20px;">
                                    <h2 style="color: #1E40AF; font-size: 20px; margin: 0 0 15px;">Guest Information</h2>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p style="margin: 5px 0;"><strong>Name:</strong> ${userDetails.username}</p>
                                    <p style="margin: 5px 0;"><strong>Email:</strong> ${userDetails.email}</p>
                                    <p style="margin: 5px 0;"><strong>Phone:</strong> ${userDetails.mobile}</p>
                                    <p style="margin: 5px 0;"><strong>Address:</strong> ${userDetails.address}</p>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Hotel Policies -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                            <tr>
                                <td style="padding-bottom: 20px;">
                                    <h2 style="color: #1E40AF; font-size: 20px; margin: 0 0 15px;">Hotel Policies</h2>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <ul style="padding-left: 20px; margin: 0;">
                                        <li style="margin-bottom: 10px;">Check-in time: 3:00 PM</li>
                                        <li style="margin-bottom: 10px;">Check-out time: 11:00 AM</li>
                                        <li style="margin-bottom: 10px;">Early check-in and late check-out are subject to availability</li>
                                        <li style="margin-bottom: 10px;">Cancellation policy: Free cancellation up to 24 hours before check-in</li>
                                    </ul>
                                </td>
                            </tr>
                        </table>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">Our Details</p>
                        <p style="margin: 5px 0;"><strong>Phone:</strong> +1-XXX-XXX-XXXX</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:support@ourluxuryhotel.com" style="color: #1E40AF; text-decoration: none;">support@ourluxuryhotel.com</a></p>
                        
                        <p style="font-size: 16px; margin-top: 30px;">We look forward to providing you with an exceptional stay!</p>
                        
                        <p style="font-size: 16px; margin-top: 20px;">Best regards,<br>The Luxury Hotel Team</p>
                    </td>
                </tr>
            </table>
            <!-- Footer -->
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                <tr>
                    <td align="center" valign="top" style="padding: 30px 0; background-color: #1E40AF;">
                        <p style="color: #FFFFFF; font-size: 14px; margin: 0;">&copy; 2025 Our Luxury Hotel. All rights reserved.</p>
                    </td>
                </tr>
            </table>
        </div>
    </center>
</body>
</html>



    `;
};

const calculateNights = (checkIn, checkOut) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.round(Math.abs((start - end) / oneDay));
};

const calculateTotal = (pricePerNight, nights, taxRate) => {
    const subtotal = pricePerNight * nights;
    const tax = subtotal * (taxRate / 100);
    return subtotal + tax;
};
