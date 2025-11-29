const jwt = require('jsonwebtoken');

/**
 * Utilidades para manejo de JSON Web Tokens (JWT)
 */

/**
 * Genera un token JWT para un usuario
 * @param {Object} payload - Datos a incluir en el token (típicamente userId)
 * @param {string} expiresIn - Tiempo de expiración (ej: '7d', '24h', '1h')
 * @returns {string} Token JWT
 */
const generateToken = (payload, expiresIn = null) => {
    try {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('JWT_SECRET not defined in environment variables');
        }

        const options = {
            expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d'
        };

        return jwt.sign(payload, secret, options);
    } catch (error) {
        console.error('Token generation error:', error.message);
        throw new Error('Failed to generate token');
    }
};

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token a verificar
 * @returns {Object} Payload decodificado del token
 * @throws {Error} Si el token es inválido o ha expirado
 */
const verifyToken = (token) => {
    try {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('JWT_SECRET not defined in environment variables');
        }

        return jwt.verify(token, secret);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        throw error;
    }
};

/**
 * Decodifica un token sin verificar (útil para debugging)
 * ⚠️ NO usar para autenticación, solo para inspección
 * @param {string} token - Token a decodificar
 * @returns {Object} Payload decodificado
 */
const decodeToken = (token) => {
    return jwt.decode(token);
};

/**
 * Extrae el token del header Authorization
 * @param {string} authHeader - Header Authorization (formato: "Bearer <token>")
 * @returns {string|null} Token extraído o null si no es válido
 */
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
    extractTokenFromHeader
};
