const connectDB = require('../../lib/db');
const User = require('../../models/User');
const { authMiddleware } = require('../../lib/jwt');
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (Vercel compatible)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Images only!'));
    }
});

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectDB();
        
        const { nickname, username, fullName, bio, whatsapp, telegram } = req.body;
        
        const updateData = {
            nickname,
            username,
            fullName,
            bio,
            whatsapp,
            telegram
        };
        
        // Handle file upload if exists
        if (req.file) {
            // Convert buffer to base64 for storage
            const base64Image = req.file.buffer.toString('base64');
            updateData.profileImage = `data:${req.file.mimetype};base64,${base64Image}`;
        }
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        ).select('-password -emailVerificationCode -phoneVerificationCode');
        
        res.json({
            success: true,
            user
        });
        
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Wrap with multer and auth middleware
module.exports = (req, res) => {
    const wrappedHandler = authMiddleware(handler);
    
    upload.single('profileImage')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        return wrappedHandler(req, res);
    });
};
