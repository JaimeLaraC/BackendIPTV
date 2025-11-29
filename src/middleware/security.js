const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

/**
 * Configuración de seguridad para la aplicación Express
 * @param {Object} app - Instancia de la aplicación Express
 */
const setupSecurity = (app) => {
    // 1. Set security HTTP headers
    app.use(helmet());

    // 2. Limit requests from same API
    const limiter = rateLimit({
        max: 100, // 100 requests per windowMs
        windowMs: 15 * 60 * 1000, // 15 minutes
        message: {
            success: false,
            error: 'Too many requests from this IP, please try again in 15 minutes'
        },
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });
    app.use('/api', limiter);

    // 3. Data sanitization against NoSQL query injection
    app.use(mongoSanitize());

    // 4. Data sanitization against XSS
    app.use(xss());

    // 5. Prevent parameter pollution
    app.use(hpp());
};

module.exports = setupSecurity;
