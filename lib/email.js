const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return transporter;
}

async function sendEmail({ to, subject, html }) {
    try {
        const transporter = getTransporter();
        await transporter.sendMail({
            from: `"Nexacore" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
}

module.exports = { sendEmail };
