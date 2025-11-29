const express = require('express');
const liveController = require('../controllers/liveController');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/live/categories
 * Obtiene todas las categorías de canales en vivo
 * Header: Authorization: Bearer <token>
 */
router.post('/categories', auth, liveController.getCategories);

/**
 * POST /api/live/streams/:category_id
 * Obtiene los streams de una categoría específica
 * Header: Authorization: Bearer <token>
 * Params: category_id
 */
router.post('/streams/:category_id', auth, liveController.getStreams);

/**
 * POST /api/live/streams
 * Obtiene todos los streams sin filtro de categoría
 * Header: Authorization: Bearer <token>
 */
router.post('/streams', auth, liveController.getAllStreams);

module.exports = router;
