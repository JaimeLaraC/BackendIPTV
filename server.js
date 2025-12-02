require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Ensure data directory exists
        const dbPath = path.join(__dirname, 'mongodb_data');
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(dbPath, { recursive: true });
        }

        console.log('⏳ Starting local MongoDB...');
        const mongod = await MongoMemoryServer.create({
            instance: {
                dbPath: dbPath,
                storageEngine: 'wiredTiger'
            }
        });

        const uri = mongod.getUri();
        process.env.MONGODB_URI = uri;
        console.log(`📦 Local MongoDB started at: ${uri}`);

        // Import app AFTER setting up DB
        const app = require('./src/app');

        // Iniciar servidor
        const server = app.listen(PORT, () => {
            console.log('═══════════════════════════════════════════════════════');
            console.log('🚀 IPTV Backend Server Started');
            console.log('═══════════════════════════════════════════════════════');
            console.log(`📡 Server running on port: ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
            console.log('═══════════════════════════════════════════════════════');
            console.log('Available endpoints:');
            console.log('  AUTH:');
            console.log('    POST /api/auth/register');
            console.log('    POST /api/auth/login');
            console.log('    GET /api/auth/profile (requires JWT)');
            console.log('    PUT /api/auth/iptv-credentials (requires JWT)');
            console.log('  LIVE TV (requires JWT):');
            console.log('    POST /api/live/categories');
            console.log('    POST /api/live/streams');
            console.log('    POST /api/live/streams/:category_id');
            console.log('  VOD (requires JWT):');
            console.log('    POST /api/vod/categories');
            console.log('    POST /api/vod/streams/:category_id');
            console.log('    POST /api/vod/info/:vod_id');
            console.log('═══════════════════════════════════════════════════════');
        });

        // Manejo de errores del servidor
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Error: Port ${PORT} is already in use`);
                process.exit(1);
            } else {
                console.error('❌ Server error:', error);
                process.exit(1);
            }
        });

        // Manejo de señales de terminación
        const shutdown = async () => {
            console.log('\n🛑 Shutting down gracefully...');
            if (server) {
                server.close(async () => {
                    console.log('✅ Server closed');
                    if (mongod) {
                        await mongod.stop();
                        console.log('✅ MongoDB stopped');
                    }
                    process.exit(0);
                });
            } else {
                process.exit(0);
            }
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
