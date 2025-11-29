const { body, validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

/**
 * Validador para registro de usuario
 */
const registerValidator = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .trim(),

    body('iptv_url')
        .notEmpty()
        .withMessage('IPTV URL is required')
        .isURL({ require_protocol: true })
        .withMessage('Please provide a valid IPTV URL with protocol (http:// or https://)')
        .trim(),

    body('iptv_username')
        .notEmpty()
        .withMessage('IPTV username is required')
        .trim(),

    body('iptv_password')
        .notEmpty()
        .withMessage('IPTV password is required'),

    handleValidationErrors
];

/**
 * Validador para login de usuario
 */
const loginValidator = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors
];

/**
 * Validador para actualización de credenciales IPTV
 */
const updateCredentialsValidator = [
    body('iptv_url')
        .optional()
        .isURL({ require_protocol: true })
        .withMessage('Please provide a valid IPTV URL with protocol')
        .trim(),

    body('iptv_username')
        .optional()
        .notEmpty()
        .withMessage('IPTV username cannot be empty')
        .trim(),

    body('iptv_password')
        .optional()
        .notEmpty()
        .withMessage('IPTV password cannot be empty'),

    handleValidationErrors
];

module.exports = {
    registerValidator,
    loginValidator,
    updateCredentialsValidator
};
