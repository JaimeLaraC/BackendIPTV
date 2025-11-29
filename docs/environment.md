# Variables de Entorno

## 📝 Configuración de `.env`

Este documento describe todas las variables de entorno disponibles en el proyecto.

## ⚙️ Variables Requeridas

### PORT
```env
PORT=3000
```
- **Descripción:** Puerto donde el servidor escuchará peticiones
- **Default:** 3000
- **Producción:** Puede ser cualquier puerto libre
- **Nota:** Si usas Nginx, este puerto será interno

### NODE_ENV
```env
NODE_ENV=development
```
- **Descripción:** Entorno de ejecución
- **Valores:** `development`, `production`, `test`
- **Efecto:**
  - `development`: Logs verbosos en consola
  - `production`: Logs mínimos, optimizaciones activadas

### MONGODB_URI
```env
MONGODB_URI=mongodb://localhost:27017/iptv_backend
```
- **Descripción:** Connection string de MongoDB
- **Format:** `mongodb://[username:password@]host[:port]/database`
- **Ejemplos:**
  - Local: `mongodb://localhost:27017/iptv_backend`
  - Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/iptv_backend`
- **Nota:** En producción, usa autenticación

### JWT_SECRET
```env
JWT_SECRET=TuSecretSuperSeguroAleatorio32CharsMinimo
```
- **Descripción:** Clave secreta para firmar tokens JWT
- **Requisitos:** Mínimo 32 caracteres
- **Seguridad:** NUNCA compartir ni subir a Git
- **Generar:**
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### JWT_EXPIRES_IN  
```env
JWT_EXPIRES_IN=7d
```
- **Descripción:** Tiempo de expiración del token JWT
- **Format:** Tiempo + unidad (`s`, `m`, `h`, `d`)
- **Ejemplos:**
  - `60` = 60 segundos
  - `15m` = 15 minutos
  - `24h` = 24 horas
  - `7d` = 7 días
- **Recomendado:** 7 días

### ENCRYPTION_KEY
```env
ENCRYPTION_KEY=12345678901234567890123456789012
```
- **Descripción:** Clave para encriptar credenciales IPTV (AES-256)
- **Requisitos:** Exactamente 32 caracteres
- **Seguridad:** CRÍTICO - Cambiar esta key invalida todas las credenciales almacenadas
- **Generar:**
  ```bash
  node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
  ```

---

## 🔌 Variables Opcionales

### ALLOWED_ORIGINS
```env
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3001
```
- **Descripción:** Orígenes permitidos para CORS (separados por coma)
- **Default:** `*` (todos los orígenes)
- **Producción:** SIEMPRE especificar dominio(s) específico(s)
- **Ejemplos:**
  - Desarrollo: `http://localhost:3000,http://localhost:8080`
  - Producción: `https://tuapp.com,https://www.tuapp.com`

### REDIS_URL
```env
REDIS_URL=redis://localhost:6379
```
- **Descripción:** URL de conexión a Redis
- **Default:** `redis://localhost:6379`
- **Con password:** `redis://:password@localhost:6379`
- **Opcional:** Si no está presente, la app funciona sin caché

---

## 📋 Archivo `.env.example`

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3000
NODE_ENV=development

# ============================================
# DATABASE
# ============================================
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/iptv_backend

# O MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/iptv_backend

# ============================================
# AUTHENTICATION
# ============================================
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRES_IN=7d

# ============================================
# ENCRYPTION
# ============================================
# Exactly 32 characters
# Generate with: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
ENCRYPTION_KEY=12345678901234567890123456789012

# ============================================
# CORS
# ============================================
# Comma-separated allowed origins
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3001

# ============================================
# REDIS (Optional - for caching)
# ============================================
REDIS_URL=redis://localhost:6379
```

---

## 🔐 Seguridad

### ⚠️ NUNCA Hacer

- ❌ Subir `.env` a Git
- ❌ Compartir `JWT_SECRET` o `ENCRYPTION_KEY`
- ❌ Usar valores de ejemplo en producción
- ❌ Usar `ALLOWED_ORIGINS=*` en producción

### ✅ Mejores Prácticas

- ✅ Usar `.env.example` como template
- ✅ Generar secrets aleatorios y únicos
- ✅ Diferentes secrets para desarrollo y producción
- ✅ Rotar secrets periódicamente
- ✅ Usar gestores de secrets en producción (AWS Secrets Manager, etc.)

---

## 🚀 Configuración por Entorno

### Desarrollo (Local)
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/iptv_backend
JWT_SECRET=dev_secret_not_for_production_123456789
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=12345678901234567890123456789012
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
REDIS_URL=redis://localhost:6379
```

### Producción
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://prod-user:strong-pass@cluster.mongodb.net/iptv_prod
JWT_SECRET=<generated-64-char-random-string>
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=<generated-32-char-random-string>
ALLOWED_ORIGINS=https://yourapp.com,https://www.yourapp.com
REDIS_URL=redis://:redis-strong-pass@internal-redis:6379
```

---

## 🛠️ Troubleshooting

### Error: .env file not found
**Solución:**
```bash
cp .env.example .env
nano .env  # Editar valores
```

### Error: JWT_SECRET must be provided
**Solución:** Verifica que `.env` tenga `JWT_SECRET` definido

### Error: ENCRYPTION_KEY must be 32 characters
**Solución:**
```bash
# Generar nueva key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Warnings de CORS
**Solución:** Añade tu dominio frontend a `ALLOWED_ORIGINS`

---

## 📚 Referencias

- [dotenv](https://github.com/motdotla/dotenv)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [AES-256 Encryption](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)
