# Documentación del Backend IPTV

Bienvenido a la documentación completa del Backend IPTV. Esta carpeta contiene toda la información técnica y guías necesarias para entender, desarrollar y desplegar el proyecto.

## 📚 Índice de Documentación

### 🏗️ Arquitectura y Diseño
- [**Arquitectura del Sistema**](./architecture.md) - Visión general de la arquitectura, componentes y flujo de datos
- [**Modelo de Datos**](./data-model.md) - Schema de MongoDB, relaciones y estructura de datos

### 🔐 Autenticación y Seguridad
- [**Guía de Autenticación JWT**](./authentication.md) - Implementación de JWT, flujo de autenticación y tokens
- [**Seguridad**](./security.md) - Medidas de seguridad, encriptación y mejores prácticas

### 📡 API y Endpoints
- [**Referencia API**](./api-reference.md) - Documentación completa de todos los endpoints
- [**Ejemplos de Uso**](./examples.md) - Ejemplos prácticos con código para consumir la API

### ⚡ Performance y Caché
- [**Redis y Caché**](./caching.md) - Estrategia de caché, configuración Redis y optimizaciones

### 🚀 Deployment y DevOps
- [**Guía de Deployment**](./deployment.md) - Instrucciones para desplegar en producción
- [**Variables de Entorno**](./environment.md) - Todas las variables de configuración explicadas

### 🧪 Testing
- [**Guía de Testing**](./testing.md) - Cómo ejecutar tests y escribir nuevos tests

### 🛠️ Desarrollo
- [**Guía de Contribución**](./contributing.md) - Cómo contribuir al proyecto
- [**Git Workflow**](./git-workflow.md) - Branching strategy y proceso de desarrollo

## 🚀 Inicio Rápido

Si es tu primera vez con el proyecto, te recomendamos seguir este orden:

1. Lee la [Arquitectura del Sistema](./architecture.md) para entender la estructura
2. Revisa la [Guía de Deployment](./deployment.md) para configurar tu entorno
3. Consulta la [Guía de Autenticación](./authentication.md) para entender el flujo de usuarios
4. Explora la [Referencia API](./api-reference.md) para conocer los endpoints disponibles

## 📖 Documentación Adicional

- **README Principal**: [`../README.md`](../README.md)
- **Swagger UI**: `http://localhost:3000/api-docs` (cuando el servidor está corriendo)

## 🤝 Soporte

Si tienes preguntas o encuentras algún problema:
- Abre un issue en GitHub
- Consulta la documentación de Swagger UI
- Revisa los logs en `logs/all.log` y `logs/error.log`
