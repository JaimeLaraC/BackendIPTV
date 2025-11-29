# Backend IPTV - Xtream Codes API

Backend middleware Node.js/Express para aplicaciones IPTV que utiliza el protocolo Xtream Codes API. Actúa como intermediario entre el frontend y servidores IPTV, resolviendo problemas de CORS y proporcionando endpoints JSON estructurados.

## 🚀 Características

- ✅ Autenticación con Xtream Codes API
- 📺 Gestión de canales en vivo (Live TV)
- 🎬 Gestión de contenido VOD (películas/series)
- 🔄 Construcción automática de URLs de streaming
- 🛡️ Manejo centralizado de errores
- 🌐 CORS habilitado para integración frontend
- 📝 Respuestas JSON estructuradas

## 📋 Requisitos Previos

- Node.js v14 o superior
- npm o yarn
- Credenciales de acceso a un servidor Xtream Codes (URL, usuario, contraseña)

## 📦 Instalación

```bash
# Clonar el repositorio (o descomprimir)
cd BackendIPTV

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env si necesitas cambiar el puerto (opcional)
```

## ⚙️ Configuración

Edita el archivo `.env` según tus necesidades:

```env
PORT=3000
NODE_ENV=development
```

**Nota:** Las credenciales del servidor IPTV (URL, usuario, contraseña) se envían en cada petición desde el frontend, no están almacenadas en el backend.

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
│   │   ├── authController.js      # Autenticación
│   │   ├── liveController.js      # Canales en vivo
│   │   └── vodController.js       # Video on Demand
│   ├── services/              # Servicios externos
│   │   └── xtreamService.js       # Comunicación con API Xtream
│   ├── routes/                # Definición de endpoints
│   │   ├── authRoutes.js          # Rutas de autenticación
│   │   ├── liveRoutes.js          # Rutas de live TV
│   │   └── vodRoutes.js           # Rutas de VOD
│   ├── middleware/            # Middleware personalizado
│   │   └── errorHandler.js        # Manejo de errores
│   ├── utils/                 # Utilidades
│   │   └── urlBuilder.js          # Constructor de URLs
│   └── app.js                 # Configuración de Express
├── server.js                  # Punto de entrada
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### Health Check

**GET** `/health`

Verifica que el servidor esté funcionando.

**Respuesta:**
```json
{
  "success": true,
  "message": "IPTV Backend API is running",
  "timestamp": "2025-11-29T22:30:00.000Z",
  "environment": "development"
}
```

---

### Autenticación

#### POST `/api/login`

Autentica al usuario contra el servidor Xtream Codes.

**Request Body:**
```json
{
  "url": "http://example.com:8080",
  "username": "your_username",
  "password": "your_password"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "user_info": {
      "username": "your_username",
      "password": "your_password",
      "message": "Active",
      "auth": 1,
      "status": "Active",
      "exp_date": "1735689600",
      "is_trial": "0",
      "active_cons": "1",
      "created_at": "1640995200",
      "max_connections": "2",
      "allowed_output_formats": ["ts", "m3u8"]
    },
    "server_info": {
      "url": "example.com",
      "port": "8080",
      "https_port": "8081",
      "server_protocol": "http",
      "rtmp_port": "1935",
      "time_now": "2025-11-29 22:30:00"
    },
    "expires_at": "1735689600",
    "status": "Active"
  }
}
```

**Errores:**
- `400` - Faltan parámetros obligatorios
- `401` - Credenciales inválidas
- `503` - No se puede conectar al servidor IPTV
- `504` - Timeout de conexión

---

### Canales en Vivo

#### POST `/api/live/categories`

Obtiene todas las categorías de canales en vivo.

