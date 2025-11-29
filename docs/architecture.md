# Arquitectura del Sistema

## 🏗️ Visión General

El Backend IPTV es una aplicación Node.js/Express que actúa como middleware entre aplicaciones frontend y servidores IPTV Xtream Codes. Implementa un sistema de autenticación JWT, almacenamiento seguro de credenciales y caché de alto rendimiento.

## 📊 Diagrama de Arquitectura

```
┌─────────────┐
│   Frontend  │
│  (React/    │
│   Vue/etc)  │
└──────┬──────┘
       │ HTTP + JWT
       │
┌──────▼──────────────────────────────────────┐
│         Backend IPTV (Express)              │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │     Security Layer                 │    │
│  │  - Helmet (Headers)                │    │
│  │  - Rate Limiting                   │    │
│  │  - Data Sanitization               │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │     Authentication Middleware      │    │
│  │  - JWT Verification                │    │
│  │  - User Loading                    │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │     Cache Middleware (Redis)       │    │
│  │  - Check Cache                     │    │
│  │  - Return if Hit                   │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │     Controllers                    │    │
│  │  - userController                  │    │
│  │  - liveController                  │    │
│  │  - vodController                   │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │     Services                       │    │
│  │  - xtreamService (API calls)       │    │
│  └────────────────────────────────────┘    │
└──────┬────────────────────┬─────────────────┘
       │                    │
       │                    │
┌──────▼──────┐      ┌─────▼──────┐
│   MongoDB   │      │   Redis    │
│   (Users &  │      │  (Cache)   │
│ Credentials)│      │            │
└─────────────┘      └────────────┘
       │
       │
┌──────▼─────────────────┐
│  IPTV Xtream Server    │
│  (External Provider)   │
└────────────────────────┘
```

## 🔄 Flujo de Datos

### 1. Registro de Usuario
```
Frontend → POST /api/auth/register
    ↓
Validation (express-validator)
    ↓
Hash Password (bcrypt)
    ↓
Encrypt IPTV Credentials (AES-256)
    ↓
Save to MongoDB
    ↓
Generate JWT Token
    ↓
Return {user, token}
```

### 2. Login
```
Frontend → POST /api/auth/login
    ↓
Find User in MongoDB
    ↓
Compare Password (bcrypt)
    ↓
Generate JWT Token
    ↓
Return {user, token}
```

### 3. Request con Autenticación (ej: Get Categories)
```
Frontend → POST /api/live/categories + JWT Header
    ↓
Rate Limiter Check
    ↓
JWT Verification (middleware)
    ↓
Load User from MongoDB
    ↓
Cache Middleware Check Redis
    ↓ (cache miss)
Decrypt User's IPTV Credentials
    ↓
Call Xtream API (xtreamService)
    ↓
Save Response to Redis (TTL: 5min)
    ↓
Return Response + Compression
```

## 🧩 Componentes Principales

### 1. **Controllers** (`src/controllers/`)
Manejan la lógica de negocio de cada endpoint:
- `userController.js` - Gestión de usuarios (CRUD)
- `liveController.js` - Canales en vivo
- `vodController.js` - Video on Demand

### 2. **Services** (`src/services/`)
Comunicación con APIs externas:
- `xtreamService.js` - Wrapper para Xtream Codes API

### 3. **Middleware** (`src/middleware/`)
- `auth.js` - Verificación JWT y carga de usuario
- `cache.js` - Manejo de caché Redis
- `security.js` - Configuración de seguridad (Helmet, Rate Limit, etc.)
- `errorHandler.js` - Manejo centralizado de errores

### 4. **Models** (`src/models/`)
- `User.js` - Schema de MongoDB para usuarios

### 5. **Utils** (`src/utils/`)
- `jwt.js` - Utilidades JWT (generate, verify)
- `encryption.js` - Encriptación AES-256
- `logger.js` - Winston logger
- `urlBuilder.js` - Constructor de URLs de streaming

### 6. **Config** (`src/config/`)
- `database.js` - Conexión MongoDB
- `redis.js` - Cliente Redis
- `swagger.js` - Configuración Swagger

## 🔐 Capas de Seguridad

```
Request
  ↓
1. Helmet (Headers HTTP seguros)
  ↓
2. Rate Limiter (100 req/15min)
  ↓
3. CORS (orígenes permitidos)
  ↓
4. Body Parser con límite (10kb)
  ↓
5. Data Sanitization (NoSQL + XSS)
  ↓
6. HPP (Parameter Pollution)
  ↓
7. JWT Verification
  ↓
Controller
```

