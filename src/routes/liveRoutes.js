const express = require('express');
const liveController = require('../controllers/liveController');

const router = express.Router();

/**
 * POST /api/live/categories
 * Obtiene todas las categorías de canales en vivo
 * Body: { url, username, password }
 */
router.post('/categories', liveController.getCategories);

/**
 * POST /api/live/streams/:category_id
 * Obtiene los streams de una categoría específica
 * Body: { url, username, password }
 * Params: category_id
 */
router.post('/streams/:category_id', liveController.getStreams);

/**
 * POST /api/live/streams
 * Obtiene todos los streams sin filtro de categoría
 * Body: { url, username, password }
 */
router.post('/streams', liveController.getAllStreams);

module.exports = router;
