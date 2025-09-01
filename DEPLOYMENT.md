# 🚀 Guía de Despliegue - InventarioPro

## Prerrequisitos

- Node.js 18+ y npm
- MongoDB Atlas (base de datos en la nube)
- Cuenta en Vercel (para frontend)
- Cuenta en Railway/Render (para backend)

## 📋 Configuración Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/inventario-pro.git
cd inventario-pro
2. Instalar dependencias
bashnpm run install-all
3. Configurar variables de entorno
Crear archivo .env en la carpeta server/:
envMONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/inventario-pro
JWT_SECRET=tu_clave_secreta_super_segura
PORT=5000
NODE_ENV=development
4. Ejecutar en desarrollo
bashnpm run dev
🌐 Despliegue en Producción
Backend (Railway/Render)

Crear proyecto en Railway:

Conectar repositorio GitHub
Seleccionar carpeta server/
Configurar variables de entorno


Variables de entorno en producción:
MONGODB_URI=tu_mongodb_atlas_url
JWT_SECRET=clave_secreta_produccion
NODE_ENV=production


Frontend (Vercel)

Configurar Vercel:

Conectar repositorio GitHub
Root Directory: client
Build Command: npm run build
Output Directory: build


Variables de entorno:
REACT_APP_API_URL=https://tu-backend.railway.app/api


📊 Características del Sistema
🔐 Seguridad Implementada

Autenticación JWT
Encriptación de contraseñas (bcrypt)
Rate limiting
Validación de datos
Headers de seguridad (Helmet)

👥 Roles de Usuario

Admin: Acceso total al sistema
Manager: Gestión de productos y reportes
Employee: Solo consulta de productos

📈 Funcionalidades Principales

Dashboard con estadísticas en tiempo real
CRUD completo de productos
Sistema de categorías
Gestión de usuarios
Reportes avanzados
Control de stock y alertas
Búsqueda y filtros avanzados
Interfaz responsive

🛠️ Stack Tecnológico
Frontend:

React 18
Material-UI
Chart.js
React Router
Axios

Backend:

Node.js
Express.js
MongoDB con Mongoose
JWT Authentication
Bcrypt

🧪 Datos de Prueba
Usuarios Demo

Admin: admin@inventario.com / admin123
Gerente: gerente@inventario.com / gerente123
Empleado: empleado@inventario.com / empleado123

Categorías de Ejemplo

Tecnología
Hogar
Ropa
Alimentos

📝 Próximas Mejoras

 Notificaciones push
 Exportación de reportes (PDF/Excel)
 Códigos de barras
 App móvil con React Native
 Integración con sistemas de pagos
 Módulo de proveedores


Desarrollado por: Marcela Godoy - Ingeniera en Informática
Tecnologías: React, Node.js, MongoDB, Material-UI
Año: 2025
