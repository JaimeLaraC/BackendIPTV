const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Middleware de autenticación JWT
 * Verifica que el usuario tenga un token válido y carga el usuario en req.user
 */
const auth = async (req, res, next) => {
    try {
        // Extraer token del header Authorization
        const token = extractTokenFromHeader(req.headers.authorization);

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        // Verificar token
        const decoded = verifyToken(token);

        // Buscar usuario en la base de datos
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token. User not found.'
            });
        }

        // Adjuntar usuario al request
        req.user = user;
        req.userId = user._id;

        next();
    } catch (error) {
        if (error.message.includes('expired')) {
            return res.status(401).json({
                success: false,
                error: 'Token has expired. Please login again.'
            });
        }

        if (error.message.includes('Invalid token')) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token. Please login again.'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Authentication error'
        });
    }
};

module.exports = auth;
