const xtreamService = require('../services/xtreamService');

/**
 * Controlador de autenticación
 */
class AuthController {
    /**
     * Login - Autentica al usuario contra la API de Xtream Codes
     * POST /api/login
     * Body: { url, username, password }
     */
    async login(req, res, next) {
        try {
            const { url, username, password } = req.body;

            // Validar parámetros obligatorios
            if (!url || !username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: url, username, password'
                });
            }

            // Autenticar contra la API de Xtream
            const result = await xtreamService.authenticate(url, username, password);

            // Construir respuesta exitosa
            return res.status(200).json({
                success: true,
                data: {
                    user_info: result.userInfo,
                    server_info: result.serverInfo,
                    expires_at: result.userInfo.exp_date || null,
                    status: result.userInfo.status || 'Active'
                }
            });

        } catch (error) {
            // Manejo de errores específicos
            if (error.message.includes('Invalid credentials')) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials. Please check your username and password.'
                });
            }

            if (error.message.includes('Cannot connect to server')) {
                return res.status(503).json({
                    success: false,
                    error: 'Cannot connect to IPTV server. Please check the URL.'
                });
            }

            if (error.message.includes('timeout')) {
                return res.status(504).json({
                    success: false,
                    error: 'Connection timeout. The server is not responding.'
                });
            }

            // Error genérico
            next(error);
        }
    }
}

module.exports = new AuthController();
