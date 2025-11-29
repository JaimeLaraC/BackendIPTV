const express = require('express');
const cors = require('cors');
require('dotenv').config();
const database = require('./config/database');

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const liveRoutes = require('./routes/liveRoutes');
const vodRoutes = require('./routes/vodRoutes');

// Importar middleware
const errorHandler = require('./middleware/errorHandler');

const compression = require('compression');
const setupSecurity = require('./middleware/security');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const logger = require('./utils/logger');

// Crear aplicación Express
const app = express();

// Implementar seguridad (Helmet, Rate Limit, Sanitize, XSS, HPP)
setupSecurity(app);

// Implementar compresión Gzip
app.use(compression());

// Middleware de CORS
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging middleware (solo en development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        logger.info(`${req.method} ${req.path}`);
        next();
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'IPTV Backend API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: database.isConnected() ? 'connected' : 'disconnected'
    });
});

// Conectar base de datos
database.connect().catch(err => {
    console.error('Failed to connect to database:', err);
});

// Conectar Redis
const { connectRedis } = require('./config/redis');
connectRedis();

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Rutas principales
app.use('/api/auth', userRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/vod', vodRoutes);

// Ruta 404 - No encontrada
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        availableEndpoints: {
            auth: [
                'POST /api/auth/register',
                'POST /api/auth/login',
                'GET /api/auth/profile (requires token)',
                'PUT /api/auth/iptv-credentials (requires token)',
                'DELETE /api/auth/account (requires token)'
            ],
            live: [
                'POST /api/live/categories (requires token)',
                'POST /api/live/streams (requires token)',
                'POST /api/live/streams/:category_id (requires token)'
            ],
            vod: [
                'POST /api/vod/categories (requires token)',
                'POST /api/vod/streams/:category_id (requires token)',
                'POST /api/vod/info/:vod_id (requires token)'
            ]
        }
    });
});

// Middleware de manejo de errores (siempre al final)
app.use(errorHandler);

module.exports = app;
