const connectDB = require('../../lib/db');
const User = require('../../models/User');

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
        
        const { email, code } = req.body;
        
        const user = await User.findOne({
            email,
            emailVerificationCode: code,
            emailVerificationExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }
        
        user.emailVerificationCode = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
        
        res.json({ success: true, message: 'Email verified successfully' });
        
    } catch (error) {
        console.error('Email verify error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
};
