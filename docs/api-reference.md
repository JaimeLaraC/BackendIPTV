# Referencia API

## 📡 Endpoints Disponibles

> **Nota:** Para documentación interactiva, visita `http://localhost:3000/api-docs` cuando el servidor esté corriendo.

## Base URL

```
http://localhost:3000/api
```

---

## 🔓 Endpoints Públicos (Sin autenticación)

### Health Check

```http
GET /health
```

Verifica que el servidor esté funcionando.

**Response (200)**
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

### Registro de Usuario

```http
POST /auth/register
```

Crea un nuevo usuario y retorna un token JWT.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "iptv_url": "http://iptv-server.com:8080",
  "iptv_username": "iptv_user",
  "iptv_password": "iptv_pass"
}
```

**Validaciones:**
- `email`: Email válido, único en la base de datos
- `password`: Mínimo 6 caracteres
- `iptv_url`: URL válida con protocolo (http:// o https://)
- `iptv_username`: Requerido, no vacío
- `iptv_password`: Requerido, no vacío

**Response (201)**
```json
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

**Errors:**
- `400` - Validation error
- `409` - Email already exists

---

### Login

```http
POST /auth/login
```

Autentica un usuario y retorna un token JWT.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200)**
```json
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

**Errors:**
- `400` - Validation error
- `401` - Invalid credentials

---

## 🔐 Endpoints Protegidos (Requieren JWT)

> **Header requerido:** `Authorization: Bearer <token>`

---

## 👤 Gestión de Usuario

### Obtener Perfil

```http
GET /auth/profile
```

Retorna el perfil del usuario autenticado incluyendo credenciales IPTV desencriptadas.

**Headers**
```
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "iptv_credentials": {
        "url": "http://iptv-server.com:8080",
        "username": "iptv_user",
        "password": "iptv_pass"
      },
      "createdAt": "2025-11-29T20:00:00.000Z"
    }
  }
}
```

**Errors:**
- `401` - Unauthorized (token inválido o no proporcionado)

---

### Actualizar Credenciales IPTV

```http
PUT /auth/iptv-credentials
```

Actualiza las credenciales IPTV del usuario. Todos los campos son opcionales.

**Headers**
```
Authorization: Bearer <token>
```

**Request Body**
```json
{
  "iptv_url": "http://newserver.com:8080",
  "iptv_username": "new_user",
  "iptv_password": "new_pass"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "IPTV credentials updated successfully"
}
```

**Errors:**
- `400` - Validation error
- `401` - Unauthorized

---

### Eliminar Cuenta

```http
DELETE /auth/account
```

Elimina permanentemente la cuenta del usuario.

**Headers**
```
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Errors:**
- `401` - Unauthorized

---

## 📺 Live TV (Canales en Vivo)

> **Caché:** 5 minutos

### Obtener Categorías

```http
POST /live/categories
```

Retorna todas las categorías de canales en vivo.

**Headers**
```
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "category_id": "1",
      "category_name": "Deportes",
      "parent_id": 0
    },
    {
      "category_id": "2",
      "category_name": "Noticias",
      "parent_id": 0
    }
  ],
  "count": 2
}
```

---

### Obtener Streams por Categoría

```http
POST /live/streams/:category_id
```

Retorna los canales de una categoría específica.

**Path Parameters:**
- `category_id` - ID de la categoría

**Headers**
```
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "num": 1,
      "name": "ESPN HD",
      "stream_type": "live",
      "stream_id": 12345,
      "stream_icon": "http://server.com:8080/logos/espn.png",
      "epg_channel_id": "ESPN.us",
      "category_id": "1",
      "tv_archive": 1,
      "tv_archive_duration": 7,
      "stream_url": "http://server.com:8080/live/user/pass/12345.ts",
      "icon_url": "http://server.com:8080/logos/espn.png"
    }
  ],
  "count": 1,
  "category_id": "1"
}
```

**Errors:**
- `400` - Missing category_id
- `401` - Unauthorized

---

### Obtener Todos los Streams

```http
POST /live/streams
```

Retorna todos los canales sin filtro de categoría.

**Headers**
```
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "num": 1,
      "name": "ESPN HD",
      "stream_id": 12345,
      "stream_url": "http://server.com:8080/live/user/pass/12345.ts",
      "icon_url": "http://server.com:8080/logos/espn.png"
    }
  ],
  "count": 1
}
```

---

## 🎬 VOD (Video on Demand)

