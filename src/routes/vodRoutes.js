const express = require('express');
const router = express.Router();
const vodController = require('../controllers/vodController');
const auth = require('../middleware/auth');
const cache = require('../middleware/cache');

// Cache duration: 10 minutes (600 seconds) for VOD
const CACHE_DURATION = 600;

// Todas las rutas requieren autenticación
router.use(auth);

/**
 * @swagger
 * tags:
 *   name: VOD
 *   description: Video On Demand management
 */

/**
 * @swagger
 * /vod/categories:
 *   post:
 *     summary: Get all VOD categories
 *     tags: [VOD]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *       401:
 *         description: Unauthorized
 */
router.post('/categories', cache(CACHE_DURATION), vodController.getCategories);

/**
 * @swagger
 * /vod/streams/{category_id}:
 *   post:
 *     summary: Get VOD streams by category
 *     tags: [VOD]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: List of streams
 *       401:
 *         description: Unauthorized
 */
router.post('/streams/:category_id', cache(CACHE_DURATION), vodController.getStreams);

/**
 * @swagger
 * /vod/info/{vod_id}:
 *   post:
 *     summary: Get VOD details
 *     tags: [VOD]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vod_id
 *         required: true
 *         schema:
 *           type: string
 *         description: VOD ID
 *     responses:
 *       200:
 *         description: VOD details
 *       401:
 *         description: Unauthorized
 */
router.post('/info/:vod_id', cache(CACHE_DURATION), vodController.getInfo);

module.exports = router;
