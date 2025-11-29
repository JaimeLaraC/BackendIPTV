# Backend IPTV - Xtream Codes API

Backend profesional Node.js/Express para aplicaciones IPTV que utiliza el protocolo Xtream Codes API. Sistema completo con autenticación JWT, gestión de usuarios, caché Redis y documentación interactiva.

## 🚀 Características

### Core
- 🔐 **Autenticación JWT** - Sistema seguro de sesiones con tokens
- 👤 **Gestión de Usuarios** - Registro, login, perfil y actualización de credenciales
- 🗄️ **Base de Datos MongoDB** - Almacenamiento seguro de usuarios y credenciales IPTV encriptadas
- 📺 **Canales en Vivo (Live TV)** - Gestión completa de categorías y streams
- 🎬 **Video On Demand (VOD)** - Películas, series y contenido bajo demanda
- 🔄 **URLs de Streaming** - Construcción automática de URLs reproducibles

### Seguridad y Performance
- 🛡️ **Helmet** - Cabeceras HTTP seguras
- ⏱️ **Rate Limiting** - Protección contra ataques de fuerza bruta (100 req/15min)
- 🧹 **Sanitización de Datos** - Protección contra inyecciones NoSQL y XSS
- 🔒 **Encriptación AES-256** - Credenciales IPTV encriptadas en DB
- ⚡ **Redis Cache** - Respuestas cacheadas (5-10 min) para máxima velocidad
- 💨 **Compresión Gzip** - Reducción de ancho de banda

### Observabilidad y Docs
- 📝 **Winston Logger** - Logs profesionales en archivos
- 📚 **Swagger UI** - Documentación interactiva de la API
- 🌐 **CORS Configurable** - Integración segura con frontend

## 📋 Requisitos Previos

- Node.js v14 o superior
- MongoDB 4.4+ (local o remoto)
- Redis 6+ (opcional pero recomendado para caché)
- npm o yarn
- Credenciales de acceso a un servidor Xtream Codes (URL, usuario, contraseña)

## 📦 Instalación

```bash
# Clonar el repositorio
cd BackendIPTV

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

## ⚙️ Configuración

Edita el archivo `.env` con los siguientes valores:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/iptv_backend

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRES_IN=7d

# Encryption Key (debe ser exactamente 32 caracteres)
ENCRYPTION_KEY=12345678901234567890123456789012

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3001

# Redis (opcional, para caché)
REDIS_URL=redis://localhost:6379
```

### Configuración de MongoDB

#### Opción 1: MongoDB local
```bash
# Instalar MongoDB
sudo apt-get install mongodb  # Ubuntu/Debian
brew install mongodb-community  # macOS

# Iniciar MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

#### Opción 2: MongoDB con Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Opción 3: MongoDB Atlas (Cloud)
1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Actualiza `MONGODB_URI` con tu connection string

### Configuración de Redis (Opcional)

```bash
# Opción 1: Redis con Docker (recomendado)
docker run -d -p 6379:6379 --name redis redis:latest

# Opción 2: Redis local
sudo apt-get install redis-server  # Ubuntu/Debian
brew install redis  # macOS
```

## 🏃 Ejecución

### Modo Desarrollo (con hot reload)
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

El servidor iniciará en `http://localhost:3000` (o el puerto configurado en `.env`)

## 📚 Estructura del Proyecto

```
BackendIPTV/
├── src/
│   ├── controllers/           # Lógica de negocio
│   │   ├── userController.js      # Gestión de usuarios
│   │   ├── liveController.js      # Canales en vivo
│   │   └── vodController.js       # Video on Demand
│   ├── models/                # Modelos de MongoDB
│   │   └── User.js                # Modelo de usuario
│   ├── services/              # Servicios externos
│   │   └── xtreamService.js       # Comunicación con API Xtream
│   ├── routes/                # Definición de endpoints
│   │   ├── userRoutes.js          # Rutas de autenticación
│   │   ├── liveRoutes.js          # Rutas de live TV
│   │   └── vodRoutes.js           # Rutas de VOD
│   ├── middleware/            # Middleware personalizado
│   │   ├── auth.js                # Autenticación JWT
│   │   ├── cache.js               # Middleware de caché Redis
│   │   ├── security.js            # Configuración de seguridad
│   │   └── errorHandler.js        # Manejo de errores
│   ├── validators/            # Validadores de entrada
│   │   └── authValidator.js       # Validación de registro/login
│   ├── utils/                 # Utilidades
│   │   ├── urlBuilder.js          # Constructor de URLs
│   │   ├── encryption.js          # Encriptación AES-256
│   │   ├── jwt.js                 # Utilidades JWT
│   │   └── logger.js              # Logger Winston
│   ├── config/                # Configuraciones
│   │   ├── database.js            # Conexión MongoDB
│   │   ├── redis.js               # Conexión Redis
│   │   └── swagger.js             # Configuración Swagger
│   └── app.js                 # Configuración de Express
├── server.js                  # Punto de entrada
├── logs/                      # Logs de la aplicación
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### 📄 Documentación Interactiva

**Accede a Swagger UI en:** `http://localhost:3000/api-docs`

