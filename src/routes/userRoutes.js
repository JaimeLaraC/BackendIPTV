const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { registerValidator, loginValidator, updateCredentialsValidator } = require('../validators/authValidator');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User management and authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - iptv_url
 *               - iptv_username
 *               - iptv_password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               iptv_url:
 *                 type: string
 *               iptv_username:
 *                 type: string
 *               iptv_password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */
router.post('/register', registerValidator, userController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidator, userController.login);

/**
 * Header: Authorization: Bearer <token>
 */
router.get('/profile', auth, userController.getProfile);

/**
 * PUT /api/auth/iptv-credentials
 * Actualizar credenciales IPTV del usuario
 * Header: Authorization: Bearer <token>
 * Body: { iptv_url?, iptv_username?, iptv_password? }
 */
router.put('/iptv-credentials', auth, updateCredentialsValidator, userController.updateIptvCredentials);

/**
 * DELETE /api/auth/account
 * Eliminar cuenta del usuario
 * Header: Authorization: Bearer <token>
 */
router.delete('/account', auth, userController.deleteAccount);

module.exports = router;
