# Guía de Deployment

## 🚀 Despliegue en Producción

Esta guía cubre el proceso completo para desplegar el Backend IPTV en un entorno de producción.

## 📋 Pre-requisitos

### Servidor
- Ubuntu 20.04 LTS o superior (recomendado)
- Node.js 14+ instalado
- MongoDB 4.4+ instalado o acceso a MongoDB Atlas
- Redis 6+ instalado
- PM2 o similar para gestión de procesos
- Nginx para reverse proxy (opcional pero recomendado)
- SSL/TLS certificado (Let's Encrypt recomendado)

### DNS
- Dominio apuntando a tu servidor
- Acceso para configurar registros DNS

---

## 🔧 Configuración del Servidor

### 1. Actualizar Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Instalar Node.js

```bash
# Usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version  # v18.x.x
npm --version   # 9.x.x
```

### 3. Instalar MongoDB

#### Opción A: MongoDB Local

```bash
# Importar clave pública GPG
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Crear lista de fuentes
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Actualizar e instalar
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificar
sudo systemctl status mongod
```

#### Opción B: MongoDB Atlas (Cloud)

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear cluster gratuito
3. Configurar Network Access (permitir IP del servidor)
4. Crear database user
5. Obtener connection string

### 4. Instalar Redis

```bash
sudo apt-get install redis-server

# Configurar Redis para systemd
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Verificar
redis-cli ping  # Debe retornar PONG
```

### 5. Instalar PM2 (Process Manager)

```bash
npm install -g pm2

# Configurar PM2 para iniciar en boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### 6. Instalar Nginx (Opcional)

```bash
sudo apt-get install nginx

# Verificar
sudo systemctl status nginx
```

---

## 📦 Despliegue de la Aplicación

### 1. Clonar Repositorio

```bash
cd /var/www
sudo git clone https://github.com/tu-usuario/BackendIPTV.git
cd BackendIPTV
```

### 2. Instalar Dependencias

```bash
npm install --production
```

### 3. Configurar Variables de Entorno

```bash
# Copiar ejemplo
cp .env.example .env

# Editar con valores de producción
nano .env
```

**`.env` para Producción:**
```env
# Server
PORT=3000
NODE_ENV=production

# MongoDB (Local)
MONGODB_URI=mongodb://localhost:27017/iptv_backend

# O MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/iptv_backend

# JWT (Generar secret seguro)
JWT_SECRET=TuSecretSuperSeguroGeneradoAleatoriamente32CharsMinimo
JWT_EXPIRES_IN=7d

# Encryption (32 caracteres aleatorios)
ENCRYPTION_KEY=12345678901234567890123456789012

# CORS (Tu dominio frontend)
ALLOWED_ORIGINS=https://tu-frontend.com,https://www.tu-frontend.com

# Redis
REDIS_URL=redis://localhost:6379
```

### 4. Generar Secrets Seguros

```bash
# JWT_SECRET (genera 32 caracteres aleatorios)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ENCRYPTION_KEY (genera 32 caracteres)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 5. Iniciar con PM2

```bash
# Iniciar aplicación
pm2 start server.js --name iptv-backend

# Guardar configuración
pm2 save

# Ver logs
pm2 logs iptv-backend

# Monitoreo
pm2 monit
```

### Comandos PM2 Útiles

```bash
# Restart
pm2 restart iptv-backend

# Stop
pm2 stop iptv-backend

# Delete
pm2 delete iptv-backend

# Ver lista de procesos
pm2 list

# Ver logs en tiempo real
pm2 logs iptv-backend --lines 100
```

---

## 🌐 Configurar Nginx (Reverse Proxy)

### 1. Crear Configuración

```bash
sudo nano /etc/nginx/sites-available/iptv-backend
```

**Configuración:**
```nginx
server {
    listen 80;
    server_name api.tudominio.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.tudominio.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.tudominio.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;

    # Logs
    access_log /var/log/nginx/iptv-backend-access.log;
    error_log /var/log/nginx/iptv-backend-error.log;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Rate Limiting (adicional a la app)
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=5r/s;
    location /api/ {
        limit_req zone=api_limit burst=10 nodelay;
        proxy_pass http://localhost:3000;
    }
}
```

### 2. Activar Sitio

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/iptv-backend /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

---

## 🔒 Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d api.tudominio.com

# Renovación automática ya está configurada
# Verificar renovación
sudo certbot renew --dry-run
```

---

## 🔥 Configurar Firewall

```bash
# Permitir SSH, HTTP y HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Cerrar puerto 3000 (solo Nginx debe acceder)
sudo ufw deny 3000

# Activar firewall
sudo ufw enable
```

---

## 📊 Monitoreo y Logs

### Logs de PM2

```bash
# Ver logs en tiempo real
pm2 logs iptv-backend

# Ver logs guardados
cat ~/.pm2/logs/iptv-backend-out.log
cat ~/.pm2/logs/iptv-backend-error.log
```

### Logs de la Aplicación

```bash
# Logs Winston (dentro del proyecto)
tail -f logs/all.log
tail -f logs/error.log
```

### Logs de Nginx

```bash
sudo tail -f /var/log/nginx/iptv-backend-access.log
sudo tail -f /var/log/nginx/iptv-backend-error.log
```

### Monitoreo de Sistema

```bash
# CPU y memoria
htop

# Procesos de Node
pm2 monit

# Redis
redis-cli INFO stats

# MongoDB
mongo --eval "db.stats()"
```

---

## 🔄 Actualización de la Aplicación

### Método 1: Git Pull

```bash
cd /var/www/BackendIPTV

# Backup de .env
cp .env .env.backup

# Pull cambios
git pull origin main

# Instalar nuevas dependencias
npm install --production

# Restart
pm2 restart iptv-backend
```

### Método 2: Zero-Downtime con PM2

```bash
pm2 reload iptv-backend
```

---

## 🗄️ Backup y Recuperación

### MongoDB Backup

```bash
# Crear backup
mongodump --uri="mongodb://localhost:27017/iptv_backend" --out="/backups/$(date +%Y%m%d)"

# Restaurar backup
mongorestore --uri="mongodb://localhost:27017/iptv_backend" /backups/20251130
```

### Automatizar Backups

```bash
# Crear script
sudo nano /usr/local/bin/backup-iptv.sh
```

**Script:**
```bash
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
mongodump --uri="mongodb://localhost:27017/iptv_backend" --out="$BACKUP_DIR/$DATE"

# Borrar backups antiguos (más de 7 días)
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

```bash
# Dar permisos
sudo chmod +x /usr/local/bin/backup-iptv.sh

# Añadir a cron (diario a las 2 AM)
crontab -e
```

**Cron entry:**
```
0 2 * * * /usr/local/bin/backup-iptv.sh
```

---

## 🔍 Health Checks

### Crear Script de Health Check

```bash
nano /usr/local/bin/iptv-healthcheck.sh
```

```bash
#!/bin/bash
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

if [ $RESPONSE -eq 200 ]; then
    echo "OK"
    exit 0
else
    echo "FAIL"
    pm2 restart iptv-backend
    exit 1
fi
```

```bash
chmod +x /usr/local/bin/iptv-healthcheck.sh

# Añadir a cron (cada 5 minutos)
*/5 * * * * /usr/local/bin/iptv-healthcheck.sh
```

---

## 🐳 Deployment con Docker (Alternativo)

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/iptv_backend
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  mongo-data:
```

**Deploy:**
```bash
docker-compose up -d
```

---

## ✅ Checklist de Deployment

- [ ] Servidor configurado con Node.js, MongoDB, Redis
- [ ] PM2 instalado y configurado
- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET y ENCRYPTION_KEY generados
- [ ] Aplicación iniciada con PM2
- [ ] Nginx configurado como reverse proxy
- [ ] SSL/TLS configurado con Let's Encrypt
- [ ] Firewall configurado
- [ ] Backups automáticos configurados
- [ ] Health checks configurados
- [ ] Logs monitoreados
- [ ] DNS apuntando al servidor
- [ ] CORS configurado con dominio frontend correcto

---

## 🚨 Troubleshooting

### Error: Port 3000 already in use

```bash
# Encontrar proceso
sudo lsof -i :3000

# Matar proceso
sudo kill -9 <PID>
```

### MongoDB no conecta

```bash
# Verificar servicio
sudo systemctl status mongod

# Ver logs
sudo tail -f /var/log/mongodb/mongod.log

# Reiniciar
sudo systemctl restart mongod
```

### Redis no conecta

```bash
# Verificar servicio
sudo systemctl status redis-server

# Test conexión
redis-cli ping
```

### PM2 no inicia

```bash
# Ver logs
pm2 logs

# Reiniciar PM2 daemon
pm2 kill
pm2 resurrect
```

---

## 📚 Recursos Adicionales

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MongoDB Production Notes](https://docs.mongodb.com/manual/administration/production-notes/)
- [Let's Encrypt](https://letsencrypt.org/)
