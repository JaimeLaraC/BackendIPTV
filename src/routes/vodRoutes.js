const express = require('express');
const vodController = require('../controllers/vodController');

const router = express.Router();

/**
 * POST /api/vod/categories
 * Obtiene todas las categorías de VOD
 * Body: { url, username, password }
 */
router.post('/categories', vodController.getCategories);

/**
 * POST /api/vod/streams/:category_id
 * Obtiene los streams VOD de una categoría específica
 * Body: { url, username, password }
 * Params: category_id
 */
router.post('/streams/:category_id', vodController.getStreams);

/**
 * POST /api/vod/info/:vod_id
 * Obtiene información detallada de un VOD específico
 * Body: { url, username, password }
 * Params: vod_id
 */
router.post('/info/:vod_id', vodController.getInfo);

module.exports = router;
