const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { registerValidator, loginValidator, updateIptvCredentialsValidator } = require('../validators/authValidator');

const router = express.Router();

/**
 * POST /api/auth/register
 * Registrar un nuevo usuario
 * Body: { email, password, iptv_url, iptv_username, iptv_password }
 */
router.post('/register', registerValidator, userController.register);

/**
 * POST /api/auth/login
 * Iniciar sesión
 * Body: { email, password }
 */
router.post('/login', loginValidator, userController.login);

/**
 * GET /api/auth/profile
 * Obtener perfil del usuario autenticado
 * Header: Authorization: Bearer <token>
 */
router.get('/profile', auth, userController.getProfile);

/**
 * PUT /api/auth/iptv-credentials
 * Actualizar credenciales IPTV del usuario
 * Header: Authorization: Bearer <token>
 * Body: { iptv_url?, iptv_username?, iptv_password? }
 */
router.put('/iptv-credentials', auth, updateIptvCredentialsValidator, userController.updateIptvCredentials);

/**
 * DELETE /api/auth/account
 * Eliminar cuenta del usuario
 * Header: Authorization: Bearer <token>
 */
router.delete('/account', auth, userController.deleteAccount);

module.exports = router;
