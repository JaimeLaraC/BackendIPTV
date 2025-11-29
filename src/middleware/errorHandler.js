/**
 * Middleware de manejo centralizado de errores
 */
const errorHandler = (err, req, res, next) => {
    // Log del error en consola para debugging
    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        body: req.body
    });

    // Errores conocidos de la aplicación
    if (err.message.includes('Invalid credentials')) {
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }

    if (err.message.includes('Cannot connect to server')) {
        return res.status(503).json({
            success: false,
            error: 'Cannot connect to IPTV server'
        });
    }

    if (err.message.includes('timeout')) {
        return res.status(504).json({
            success: false,
            error: 'Request timeout'
        });
    }

    if (err.message.includes('Missing required parameter')) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    // Error genérico del servidor
    return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};

module.exports = errorHandler;
