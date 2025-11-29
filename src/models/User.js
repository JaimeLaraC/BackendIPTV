const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/encryption');

/**
 * Schema de Usuario
 */
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // No incluir en queries por defecto
    },

    iptv_credentials: {
        url: {
            type: String,
            required: [true, 'IPTV URL is required']
        },
        username: {
            type: String,
            required: [true, 'IPTV username is required']
        },
        password: {
            type: String,
            required: [true, 'IPTV password is required']
        }
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Añade automáticamente createdAt y updatedAt
});

/**
 * Hook pre-save: Hash del password antes de guardar
 */
userSchema.pre('save', async function (next) {
    // Solo hashear si el password ha sido modificado
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generar salt y hashear password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Hook pre-save: Encriptar credenciales IPTV antes de guardar
 */
userSchema.pre('save', function (next) {
    try {
        // Solo encriptar si las credenciales han sido modificadas
        if (this.isModified('iptv_credentials')) {
            this.iptv_credentials.url = encrypt(this.iptv_credentials.url);
            this.iptv_credentials.username = encrypt(this.iptv_credentials.username);
            this.iptv_credentials.password = encrypt(this.iptv_credentials.password);
        }
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Método de instancia: Comparar password
 * @param {string} candidatePassword - Password a comparar
 * @returns {Promise<boolean>} True si coincide, false si no
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

/**
 * Método de instancia: Obtener credenciales IPTV desencriptadas
 * @returns {Object} Credenciales IPTV desencriptadas
 */
userSchema.methods.getDecryptedCredentials = function () {
    try {
        return {
            url: decrypt(this.iptv_credentials.url),
            username: decrypt(this.iptv_credentials.username),
            password: decrypt(this.iptv_credentials.password)
        };
    } catch (error) {
        throw new Error('Error decrypting IPTV credentials');
    }
};

/**
 * Método de instancia: Objeto JSON seguro (sin datos sensibles)
 * @returns {Object} Usuario sin password ni credenciales encriptadas
 */
userSchema.methods.toSafeObject = function () {
    const obj = this.toObject();

    // Eliminar campos sensibles
    delete obj.password;
    delete obj.__v;

    return obj;
};

/**
 * Índices para mejorar performance
 */
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
