// Email notification service
// This uses a simple approach - in production, integrate with services like:
// - Resend (recommended)
// - SendGrid
// - AWS SES
// - Nodemailer with SMTP

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  // In production, replace this with actual email service
  // For now, we'll use a Next.js API route or Supabase Edge Function
  
  try {
    // Option 1: Use Next.js API route (create /app/api/send-email/route.ts)
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    // In development, log the email instead
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:', data);
    }
    return false;
  }
}

export function generateInquiryEmail(inquiry: any, packageDetails?: any) {
  const packageInfo = packageDetails 
    ? `<p><strong>Package:</strong> ${packageDetails.title}</p>`
    : '';

  return {
    to: inquiry.email,
    subject: 'Thank You for Your Inquiry - Tempesttrek',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0d9488 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 24px; background: #0d9488; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Tempesttrek</h1>
            </div>
            <div class="content">
              <h2>Thank You, ${inquiry.name}!</h2>
              <p>We have received your inquiry and our travel experts will contact you within 24 hours.</p>
              
              ${packageInfo}
              
              <p><strong>Your Details:</strong></p>
              <ul>
                <li>Name: ${inquiry.name}</li>
                <li>Email: ${inquiry.email}</li>
                <li>Phone: ${inquiry.phone}</li>
              </ul>
              
              <p>${inquiry.message ? `<strong>Your Message:</strong><br>${inquiry.message}` : ''}</p>
              
              <p>In the meantime, feel free to explore our <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tempesttrek.example'}/packages">tour packages</a> or contact us directly:</p>
              <p>📞 Call (Priority): +91 7006796123<br>💬 Our WhatsApp: +91 7006796123<br>📧 info@tempesttreks.in</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Tempesttrek. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Thank You, ${inquiry.name}!\n\nWe have received your inquiry and our travel experts will contact you within 24 hours.\n\nContact us:\nCall (Priority): +91 7006796123\nOur WhatsApp: +91 7006796123\nEmail: info@tempesttreks.in`,
  };
}

export function generateBookingConfirmationEmail(booking: any, packageDetails: any) {
  return {
    to: booking.email,
    subject: `Booking Confirmed - ${packageDetails.title} | Tempesttrek`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0d9488 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hello ${booking.name},</h2>
              <p>Your booking has been confirmed! We're excited to welcome you to Kashmir.</p>
              
              <div class="booking-details">
                <h3>Booking Details</h3>
                <p><strong>Package:</strong> ${packageDetails.title}</p>
                <p><strong>Duration:</strong> ${packageDetails.duration}</p>
                <p><strong>Travel Date:</strong> ${booking.travel_date || 'To be confirmed'}</p>
                <p><strong>Booking ID:</strong> ${booking.id}</p>
              </div>
              
              <p>Our team will contact you shortly with further details and payment instructions.</p>
              <p>For any queries, contact us:<br>📞 Call (Priority): +91 7006796123<br>💬 Our WhatsApp: +91 7006796123<br>📧 info@tempesttreks.in</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Tempesttrek. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

