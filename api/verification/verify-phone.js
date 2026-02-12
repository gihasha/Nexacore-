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
        const { phone, code } = req.body;
        
        if (!phone || !code) {
            return res.status(400).json({ error: 'Phone and code required' });
        }
        
        // Get from global store
        const verification = global.phoneVerifications?.get(phone);
        
        if (!verification || verification.code !== code || verification.expires < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }
        
        // Clear after verification
        global.phoneVerifications.delete(phone);
        
        res.json({
            success: true,
            message: 'Phone verified successfully',
            phone
        });
        
    } catch (error) {
        console.error('Phone verify error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
};