## ⚡ Estrategia de Caché

### Cache Hit
```
Request → Cache Middleware → Redis (HIT) → Return (5ms)
```

### Cache Miss
```
Request → Cache Middleware → Redis (MISS) 
    ↓
Controller → Xtream API (1000ms)
    ↓
Save to Redis (TTL)
    ↓
Return Response
```

### TTL por Recurso
- **Live Categories**: 5 minutos
- **Live Streams**: 5 minutos
- **VOD Categories**: 10 minutos
- **VOD Streams**: 10 minutos
- **VOD Info**: 10 minutos

## 📁 Estructura de Directorios

```
BackendIPTV/
├── src/
│   ├── config/          # Configuraciones (DB, Redis, Swagger)
│   ├── controllers/     # Lógica de negocio
│   ├── middleware/      # Middleware personalizado
│   ├── models/          # Modelos MongoDB
│   ├── routes/          # Definición de rutas
│   ├── services/        # Servicios externos
│   ├── utils/           # Utilidades
│   ├── validators/      # Validadores de entrada
│   └── app.js           # Configuración Express
├── docs/                # Documentación
├── logs/                # Logs de aplicación
├── server.js            # Punto de entrada
└── package.json         # Dependencias
```

## 🔌 Integraciones Externas

### MongoDB
- **Propósito**: Almacenamiento de usuarios y credenciales encriptadas
- **Puerto**: 27017 (default)
- **Base de Datos**: `iptv_backend`
- **Colecciones**: `users`

### Redis
- **Propósito**: Caché de respuestas de API
- **Puerto**: 6379 (default)
- **Estrategia**: Key-Value con TTL

### Xtream Codes API
- **Propósito**: Proveedor de contenido IPTV
- **Protocolo**: HTTP REST
- **Autenticación**: URL + Username + Password

## 📊 Performance

### Métricas Esperadas
- **Response Time (cache hit)**: ~5-10ms
- **Response Time (cache miss)**: ~1000-2000ms
- **Throughput**: Limitado por Rate Limiter (100 req/15min por IP)
- **Memory**: ~50-100MB (sin Redis data)

### Optimizaciones Aplicadas
1. ✅ Redis Caching
2. ✅ Gzip Compression
3. ✅ MongoDB Connection Pooling
4. ✅ Async/Await para operaciones I/O
5. ✅ Body Parser con límite de tamaño

## 🔄 Ciclo de Vida del Request

```javascript
// 1. Request llega
app.use(helmet())                    // Headers seguros
app.use(rateLimit())                 // Rate limiting
app.use(compression())               // Compresión
app.use(cors())                      // CORS
app.use(express.json())              // Parse JSON
app.use(mongoSanitize())            // Sanitización
app.use(xss())                       // XSS Clean
app.use(hpp())                       // HPP

// 2. Routing
app.use('/api/auth', userRoutes)    // Sin auth
app.use('/api/live', auth, liveRoutes)  // Con auth
app.use('/api/vod', auth, vodRoutes)    // Con auth

// 3. Middleware de rutas
router.use(auth)                     // JWT verification
router.use(cache(TTL))               // Cache check

// 4. Controller
async getCategories(req, res) {
    // Lógica de negocio
}

// 5. Error Handler
app.use(errorHandler)                // Catch all
```

## 🎯 Decisiones de Diseño

### ¿Por qué JWT?
- ✅ Stateless (no requiere sesiones en servidor)
- ✅ Escalable (funciona con múltiples instancias)
- ✅ Seguro (firma criptográfica)
- ✅ Información en el token (user ID)

### ¿Por qué MongoDB?
- ✅ Esquema flexible
- ✅ Fácil de escalar
- ✅ Integración perfecta con Node.js
- ✅ Mongoose ODM robusto

### ¿Por qué Redis?
- ✅ Extremadamente rápido (in-memory)
- ✅ TTL nativo
- ✅ Fácil de implementar
- ✅ Reduce carga al servidor IPTV en 95%

### ¿Por qué Encriptar Credenciales IPTV?
- ✅ Seguridad adicional en caso de breach de DB
- ✅ Cumple con mejores prácticas de seguridad
- ✅ AES-256 es estándar de la industria
