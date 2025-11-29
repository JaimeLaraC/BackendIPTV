const express = require('express');
const vodController = require('../controllers/vodController');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/vod/categories
 * Obtiene todas las categorías de VOD
 * Header: Authorization: Bearer <token>
 */
router.post('/categories', auth, vodController.getCategories);

/**
 * POST /api/vod/streams/:category_id
 * Obtiene los streams VOD de una categoría específica
 * Header: Authorization: Bearer <token>
 * Params: category_id
 */
router.post('/streams/:category_id', auth, vodController.getStreams);

/**
 * POST /api/vod/info/:vod_id
 * Obtiene información detallada de un VOD específico
 * Header: Authorization: Bearer <token>
 * Params: vod_id
 */
router.post('/info/:vod_id', auth, vodController.getInfo);

module.exports = router;
