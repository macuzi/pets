const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT token
 * Protects routes requiring authentication
 *
 * Usage: router.post('/pets', authenticateToken, createPetHandler)
 */
function authenticateToken(req, res, next) {
  // Extract token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Access token required',
        code: 'NO_TOKEN',
      },
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object for use in route handlers
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    // Token verification failed (expired, invalid, tampered)
    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      },
    });
  }
}

module.exports = {
  authenticateToken,
};
