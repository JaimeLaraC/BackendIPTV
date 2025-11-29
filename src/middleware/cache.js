const { redisClient } = require('../config/redis');

/**
 * Middleware de caché usando Redis
 * @param {number} duration - Duración del caché en segundos
 */
const cache = (duration) => {
    return async (req, res, next) => {
        // Si no es GET, no cachear
        if (req.method !== 'GET' && req.method !== 'POST') {
            return next();
        }

        // Generar key única basada en URL y Body (para POST)
        const key = `cache:${req.originalUrl}:${JSON.stringify(req.body)}`;

        try {
            const cachedResponse = await redisClient.get(key);

            if (cachedResponse) {
                return res.json(JSON.parse(cachedResponse));
            }

            // Sobrescribir res.json para guardar en caché antes de enviar
            const originalJson = res.json;
            res.json = (body) => {
                redisClient.set(key, JSON.stringify(body), {
                    EX: duration
                });
                originalJson.call(res, body);
            };

            next();
        } catch (err) {
            console.error('Redis Cache Error:', err);
            next(); // Si falla Redis, continuar sin caché
        }
    };
};

module.exports = cache;
