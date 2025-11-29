const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

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
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
