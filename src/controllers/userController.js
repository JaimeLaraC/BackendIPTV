const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * Controlador de gestión de usuarios y autenticación
 */
class UserController {
    /**
     * Registro de nuevo usuario
     * POST /api/auth/register
     * Body: { email, password, iptv_url, iptv_username, iptv_password }
     */
    async register(req, res, next) {
        try {
            const { email, password, iptv_url, iptv_username, iptv_password } = req.body;

            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'Email already registered'
                });
            }

            // Crear nuevo usuario
            const user = new User({
                email,
                password,
                iptv_credentials: {
                    url: iptv_url,
                    username: iptv_username,
                    password: iptv_password
                }
            });

            // Guardar en la base de datos (se hashea password y se encriptan credenciales automáticamente)
            await user.save();

            // Generar token JWT
            const token = generateToken({ userId: user._id });

            // Responder con usuario y token
            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    token,
                    user: {
                        id: user._id,
                        email: user.email,
                        createdAt: user.createdAt
                    }
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Login de usuario
     * POST /api/auth/login
     * Body: { email, password }
     */
    async login(req, res, next) {
        try {
            const { email, password, username, url } = req.body;

            // SCENARIO 1: Login with Xtream Credentials (URL provided)
            if (url && username) {
                const xtreamService = require('../services/xtreamService');

                // 1. Authenticate with Xtream API
                try {
                    await xtreamService.authenticate(url, username, password);
                } catch (err) {
                    return res.status(401).json({
                        success: false,
                        error: 'Invalid Xtream credentials or server unreachable: ' + err.message
                    });
                }

                // 2. Create or Update "Shadow" User
                // We use a dummy email to satisfy the model's unique email constraint
                const shadowEmail = `${username}@xtream.local`; // e.g., 4c47a8916ddf@xtream.local

                let user = await User.findOne({ email: shadowEmail });

                if (user) {
                    // Update credentials if they changed
                    user.iptv_credentials = { url, username, password };
                    user.password = password; // Update local password too
                    await user.save();
                } else {
                    // Create new user
                    user = await User.create({
                        email: shadowEmail,
                        password: password,
                        iptv_credentials: { url, username, password }
                    });
                }

                // 3. Generate Token
                const token = generateToken({ userId: user._id });

                return res.status(200).json({
                    success: true,
                    message: 'Login successful via Xtream',
                    data: {
                        token,
                        user: {
                            id: user._id,
                            email: user.email
                        }
                    }
                });
            }

            // SCENARIO 2: Standard Local Login (Email/Password)
            if (!email) {
                return res.status(400).json({
                    success: false,
                    error: 'Email or Xtream credentials required'
                });
            }

            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            const token = generateToken({ userId: user._id });

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    user: {
                        id: user._id,
                        email: user.email
                    }
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtener perfil del usuario autenticado
     * GET /api/auth/profile
     * Header: Authorization: Bearer <token>
     */
    async getProfile(req, res, next) {
        try {
            // El usuario ya está cargado en req.user por el middleware auth
            const user = req.user;

            // Desencriptar credenciales IPTV para mostrarlas
            const decryptedCredentials = user.getDecryptedCredentials();

            return res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        iptv_credentials: decryptedCredentials,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Actualizar credenciales IPTV del usuario
     * PUT /api/auth/iptv-credentials
     * Header: Authorization: Bearer <token>
     * Body: { iptv_url?, iptv_username?, iptv_password? }
     */
    async updateIptvCredentials(req, res, next) {
        try {
            const { iptv_url, iptv_username, iptv_password } = req.body;
            const user = req.user;

            // Actualizar solo los campos proporcionados
            if (iptv_url) {
                user.iptv_credentials.url = iptv_url;
            }
            if (iptv_username) {
                user.iptv_credentials.username = iptv_username;
            }
            if (iptv_password) {
                user.iptv_credentials.password = iptv_password;
            }

            // Marcar las credenciales como modificadas para que se vuelvan a encriptar
            user.markModified('iptv_credentials');

            // Guardar cambios
            await user.save();

            // Obtener credenciales desencriptadas para la respuesta
            const decryptedCredentials = user.getDecryptedCredentials();

            return res.status(200).json({
                success: true,
                message: 'IPTV credentials updated successfully',
                data: {
                    iptv_credentials: decryptedCredentials
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Eliminar cuenta de usuario
     * DELETE /api/auth/account
     * Header: Authorization: Bearer <token>
     */
    async deleteAccount(req, res, next) {
        try {
            const user = req.user;

            // Eliminar usuario
            await User.findByIdAndDelete(user._id);

            return res.status(200).json({
                success: true,
                message: 'Account deleted successfully'
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