**Request Body:**
```json
{
  "url": "http://example.com:8080",
  "username": "your_username",
  "password": "your_password"
}
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

#### POST `/api/live/streams/:category_id`

Obtiene los canales de una categoría específica.

**URL Params:**
- `category_id` - ID de la categoría

**Request Body:**
```json
{
  "url": "http://example.com:8080",
  "username": "your_username",
  "password": "your_password"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "num": 1,
      "name": "ESPN HD",
      "stream_type": "live",
      "stream_id": 12345,
      "stream_icon": "http://example.com:8080/logos/espn.png",
      "epg_channel_id": "ESPN.us",
      "added": "1640995200",
      "category_id": "1",
      "custom_sid": "",
      "tv_archive": 1,
      "direct_source": "",
      "tv_archive_duration": 7,
      "stream_url": "http://example.com:8080/live/your_username/your_password/12345.ts",
      "icon_url": "http://example.com:8080/logos/espn.png"
    }
  ],
  "count": 1,
  "category_id": "1"
}
```

---

#### POST `/api/live/streams`

Obtiene todos los canales sin filtro de categoría.

**Request Body:**
```json
{
  "url": "http://example.com:8080",
  "username": "your_username",
  "password": "your_password"
}
```

**Respuesta:** Similar al endpoint anterior pero sin `category_id` en la respuesta.

---

### Video On Demand (VOD)

#### POST `/api/vod/categories`

Obtiene todas las categorías de VOD.

**Request Body:**
```json
{
  "url": "http://example.com:8080",
  "username": "your_username",
  "password": "your_password"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "category_id": "10",
      "category_name": "Acción",
      "parent_id": 0
    }
  ],
  "count": 1
}
```

---

#### POST `/api/vod/streams/:category_id`

Obtiene las películas/series de una categoría VOD.

**URL Params:**
- `category_id` - ID de la categoría

**Request Body:**
```json
{
  "url": "http://example.com:8080",
  "username": "your_username",
  "password": "your_password"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "num": 1,
      "name": "Película de Ejemplo",
      "stream_type": "movie",
      "stream_id": 54321,
      "stream_icon": "http://example.com:8080/posters/movie.jpg",
      "rating": "8.5",
      "rating_5based": 4.25,
      "added": "1640995200",
      "category_id": "10",
      "container_extension": "mp4",
      "direct_source": "",
      "stream_url": "http://example.com:8080/movie/your_username/your_password/54321.mp4",
      "cover_url": "http://example.com:8080/posters/movie.jpg",
      "backdrop_url": null
    }
  ],
  "count": 1,
  "category_id": "10"
}
```

---

#### POST `/api/vod/info/:vod_id`

Obtiene información detallada de un VOD específico (metadatos, cast, trama, etc.).

**URL Params:**
- `vod_id` - ID del VOD

**Request Body:**
```json
{
  "url": "http://example.com:8080",
  "username": "your_username",
  "password": "your_password"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "info": {
      "tmdb_id": "123456",
      "name": "Película de Ejemplo",
      "o_name": "Example Movie",
      "cover_big": "http://example.com:8080/posters/movie.jpg",
      "releasedate": "2023-01-15",
      "episode_run_time": "120",
      "youtube_trailer": "https://youtube.com/watch?v=...",
      "director": "Director Name",
      "actors": "Actor 1, Actor 2",
      "cast": "Cast info",
      "description": "Movie description...",
      "plot": "Detailed plot...",
      "age": "PG-13",
      "rating": "8.5",
      "country": "USA",
      "genre": "Action, Thriller",
      "duration": "7200",
      "backdrop_path": ["http://example.com:8080/backdrops/1.jpg"]
    },
    "movie_data": {
      "stream_id": 54321,
      "name": "Película de Ejemplo",
      "container_extension": "mp4",
      "stream_url": "http://example.com:8080/movie/your_username/your_password/54321.mp4"
    }
  }
}
```

---

## 🎯 Ejemplos de Uso desde el Frontend

### Ejemplo con Fetch API (JavaScript)

```javascript
// Login
const login = async () => {
  const response = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'http://your-iptv-server.com:8080',
      username: 'your_user',
      password: 'your_pass'
    })
  });
  
  const data = await response.json();
  console.log(data);
};

