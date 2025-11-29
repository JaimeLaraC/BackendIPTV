const xtreamService = require('../services/xtreamService');
const urlBuilder = require('../utils/urlBuilder');

/**
 * Controlador de canales en vivo
 */
class LiveController {
    /**
   * Obtiene todas las categorías de canales en vivo
   * POST /api/live/categories
   * Header: Authorization: Bearer <token>
   */
    async getCategories(req, res, next) {
        try {
            // Obtener credenciales del usuario autenticado
            const credentials = req.user.getDecryptedCredentials();

            // Obtener categorías usando credenciales almacenadas
            const categories = await xtreamService.getLiveCategories(
                credentials.url,
                credentials.username,
                credentials.password
            );

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
   * Header: Authorization: Bearer <token>
   */
    async getStreams(req, res, next) {
        try {
            const { category_id } = req.params;

            if (!category_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing category_id parameter'
                });
            }

            // Obtener credenciales del usuario autenticado
            const credentials = req.user.getDecryptedCredentials();

            // Obtener streams usando credenciales almacenadas
            const streams = await xtreamService.getLiveStreams(
                credentials.url,
                credentials.username,
                credentials.password,
                category_id
            );

            // Enriquecer cada stream con la URL reproducible
            const enrichedStreams = streams.map(stream => {
                const streamUrl = urlBuilder.buildLiveUrl(
                    credentials.url,
                    credentials.username,
                    credentials.password,
                    stream.stream_id || stream.id,
                    stream.container_extension || 'ts'
                );

                return {
                    ...stream,
                    stream_url: streamUrl,
                    icon_url: stream.stream_icon ? urlBuilder.buildIconUrl(credentials.url, stream.stream_icon) : null
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
   * Header: Authorization: Bearer <token>
   */
    async getAllStreams(req, res, next) {
        try {
            // Obtener credenciales del usuario autenticado
            const credentials = req.user.getDecryptedCredentials();

            // Obtener todos los streams
            const streams = await xtreamService.getAllLiveStreams(
                credentials.url,
                credentials.username,
                credentials.password
            );

            // Enriquecer streams con URLs
            const enrichedStreams = streams.map(stream => {
                const streamUrl = urlBuilder.buildLiveUrl(
                    credentials.url,
                    credentials.username,
                    credentials.password,
                    stream.stream_id || stream.id,
                    stream.container_extension || 'ts'
                );

                return {
                    ...stream,
                    stream_url: streamUrl,
                    icon_url: stream.stream_icon ? urlBuilder.buildIconUrl(credentials.url, stream.stream_icon) : null
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