> **Caché:** 10 minutos

### Obtener Categorías VOD

```http
POST /vod/categories
```

Retorna todas las categorías de películas/series.

**Headers**
```
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "category_id": "10",
      "category_name": "Acción",
      "parent_id": 0
    },
    {
      "category_id": "11",
      "category_name": "Comedia",
      "parent_id": 0
    }
  ],
  "count": 2
}
```

---

### Obtener Streams VOD por Categoría

```http
POST /vod/streams/:category_id
```

Retorna las películas/series de una categoría específica.

**Path Parameters:**
- `category_id` - ID de la categoría

**Headers**
```
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "num": 1,
      "name": "The Matrix",
      "stream_type": "movie",
      "stream_id": 54321,
      "stream_icon": "http://server.com:8080/posters/matrix.jpg",
      "rating": "8.7",
      "rating_5based": 4.35,
      "added": "1640995200",
      "category_id": "10",
      "container_extension": "mp4",
      "stream_url": "http://server.com:8080/movie/user/pass/54321.mp4",
      "cover_url": "http://server.com:8080/posters/matrix.jpg",
      "backdrop_url": "http://server.com:8080/backdrops/matrix.jpg"
    }
  ],
  "count": 1,
  "category_id": "10"
}
```

---

### Obtener Información Detallada de VOD

```http
POST /vod/info/:vod_id
```

Retorna información completa de una película/serie específica (metadatos, cast, trama, etc.).

**Path Parameters:**
- `vod_id` - ID del VOD

**Headers**
```
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "info": {
      "tmdb_id": "603",
      "name": "The Matrix",
      "o_name": "The Matrix",
      "cover_big": "http://server.com:8080/posters/matrix.jpg",
      "releasedate": "1999-03-31",
      "episode_run_time": "136",
      "youtube_trailer": "https://youtube.com/watch?v=...",
      "director": "Lana Wachowski, Lilly Wachowski",
      "actors": "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
      "description": "A computer hacker learns...",
      "plot": "Detailed plot summary...",
      "age": "R",
      "rating": "8.7",
      "country": "USA, Australia",
      "genre": "Action, Sci-Fi",
      "duration": "8160",
      "backdrop_path": ["http://server.com:8080/backdrops/matrix.jpg"],
      "cover_url": "http://server.com:8080/posters/matrix.jpg"
    },
    "movie_data": {
      "stream_id": 54321,
      "name": "The Matrix",
      "container_extension": "mp4",
      "stream_url": "http://server.com:8080/movie/user/pass/54321.mp4"
    }
  }
}
```

---

## 🚫 Códigos de Error

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| `200` | Success | Operación exitosa |
| `201` | Created | Usuario creado |
| `400` | Bad Request | Parámetros inválidos o faltantes |
| `401` | Unauthorized | Token inválido o no proporcionado |
| `404` | Not Found | Endpoint no encontrado |
| `409` | Conflict | Email ya existe |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Internal Server Error | Error del servidor |
| `503` | Service Unavailable | No se puede conectar al servidor IPTV |
| `504` | Gateway Timeout | Timeout al servidor IPTV |

## ❌ Formato de Error

Todas las respuestas de error siguen este formato:

```json
{
  "success": false,
  "error": "Descripción del error"
}
```

### Ejemplos de Errores

**Validation Error (400)**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters long"
    }
  ]
}
```

**Unauthorized (401)**
```json
{
  "success": false,
  "error": "Please authenticate"
}
```

**Rate Limit (429)**
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again in 15 minutes"
}
```

---

## 📝 Notas Importantes

### Rate Limiting
- **Límite:** 100 peticiones por IP cada 15 minutos
- **Scope:** Solo endpoints `/api/*`
- **Headers de respuesta:**
  - `RateLimit-Limit`: Límite total
  - `RateLimit-Remaining`: Peticiones restantes
  - `RateLimit-Reset`: Timestamp de reset

### Caché
- **Live TV:** 5 minutos TTL
- **VOD:** 10 minutos TTL
- **Headers de respuesta:** No hay headers Cache-Control (transparente al cliente)

### URLs de Streaming
Todas las respuestas de streams incluyen `stream_url` listo para usar:
- **Live:** `http://server:port/live/username/password/stream_id.ts`
- **VOD:** `http://server:port/movie/username/password/stream_id.mp4`

Estas URLs pueden usarse directamente en reproductores de video.
