const express = require('express');
const liveController = require('../controllers/liveController');
const auth = require('../middleware/auth');
const cache = require('../middleware/cache');

const router = express.Router();

// Cache duration: 5 minutes (300 seconds)
const CACHE_DURATION = 300;

// Todas las rutas requieren autenticación
router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Live
 *   description: Live TV channels management
 */

/**
 * @swagger
 * /live/categories:
 *   post:
 *     summary: Get all live TV categories
 *     tags: [Live]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *       401:
 *         description: Unauthorized
 */
router.post('/categories', cache(CACHE_DURATION), liveController.getCategories);

/**
 * @swagger
 * /live/streams/{category_id}:
 *   post:
 *     summary: Get live streams by category
 *     tags: [Live]
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
router.post('/streams/:category_id', cache(CACHE_DURATION), liveController.getStreams);

/**
 * @swagger
 * /live/streams:
 *   post:
 *     summary: Get all live streams
 *     tags: [Live]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all streams
 *       401:
 *         description: Unauthorized
 */
router.post('/streams', cache(CACHE_DURATION), liveController.getAllStreams);

module.exports = router;
