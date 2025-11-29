# Autenticación JWT

## 🔐 Visión General

El sistema utiliza **JSON Web Tokens (JWT)** para autenticación stateless. Los usuarios se registran una vez con sus credenciales IPTV, y luego usan un token JWT para acceder a todos los endpoints protegidos.

## 📋 Flujo Completo de Autenticación

### 1. Registro de Usuario

```
┌─────────┐                                    ┌─────────┐
│ Cliente │                                    │ Backend │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  POST /api/auth/register                    │
     │  { email, password, iptv_url,               │
     │    iptv_username, iptv_password }           │
     ├─────────────────────────────────────────────►
     │                                              │
     │                                    ┌─────────▼────────┐
     │                                    │ 1. Validar Inputs│
     │                                    │   (express-      │
     │                                    │    validator)    │
     │                                    └─────────┬────────┘
     │                                              │
     │                                    ┌─────────▼────────┐
     │                                    │ 2. Hash Password │
     │                                    │   (bcryptjs)     │
     │                                    └─────────┬────────┘
     │                                              │
     │                                    ┌─────────▼────────┐
     │                                    │ 3. Encrypt IPTV  │
     │                                    │   Credentials    │
     │                                    │   (AES-256)      │
     │                                    └─────────┬────────┘
     │                                              │
     │                                    ┌─────────▼────────┐
     │                                    │ 4. Save User     │
     │                                    │   to MongoDB     │
     │                                    └─────────┬────────┘
     │                                              │
     │                                    ┌─────────▼────────┐
     │                                    │ 5. Generate JWT  │
     │                                    │   Token          │
     │                                    └─────────┬────────┘
     │                                              │
     │  { user: {...}, token: "..." }              │
     ◄─────────────────────────────────────────────┤
     │                                              │
```

**Validaciones:**
- Email válido y único
- Password mínimo 6 caracteres
- IPTV URL con protocolo (http:// o https://)
- IPTV username y password requeridos

### 2. Login

```javascript
// Request
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response (200)
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Proceso:**
1. Buscar usuario por email en MongoDB
2. Comparar password con hash almacenado (bcrypt)
3. Si es válido, generar JWT token
4. Retornar usuario y token

### 3. Acceso a Endpoints Protegidos

```javascript
// Todas las peticiones deben incluir el header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Ejemplo
fetch('http://localhost:3000/api/live/categories', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## 🔑 Estructura del JWT Token

### Payload
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "iat": 1638316800,
  "exp": 1638921600
}
```

### Componentes
- **userId**: ID del usuario en MongoDB
- **iat** (Issued At): Timestamp de creación
- **exp** (Expiration): Timestamp de expiración (7 días por defecto)

### Firma
El token está firmado con `JWT_SECRET` del archivo `.env`:
```javascript
jwt.sign(payload, process.env.JWT_SECRET)
```

## 🛡️ Middleware de Autenticación

### Implementación (`src/middleware/auth.js`)

```javascript
const auth = async (req, res, next) => {
  try {
    // 1. Extraer token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    // 2. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Buscar usuario en DB
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new Error();
    }

    // 4. Adjuntar usuario al request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Please authenticate'
    });
  }
};
```

### Uso en Rutas

```javascript
// Sin autenticación
router.post('/register', userController.register);
router.post('/login', userController.login);

// Con autenticación (middleware aplicado)
router.get('/profile', auth, userController.getProfile);
router.post('/categories', auth, liveController.getCategories);
```

## 🔄 Gestión de Credenciales IPTV

### Almacenamiento Seguro

Las credenciales IPTV se almacenan **encriptadas** en MongoDB:

```javascript
// Antes de guardar (en User.js)
userSchema.pre('save', async function(next) {
  if (this.isModified('iptv_credentials')) {
    this.iptv_credentials = encrypt(this.iptv_credentials);
  }
  next();
});
```

### Desencriptación en Runtime

```javascript
// Método del modelo User
userSchema.methods.getDecryptedCredentials = function() {
  return decrypt(this.iptv_credentials);
};

