const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nickname: { type: String, default: 'Tech Explorer' },
    username: { type: String, unique: true, sparse: true },
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    phoneVerified: { type: Boolean, default: false },
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '' },
    
    twoFactorEnabled: { type: Boolean, default: false },
    loginAlerts: { type: Boolean, default: false },
    smsNotifications: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    
    whatsapp: { type: String, default: '' },
    telegram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'LKR' },
    theme: { type: String, default: 'dark' },
    
    securityQuestions: [{
        question: String,
        answer: String
    }],
    
    paymentMethods: [{
        type: { type: String, enum: ['card', 'bank'] },
        last4: String,
        cardHolder: String,
        expiryDate: String
    }],
    
    paymentHistory: [{
        date: { type: Date, default: Date.now },
        amount: Number,
        currency: String,
        method: String,
        status: { type: String, default: 'completed' },
        receiptId: String
    }],
    
    emailVerificationCode: String,
    emailVerificationExpires: Date,
    phoneVerificationCode: String,
    phoneVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
    createdAt: { type: Date, default: Date.now },
    lastLogin: Date
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
