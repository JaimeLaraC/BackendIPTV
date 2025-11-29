const xtreamService = require('../services/xtreamService');
const urlBuilder = require('../utils/urlBuilder');

/**
 * Controlador de canales en vivo
 */
class LiveController {
    /**
     * Obtiene todas las categorías de canales en vivo
     * POST /api/live/categories
     * Body: { url, username, password }
     */
    async getCategories(req, res, next) {
        try {
            const { url, username, password } = req.body;

            // Validar parámetros
            if (!url || !username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: url, username, password'
                });
            }

            // Obtener categorías
            const categories = await xtreamService.getLiveCategories(url, username, password);

            return res.status(200).json({
                success: true,
                data: categories,
                count: categories.length
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene los streams de una categoría específica
     * POST /api/live/streams/:category_id
     * Body: { url, username, password }
     */
    async getStreams(req, res, next) {
        try {
            const { category_id } = req.params;
            const { url, username, password } = req.body;

            // Validar parámetros
            if (!url || !username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: url, username, password'
                });
            }

            if (!category_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing category_id parameter'
                });
            }

            // Obtener streams
            const streams = await xtreamService.getLiveStreams(url, username, password, category_id);

            // Enriquecer cada stream con la URL reproducible
            const enrichedStreams = streams.map(stream => {
                const streamUrl = urlBuilder.buildLiveUrl(
                    url,
                    username,
                    password,
                    stream.stream_id || stream.id,
                    stream.container_extension || 'ts'
                );

                return {
                    ...stream,
                    stream_url: streamUrl,
                    icon_url: stream.stream_icon ? urlBuilder.buildIconUrl(url, stream.stream_icon) : null
                };
            });

            return res.status(200).json({
                success: true,
                data: enrichedStreams,
                count: enrichedStreams.length,
                category_id: category_id
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene todos los streams sin filtro de categoría
     * POST /api/live/streams
     * Body: { url, username, password }
     */
    async getAllStreams(req, res, next) {
        try {
            const { url, username, password } = req.body;

            // Validar parámetros
            if (!url || !username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: url, username, password'
                });
            }

            // Obtener todos los streams
            const streams = await xtreamService.getAllLiveStreams(url, username, password);

            // Enriquecer streams con URLs
            const enrichedStreams = streams.map(stream => {
                const streamUrl = urlBuilder.buildLiveUrl(
                    url,
                    username,
                    password,
                    stream.stream_id || stream.id,
                    stream.container_extension || 'ts'
                );

                return {
                    ...stream,
                    stream_url: streamUrl,
                    icon_url: stream.stream_icon ? urlBuilder.buildIconUrl(url, stream.stream_icon) : null
                };
            });

            return res.status(200).json({
                success: true,
                data: enrichedStreams,
                count: enrichedStreams.length
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new LiveController();
