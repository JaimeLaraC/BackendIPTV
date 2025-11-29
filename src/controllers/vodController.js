const xtreamService = require('../services/xtreamService');
const urlBuilder = require('../utils/urlBuilder');

/**
 * Controlador de Video On Demand (VOD)
 */
class VodController {
    /**
     * Obtiene todas las categorías de VOD
     * POST /api/vod/categories
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

            // Obtener categorías VOD
            const categories = await xtreamService.getVodCategories(url, username, password);

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
     * Obtiene los streams VOD de una categoría específica
     * POST /api/vod/streams/:category_id
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

            // Obtener streams VOD
            const streams = await xtreamService.getVodStreams(url, username, password, category_id);

            // Enriquecer cada stream con la URL reproducible
            const enrichedStreams = streams.map(stream => {
                const streamUrl = urlBuilder.buildVodUrl(
                    url,
                    username,
                    password,
                    stream.stream_id || stream.id,
                    stream.container_extension || 'mp4'
                );

                return {
                    ...stream,
                    stream_url: streamUrl,
                    cover_url: stream.stream_icon ? urlBuilder.buildIconUrl(url, stream.stream_icon) : null,
                    backdrop_url: stream.backdrop_path ? urlBuilder.buildIconUrl(url, stream.backdrop_path) : null
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
     * Obtiene información detallada de un VOD específico
     * POST /api/vod/info/:vod_id
     * Body: { url, username, password }
     */
    async getInfo(req, res, next) {
        try {
            const { vod_id } = req.params;
            const { url, username, password } = req.body;

            // Validar parámetros
            if (!url || !username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: url, username, password'
                });
            }

            if (!vod_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing vod_id parameter'
                });
            }

            // Obtener información del VOD
            const vodInfo = await xtreamService.getVodInfo(url, username, password, vod_id);

            // Enriquecer con URLs si tiene info del stream
            if (vodInfo.info) {
                vodInfo.info.cover_url = vodInfo.info.cover ?
                    urlBuilder.buildIconUrl(url, vodInfo.info.cover) : null;
                vodInfo.info.backdrop_url = vodInfo.info.backdrop_path ?
                    urlBuilder.buildIconUrl(url, vodInfo.info.backdrop_path) : null;
            }

            // Agregar URL de reproducción si tiene movie_data
            if (vodInfo.movie_data) {
                vodInfo.movie_data.stream_url = urlBuilder.buildVodUrl(
                    url,
                    username,
                    password,
                    vodInfo.movie_data.stream_id,
                    vodInfo.movie_data.container_extension || 'mp4'
                );
            }

            return res.status(200).json({
                success: true,
                data: vodInfo
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VodController();
