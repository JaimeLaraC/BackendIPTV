# Modelo de Datos

## 🗄️ Base de Datos: MongoDB

### Colecciones

```
iptv_backend
├── users
└── (futuras colecciones)
```

---

## 👤 Colección: users

### Schema

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (required, hashed con bcrypt),
  iptv_credentials: String (required, encrypted),
  createdAt: Date,
  updatedAt: Date
}
```

### Indices

```javascript
{
  email: 1  // Unique index
}
```

### Ejemplo de Documento

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "password": "$2a$10$rOXGprgxIHq0YhKQfTb8u.5vVxaO4dzP3jXbNJqkJvn5e5HcVL7Zm",
  "iptv_credentials": "d6f3e9c1a7b2:8a4b5c6d9e7f:1234abcd...",
  "createdAt": "2025-11-29T20:00:00.000Z",
  "updatedAt": "2025-11-29T20:00:00.000Z"
}
```

---

## 🔐 Encriptación de Datos

### Password (bcrypt)

**Antes de guardar:**
```javascript
const password = "userPassword123";
const hashed = await bcrypt.hash(password, 10);
// "$2a$10$rOXGprgxIHq0YhKQfTb8u..."
```

**Al verificar:**
```javascript
const isMatch = await bcrypt.compare(password, user.password);
```

**Configuración:**
- **Algoritmo:** bcrypt
- **Salt Rounds:** 10
- **Irreversible:** No se puede recuperar password original

---

### IPTV Credentials (AES-256-CBC)

**Antes de guardar:**
```javascript
const credentials = {
  url: "http://server.com:8080",
  username: "iptv_user",
  password: "iptv_pass"
};

const encrypted = encrypt(JSON.stringify(credentials));
// "d6f3e9c1a7b2:8a4b5c6d9e7f:1234abcd..."
```

**Format encrypted:**
```
IV:ENCRYPTED_DATA
```
- **IV:** Initialization Vector (16 bytes, hex)
- **ENCRYPTED_DATA:** Datos encriptados (hex)

**Al leer:**
```javascript
const decrypted = decrypt(user.iptv_credentials);
// { url: "...", username: "...", password: "..." }
```

**Configuración:**
- **Algoritmo:** aes-256-cbc
- **Key:** 32 caracteres (256 bits) desde `.env`
- **IV:** Aleatorio por cada encriptación
- **Reversible:** Sí, con la key correcta

---

## 📊 Validaciones

### Email
- **Tipo:** String
- **Validación:** Email válido (regex)
- **Unique:** Sí
- **Lowercase:** Automático (normalizado)

### Password
- **Tipo:** String
- **Longitud mínima:** 6 caracteres
- **Hashing:** Automático en pre-save hook

### IPTV Credentials

**url:**
- **Tipo:** String
- **Validación:** URL válida con protocolo
- **Ejemplo:** `http://server.com:8080`

**username:**
- **Tipo:** String
- **Validación:** No vacío
- **Ejemplo:** `iptv_user123`

**password:**
- **Tipo:** String
- **Validación:** No vacío
- **Ejemplo:** `secretpass`

---

## 🔄 Hooks de Mongoose

### Pre-save (Password)

```javascript
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
```

### Pre-save (IPTV Credentials)

```javascript
userSchema.pre('save', function(next) {
  if (this.isModified('iptv_credentials')) {
    this.iptv_credentials = encrypt(
      JSON.stringify(this.iptv_credentials)
    );
  }
  next();
});
```

---

## 🧩 Métodos del Modelo

### comparePassword

```javascript
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

**Uso:**
```javascript
const isMatch = await user.comparePassword('password123');
```

### getDecryptedCredentials

```javascript
userSchema.methods.getDecryptedCredentials = function() {
  return JSON.parse(decrypt(this.iptv_credentials));
};
```

**Uso:**
```javascript
const credentials = user.getDecryptedCredentials();
// { url: "...", username: "...", password: "..." }
```

---

## 📈 Estadísticas y Queries

### Queries Comunes

**Buscar por email:**
```javascript
const user = await User.findOne({ email: 'user@example.com' });
```

**Buscar por ID:**
```javascript
const user = await User.findById(userId);
```

**Actualizar credenciales IPTV:**
```javascript
user.iptv_credentials = {
  url: newUrl,
  username: newUsername,
  password: newPassword
};
await user.save(); // Encriptación automática
```

**Eliminar usuario:**
```javascript
await User.findByIdAndDelete(userId);
```

---

## 🔍 Performance

### Índices
- Email indexado (unique) para búsquedas rápidas
- `_id` indexado por defecto (MongoDB)

### Connection Pooling
MongoDB usa connection pooling automático con Mongoose.

---

## 🚀 Futuras Extensiones

### Posibles campos adicionales

```javascript
{
  // Perfil
  name: String,
  avatar: String,
  
  // Preferencias
  preferences: {
    theme: String,
    language: String
  },
  
  // Metadata
  lastLogin: Date,
  loginCount: Number,
  
  // Suscripción
  subscription: {
    plan: String,
    expiresAt: Date
  }
}
```

### Nuevas colecciones potenciales

- `sessions` - Para refresh tokens
- `favorites` - Canales/VODs favoritos del usuario
- `watchlist` - Lista de reproducción
- `history` - Historial de visualización