// Obtener categorías de canales
const getCategories = async () => {
  const response = await fetch('http://localhost:3000/api/live/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'http://your-iptv-server.com:8080',
      username: 'your_user',
      password: 'your_pass'
    })
  });
  
  const data = await response.json();
  console.log(data.data); // Array de categorías
};

// Obtener canales de una categoría
const getStreams = async (categoryId) => {
  const response = await fetch(`http://localhost:3000/api/live/streams/${categoryId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'http://your-iptv-server.com:8080',
      username: 'your_user',
      password: 'your_pass'
    })
  });
  
  const data = await response.json();
  // Cada stream tiene su stream_url listo para reproducir
  console.log(data.data[0].stream_url);
};
```

### Ejemplo con Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Login
const credentials = {
  url: 'http://your-iptv-server.com:8080',
  username: 'your_user',
  password: 'your_pass'
};

// Autenticar
const { data } = await api.post('/login', credentials);

// Obtener categorías VOD
const vodCategories = await api.post('/vod/categories', credentials);

// Obtener películas de una categoría
const movies = await api.post('/vod/streams/1', credentials);
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
| `400` | Parámetros faltantes o inválidos |
| `401` | Credenciales inválidas |
| `404` | Endpoint no encontrado |
| `500` | Error interno del servidor |
| `503` | No se puede conectar al servidor IPTV |
| `504` | Timeout de conexión |

---

## 🛠️ Troubleshooting

### El servidor no inicia

```
Error: Port 3000 is already in use
```

**Solución:** Cambia el puerto en `.env` o detén el proceso que está usando el puerto 3000:

```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Cambiar puerto en .env
PORT=3001
```

### CORS Errors en el frontend

Si obtienes errores de CORS en la consola del navegador:

1. Verifica que el backend esté corriendo
2. Asegúrate de que estás haciendo peticiones a la URL correcta
3. Si necesitas restringir orígenes específicos, edita `.env`:

```env
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3001
```

### Timeout de conexión

Si recibes errores de timeout:

1. Verifica que la URL del servidor IPTV sea correcta
2. Comprueba tu conexión a internet
3. Algunos servidores IPTV pueden estar caídos temporalmente

### Credenciales inválidas

```json
{
  "success": false,
  "error": "Invalid credentials. Please check your username and password."
}
```

**Solución:** Verifica que el URL, usuario y contraseña del servidor Xtream Codes sean correctos.

---

## 🔐 Seguridad

- Las credenciales se transmiten en cada petición desde el frontend
- Se recomienda usar HTTPS en producción
- No se almacenan credenciales en el backend
- Implementa autenticación JWT si necesitas sesiones persistentes

---

## 📝 Notas Adicionales

### URLs de Streaming

Este backend construye automáticamente las URLs reproducibles para cada stream:

- **Live TV:** `http://server:port/live/username/password/stream_id.ts`
- **VOD:** `http://server:port/movie/username/password/stream_id.mp4`
- **Series:** `http://server:port/series/username/password/stream_id.mp4`

Estas URLs pueden ser usadas directamente en reproductores de video HTML5, HLS.js, Video.js, etc.

### Performance

- El backend usa Axios con timeout de 10 segundos
- Las peticiones a la API Xtream son síncronas
- Para mejor performance en producción, considera implementar caché (Redis)

---

## 🚀 Despliegue en Producción

### Variables de entorno recomendadas

```env
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://tu-frontend.com
```

### Usando PM2 (Process Manager)

```bash
npm install -g pm2

# Iniciar
pm2 start server.js --name iptv-backend

# Ver logs
pm2 logs iptv-backend

# Reiniciar
pm2 restart iptv-backend

# Detener
pm2 stop iptv-backend
```

---

## 📄 Licencia

MIT

---

## 👨‍💻 Soporte

Para reportar problemas o solicitar funcionalidades, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ usando Node.js + Express**