// Uso en controlador
const credentials = req.user.getDecryptedCredentials();
// { url: "http://...", username: "...", password: "..." }
```

### Actualización de Credenciales

```javascript
PUT /api/auth/iptv-credentials
Authorization: Bearer <token>

{
  "iptv_url": "http://newserver.com:8080",
  "iptv_username": "new_user",
  "iptv_password": "new_pass"
}
```

## ⏰ Expiración y Renovación de Tokens

### Configuración de Expiración

```env
# .env
JWT_EXPIRES_IN=7d  # 7 días
```

### Manejo en Frontend

```javascript
// Guardar token al login
localStorage.setItem('token', data.token);

// Verificar expiración (opcional)
const isTokenExpired = (token) => {
  const decoded = jwt_decode(token);
  return decoded.exp * 1000 < Date.now();
};

// Si expira, redirigir a login
if (isTokenExpired(token)) {
  localStorage.removeItem('token');
  // Redirect to login
}
```

### Respuesta 401 Unauthorized

```json
{
  "success": false,
  "error": "Please authenticate"
}
```

**Posibles causas:**
- Token no proporcionado
- Token inválido o malformado
- Token expirado
- Usuario eliminado de la base de datos

## 🔒 Seguridad

### Mejores Prácticas Implementadas

1. **HTTPS en Producción**
   - Los tokens JWT deben transmitirse solo por HTTPS

2. **Secret Fuerte**
   ```env
   # Mínimo 32 caracteres aleatorios
   JWT_SECRET=TuSecretSuperSeguroYAleatorio32Chars
   ```

3. **Expiración Razonable**
   - 7 días por defecto
   - Ajustable según necesidades de seguridad

4. **No Almacenar Datos Sensibles en JWT**
   - Solo almacenamos el `userId`
   - Datos sensibles se obtienen de DB después de verificación

5. **Validación de Usuario en Cada Request**
   - No solo verificamos el token
   - También verificamos que el usuario aún existe en DB

### Encriptación de Credenciales IPTV

```javascript
// src/utils/encryption.js
const algorithm = 'aes-256-cbc';
const key = process.env.ENCRYPTION_KEY; // 32 caracteres

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  // ...
  return encrypted;
};
```

**Beneficios:**
- Protección adicional en caso de breach de DB
- AES-256 es estándar militar
- IV aleatorio previene ataques de diccionario

## 📝 Ejemplos Completos

### Registro y Primer Login

```javascript
// 1. Registrar usuario
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securePassword123',
    iptv_url: 'http://iptv-server.com:8080',
    iptv_username: 'john_iptv',
    iptv_password: 'iptv_pass'
  })
});

const { data } = await response.json();
const token = data.token;

// 2. Guardar token
localStorage.setItem('token', token);

// 3. Usar token en requests subsiguientes
const categories = await fetch('http://localhost:3000/api/live/categories', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Configurar Axios con Interceptores

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Añadir token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejar 401 automáticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Uso
const { data } = await api.post('/live/categories');
```

## ❓ Preguntas Frecuentes

### ¿Qué pasa si cambio JWT_SECRET?
Todos los tokens existentes se invalidan. Los usuarios deben hacer login nuevamente.

### ¿Puedo tener múltiples sesiones?
Sí, JWT es stateless. Un usuario puede tener tokens en múltiples dispositivos.

### ¿Cómo implemento refresh tokens?
Actualmente no está implementado. Los tokens expiran en 7 días y el usuario debe hacer login de nuevo.

### ¿Los tokens se guardan en el servidor?
No, JWT es stateless. El servidor no guarda tokens, solo verifica su firma.

### ¿Puedo revocar un token?
No directamente. Necesitarías implementar una blacklist en Redis (no implementado actualmente).
