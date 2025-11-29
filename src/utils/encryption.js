const crypto = require('crypto');

/**
 * Utilidades de encriptación para credenciales IPTV
 * Usa AES-256-CBC para encriptar/desencriptar datos sensibles
 */

// Algoritmo de encriptación
const ALGORITHM = 'aes-256-cbc';

// Obtener la clave de encriptación del entorno (debe ser 32 caracteres)
const getEncryptionKey = () => {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
        throw new Error('ENCRYPTION_KEY not defined in environment variables');
    }

    if (key.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
    }

    return key;
};

/**
 * Encripta un texto usando AES-256-CBC
 * @param {string} text - Texto a encriptar
 * @returns {string} Texto encriptado en formato hex:hex (iv:encrypted)
 */
const encrypt = (text) => {
    try {
        if (!text) {
            throw new Error('Text to encrypt cannot be empty');
        }

        const key = getEncryptionKey();

        // Generar IV (Initialization Vector) aleatorio
        const iv = crypto.randomBytes(16);

        // Crear cipher
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);

        // Encriptar
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Retornar IV + encrypted separados por ':'
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error.message);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Desencripta un texto encriptado con AES-256-CBC
 * @param {string} encryptedText - Texto encriptado en formato hex:hex (iv:encrypted)
 * @returns {string} Texto desencriptado
 */
const decrypt = (encryptedText) => {
    try {
        if (!encryptedText) {
            throw new Error('Encrypted text cannot be empty');
        }

        const key = getEncryptionKey();

        // Separar IV y datos encriptados
        const parts = encryptedText.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted text format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];

        // Crear decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);

        // Desencriptar
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error.message);
        throw new Error('Failed to decrypt data');
    }
};

/**
 * Hash a password using crypto (for testing purposes)
 * En producción se usa bcrypt
 * @param {string} password - Password to hash
 * @returns {string} Hashed password
 */
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

module.exports = {
    encrypt,
    decrypt,
    hashPassword
};
