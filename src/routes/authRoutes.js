const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * POST /api/login
 * Autentica al usuario contra la API de Xtream Codes
 * Body: { url, username, password }
 */
router.post('/login', authController.login);

module.exports = router;