Aquí podrás probar todos los endpoints de forma interactiva.

---

### Health Check

**GET** `/health`

Verifica que el servidor esté funcionando.

**Respuesta:**
```json
{
  "success": true,
  "message": "IPTV Backend API is running",
  "timestamp": "2025-11-30T00:00:00.000Z",
  "environment": "development",
  "database": "connected"
}
```

---

### 👤 Autenticación y Usuarios

#### POST `/api/auth/register`

Registra un nuevo usuario con sus credenciales IPTV.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "iptv_url": "http://example.com:8080",
  "iptv_username": "your_iptv_user",
  "iptv_password": "your_iptv_pass"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "usuario@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### POST `/api/auth/login`

Inicia sesión y obtiene un token JWT.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "usuario@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### GET `/api/auth/profile`

Obtiene el perfil del usuario autenticado (incluye credenciales IPTV desencriptadas).

**Header Requerido:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "usuario@example.com",
      "iptv_credentials": {
        "url": "http://example.com:8080",
        "username": "your_iptv_user",
        "password": "your_iptv_pass"
      }
    }
  }
}
```

---

#### PUT `/api/auth/iptv-credentials`

Actualiza las credenciales IPTV del usuario.

**Header Requerido:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "iptv_url": "http://newserver.com:8080",
  "iptv_username": "new_username",
  "iptv_password": "new_password"
}
```

---

### 📺 Canales en Vivo (Live TV)

**Nota:** Todos los endpoints de Live y VOD requieren autenticación JWT.

#### POST `/api/live/categories`

Obtiene todas las categorías de canales en vivo.

**Header Requerido:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "category_id": "1",
      "category_name": "Deportes",
      "parent_id": 0
    }
  ],
  "count": 1
}
```

**Caché:** 5 minutos

---

#### POST `/api/live/streams/:category_id`

Obtiene los canales de una categoría específica.

**Header Requerido:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "num": 1,
      "name": "ESPN HD",
      "stream_id": 12345,
      "stream_url": "http://example.com:8080/live/username/password/12345.ts",
      "icon_url": "http://example.com:8080/logos/espn.png"
    }
  ],
  "count": 1,
  "category_id": "1"
}
```

**Caché:** 5 minutos

---

### 🎬 Video On Demand (VOD)

#### POST `/api/vod/categories`

Obtiene todas las categorías de VOD.

**Header Requerido:**
```
Authorization: Bearer <token>
```

**Caché:** 10 minutos

---

#### POST `/api/vod/streams/:category_id`

Obtiene las películas/series de una categoría VOD.

**Header Requerido:**
```
Authorization: Bearer <token>
```

**Caché:** 10 minutos

---

#### POST `/api/vod/info/:vod_id`

Obtiene información detallada de un VOD específico.

**Header Requerido:**
```
Authorization: Bearer <token>
```

**Caché:** 10 minutos

---

## 🎯 Ejemplos de Uso desde el Frontend

### Flujo Completo con JWT

```javascript
// 1. Registro de usuario
const register = async () => {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password123',
      iptv_url: 'http://your-iptv-server.com:8080',
      iptv_username: 'your_user',
      iptv_password: 'your_pass'
    })
  });
  
  const data = await response.json();
  // Guardar token
  localStorage.setItem('token', data.data.token);
};

// 2. Login (si ya estás registrado)
const login = async () => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.data.token);
};

// 3. Obtener categorías (autenticado)
const getCategories = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/live/categories', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log(data.data); // Array de categorías
};

// 4. Obtener canales de una categoría
const getStreams = async (categoryId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:3000/api/live/streams/${categoryId}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  // stream_url listo para reproducir
  console.log(data.data[0].stream_url);
};
```

### Ejemplo con Axios e Interceptores

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Interceptor para añadir token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const { data } = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});
localStorage.setItem('token', data.data.token);

// Obtener categorías (automáticamente añade el token)
const categories = await api.post('/live/categories');

