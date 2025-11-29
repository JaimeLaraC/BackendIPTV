const mongoose = require('mongoose');

/**
 * Configuración y conexión a MongoDB
 */
class Database {
    constructor() {
        this.connection = null;
    }

    /**
     * Conecta a la base de datos MongoDB
     * @returns {Promise<void>}
     */
    async connect() {
        try {
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/iptv_backend';

            // Opciones de conexión
            const options = {
                // useNewUrlParser: true, // Deprecated en Mongoose 6+
                // useUnifiedTopology: true, // Deprecated en Mongoose 6+
            };

            // Conectar a MongoDB
            this.connection = await mongoose.connect(mongoUri, options);

            console.log('✅ MongoDB connected successfully');
            console.log(`📊 Database: ${this.connection.connection.name}`);
            console.log(`🔗 Host: ${this.connection.connection.host}`);

            // Event listeners
            mongoose.connection.on('error', (err) => {
                console.error('❌ MongoDB connection error:', err);
            });

            mongoose.connection.on('disconnected', () => {
                console.warn('⚠️  MongoDB disconnected');
            });

            // Graceful shutdown
            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });

        } catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error.message);

            // Retry logic
            if (process.env.NODE_ENV === 'production') {
                console.log('⏳ Retrying connection in 5 seconds...');
                setTimeout(() => this.connect(), 5000);
            } else {
                throw error;
            }
        }
    }

    /**
     * Desconecta de la base de datos
     * @returns {Promise<void>}
     */
    async disconnect() {
        try {
            await mongoose.connection.close();
            console.log('✅ MongoDB connection closed gracefully');
        } catch (error) {
            console.error('❌ Error closing MongoDB connection:', error);
            throw error;
        }
    }

    /**
     * Verifica el estado de la conexión
     * @returns {boolean}
     */
    isConnected() {
        return mongoose.connection.readyState === 1;
    }

    /**
     * Obtiene la instancia de la conexión
     * @returns {mongoose.Connection}
     */
    getConnection() {
        return mongoose.connection;
    }
}

module.exports = new Database();
