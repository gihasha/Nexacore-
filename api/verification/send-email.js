const connectDB = require('../../lib/db');
const User = require('../../models/User');
const { sendEmail } = require('../../lib/email');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectDB();
        
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }
        
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        
        await User.findOneAndUpdate(
            { email },
            {
                emailVerificationCode: verificationCode,
                emailVerificationExpires: expiresAt
            },
            { upsert: true }
        );
        
        // Send email
        await sendEmail({
            to: email,
            subject: '🔐 Nexacore Verification Code',
            html: `
                <div style="font-family: 'Plus Jakarta Sans', sans-serif; background: #080B14; padding: 40px; border-radius: 32px;">
                    <h1 style="color: white; text-align: center;">NEXACORE<span style="color: #0A66FF;">.</span></h1>
                    <div style="background: rgba(10,102,255,0.1); border-radius: 24px; padding: 32px; text-align: center;">
                        <h2 style="color: white;">Your Verification Code</h2>
                        <div style="background: linear-gradient(145deg, #0A66FF, #0047B3); padding: 20px; border-radius: 16px; margin: 20px 0;">
                            <span style="font-size: 48px; font-weight: 800; letter-spacing: 10px; color: white;">${verificationCode}</span>
                        </div>
                        <p style="color: #A5BED9;">Valid for 10 minutes</p>
                    </div>
                </div>
            `
        });
        
        res.json({ success: true, message: 'Verification code sent' });
        
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Failed to send verification code' });
    }
};