// Obtener canales
const streams = await api.post('/live/streams/1');
```

---

## 🔧 Manejo de Errores

Todas las respuestas de error siguen este formato:

```json
{
  "success": false,
  "error": "Descripción del error"
}
```

### Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| `200` | Petición exitosa |
| `201` | Recurso creado exitosamente |
| `400` | Parámetros faltantes o inválidos |
| `401` | No autenticado o token inválido |
| `404` | Endpoint no encontrado |
| `429` | Demasiadas peticiones (rate limit) |
| `500` | Error interno del servidor |
| `503` | No se puede conectar al servidor IPTV |
| `504` | Timeout de conexión |

---

## 🛠️ Troubleshooting

### El servidor no inicia

**Error: Port 3000 is already in use**

```bash
# Linux/Mac
fuser -k 3000/tcp

# Cambiar puerto en .env
PORT=3001
```

---

### MongoDB no conecta

**Error: MongoNetworkError**

1. Verifica que MongoDB esté corriendo:
```bash
sudo systemctl status mongod  # Linux
brew services list | grep mongodb  # macOS
```

2. Si usas Docker:
```bash
docker ps | grep mongo
docker start mongodb
```

---

### Redis no disponible

Si Redis no está disponible, el backend funcionará pero sin caché. Para habilitarlo:

```bash
# Con Docker
docker run -d -p 6379:6379 --name redis redis

# Verificar conexión
docker logs redis
```

---

### Token JWT Expirado

**Error: Token expired**

El usuario debe hacer login nuevamente. Los tokens duran 7 días por defecto (configurable en `.env`).

---

## 🔐 Seguridad

### Implementaciones de Seguridad

- ✅ **Helmet** - Headers HTTP seguros
- ✅ **Rate Limiting** - 100 peticiones por IP cada 15 minutos
- ✅ **JWT Authentication** - Tokens seguros con expiración
- ✅ **AES-256 Encryption** - Credenciales IPTV encriptadas en DB
- ✅ **NoSQL Injection Protection** - Sanitización de inputs
- ✅ **XSS Protection** - Limpieza de datos
- ✅ **HPP Protection** - Protección contra parameter pollution

### Recomendaciones para Producción

1. **HTTPS:** Usa siempre HTTPS en producción
2. **JWT_SECRET:** Genera un secret fuerte y único
3. **ENCRYPTION_KEY:** 32 caracteres aleatorios
4. **CORS:** Especifica orígenes permitidos en `ALLOWED_ORIGINS`
5. **MongoDB:** Habilita autenticación en producción
6. **Logs:** Rotar logs periódicamente

---

## 🚀 Despliegue en Producción

### Variables de entorno recomendadas

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://user:pass@localhost:27017/iptv_backend
JWT_SECRET=TuSecretSuperSeguroYAleatorio32Chars
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=32CaracteresAleatoriosParaAES256
ALLOWED_ORIGINS=https://tu-frontend.com
REDIS_URL=redis://localhost:6379
```

### Usando PM2 (Process Manager)

```bash
npm install -g pm2

# Iniciar
pm2 start server.js --name iptv-backend

# Ver logs
pm2 logs iptv-backend

# Monitoreo
pm2 monit

# Reiniciar
pm2 restart iptv-backend

# Auto-start en boot
pm2 startup
pm2 save
```

### Docker

```bash
# Build
docker build -t iptv-backend .

# Run
docker run -d -p 3000:3000 \
  --name iptv-backend \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/iptv_backend \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  iptv-backend
```

---

## 📊 Logs y Monitoreo

Los logs se guardan en la carpeta `logs/`:

- `logs/all.log` - Todos los logs
- `logs/error.log` - Solo errores

Formato JSON para fácil procesamiento:
```json
{
  "level": "info",
  "message": "GET /api/live/categories",
  "timestamp": "2025-11-30 00:30:00:000"
}
```

---

## 📝 Notas Adicionales

### URLs de Streaming

El backend construye automáticamente las URLs reproducibles:

- **Live TV:** `http://server:port/live/username/password/stream_id.ts`
- **VOD:** `http://server:port/movie/username/password/stream_id.mp4`

### Performance

- **Redis Cache:** Las respuestas se cachean 5-10 minutos
- **Compresión Gzip:** Reduce el tamaño de respuestas en ~70%
- **Connection Pooling:** MongoDB usa pooling automático

### Diferencias con Versión Anterior

**IMPORTANTE:** Esta versión usa autenticación con JWT y MongoDB. La versión anterior (stateless) ya no es compatible.

**Cambios principales:**
- ❌ **Antes:** Enviar credenciales IPTV en cada petición
- ✅ **Ahora:** Registrarse una vez, usar token JWT

---

## 📄 Licencia

MIT

---

## 👨‍💻 Soporte

Para reportar problemas o solicitar funcionalidades, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ usando Node.js + Express + MongoDB + Redis**