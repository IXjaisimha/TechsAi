const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const createTransporter = () => {
    if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return null;
};

const transporter = createTransporter();

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, text, html) => {
    try {
        if (!transporter) {
            console.log('⚠️ No properties for email transport found in .env. Logging email instead:');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body: ${text}`);
            return { success: true, message: 'Email logged to console (Mock Mode)' };
        }

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        });

        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

exports.sendShortlistEmail = async (to, candidateName, jobTitle) => {
    const subject = `Congratulations! You have been Shortlisted for ${jobTitle}`;
    const text = `Dear ${candidateName},\n\nWe are pleased to inform you that you have been shortlisted for the position of ${jobTitle}. Our team will contact you shortly regarding the next steps.\n\nBest regards,\nRecruitment Team`;

    // Simple HTML template
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Congratulations!</h2>
            <p>Dear <strong>${candidateName}</strong>,</p>
            <p>We are pleased to inform you that you have been <strong>shortlisted</strong> for the position of <strong>${jobTitle}</strong>.</p>
            <p>Our HR team was impressed with your profile and will be contacting you shortly to schedule an interview.</p>
            <p>Best regards,<br/>The Recruitment Team</p>
        </div>
    `;

    return sendEmail(to, subject, text, html);
};

exports.sendRejectionEmail = async (to, candidateName, jobTitle) => {
    const subject = `Update regarding your application for ${jobTitle}`;
    const text = `Dear ${candidateName},\n\nThank you for your interest in the ${jobTitle} position. After careful review, we have decided to move forward with other candidates who more closely match our requirements at this time. We wish you the best in your job search.\n\nBest regards,\nRecruitment Team`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <p>Dear <strong>${candidateName}</strong>,</p>
            <p>Thank you for giving us the opportunity to review your application for the <strong>${jobTitle}</strong> position.</p>
            <p>Although your qualifications are impressive, we have decided to proceed with other candidates who more closely align with our current needs.</p>
            <p>We appreciate your time and wish you the best of luck in your future endeavors.</p>
            <p>Best regards,<br/>The Recruitment Team</p>
        </div>
    `;

    return sendEmail(to, subject, text, html);
};
