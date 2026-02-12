const connectDB = require('../../lib/db');
const { sendSMS } = require('../../lib/sms');

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
        const { phone } = req.body;
        
        if (!phone) {
            return res.status(400).json({ error: 'Phone number required' });
        }
        
        // Validate Sri Lanka format
        if (!phone.match(/^\+94[0-9]{9}$/)) {
            return res.status(400).json({ error: 'Invalid format. Use +94XXXXXXXXX' });
        }
        
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store in Vercel KV or use session (simplified)
        // For demo, we'll use a global Map (not persistent)
        if (!global.phoneVerifications) global.phoneVerifications = new Map();
        global.phoneVerifications.set(phone, {
            code: verificationCode,
            expires: Date.now() + 10 * 60 * 1000
        });
        
        // Send SMS
        const sent = await sendSMS(phone, `🔐 Your Nexacore verification code is: ${verificationCode}`);
        
        if (!sent) {
            return res.status(500).json({ error: 'Failed to send SMS' });
        }
        
        res.json({ success: true, message: 'Verification code sent' });
        
    } catch (error) {
        console.error('Phone verification error:', error);
        res.status(500).json({ error: 'Failed to send verification code' });
    }
};
