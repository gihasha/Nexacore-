const jwt = require('jsonwebtoken');

function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

function authMiddleware(handler) {
    return async (req, res) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied' });
        }
        
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        
        req.user = decoded;
        return handler(req, res);
    };
}

module.exports = { verifyToken, authMiddleware };
