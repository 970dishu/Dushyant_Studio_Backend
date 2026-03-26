import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: 'https://www.dushyant.studio',
    methods: ['GET', 'POST'],
  })
);
app.use(express.json());

const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many contact requests from this IP. Please try again after 15 minutes.',
  },
});

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Contact form endpoint
app.post('/api/contact', contactRateLimiter, async (req, res) => {
  try {
    const { name, email, service, message } = req.body;

    // Validate required fields
    if (!name || !email || !service || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address',
      });
    }

    // Send email
    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: process.env.RECIPIENT_EMAIL || 'dushyantdishugarg@gmail.com',
      replyTo: email,
      subject: `Portfolio Inquiry: ${service}`,
      text: `New contact form submission from your portfolio website.

Name: ${name}
Email: ${email}
Service: ${service}

Message:
${message}

---
Reply directly to this email to respond to ${name}.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ff9900 0%, #ff9900 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #0a0a0a; font-size: 28px; font-weight: bold;">New Portfolio Inquiry</h1>
            </div>
            
            <!-- Content -->
            <div style="background-color: #1a1a1a; padding: 30px; border-radius: 0 0 16px 16px;">
              <!-- Service Badge -->
              <div style="margin-bottom: 24px; text-align: center;">
                <span style="display: inline-block; background-color: #ff9900; color: #0a0a0a; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: uppercase;">
                  ${service}
                </span>
              </div>
              
              <!-- Contact Info -->
              <div style="background-color: #262626; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                <div style="margin-bottom: 16px;">
                  <p style="margin: 0 0 4px 0; color: #ff9900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Name</p>
                  <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 500;">${name}</p>
                </div>
                <div>
                  <p style="margin: 0 0 4px 0; color: #ff9900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</p>
                  <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 500;">
                    <a href="mailto:${email}" style="color: #ffffff; text-decoration: none;">${email}</a>
                  </p>
                </div>
              </div>
              
              <!-- Message -->
              <div style="background-color: #262626; padding: 20px; border-radius: 12px;">
                <p style="margin: 0 0 12px 0; color: #ff9900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
                <p style="margin: 0; color: #e0e0e0; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
              
              <!-- Reply Button -->
              <div style="margin-top: 24px; text-align: center;">
                <a href="mailto:${email}" style="display: inline-block; background-color: #ff9900; color: #0a0a0a; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Reply to ${name}
                </a>
              </div>
              
              <!-- Footer -->
              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #333; text-align: center;">
                <p style="margin: 0; color: #888; font-size: 12px;">
                  Sent from dushyant.studio contact form
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email. Please try again later.',
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err); 
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Contact API available at http://localhost:${PORT}/api/contact`);
});

export default app;
