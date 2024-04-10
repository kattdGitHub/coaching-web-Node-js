const jwt = require("jsonwebtoken");
const secretKey = "dcckdjckjdcjkd";

// Function to sign JWT token
function signToken(payload) {
    return jwt.sign(payload, secretKey);
}

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({ message: 'Invalid token' });
            } else {
                console.error(err);
                return res.status(500).json({ message: 'Failed to authenticate token' });
            }
        }
        req.userId = decoded.id; // Assuming your token payload has the user ID stored as 'id'
        next();
    });
}

module.exports = { signToken, verifyToken };
