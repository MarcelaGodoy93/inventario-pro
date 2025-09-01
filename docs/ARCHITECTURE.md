# 🏗️ Arquitectura del Sistema

## Diagrama de Arquitectura
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend     │    │    Database     │
│     React       │◄──►│    Node.js      │◄──►│    MongoDB      │
│   Material-UI   │    │    Express      │    │   Collections   │
│     Axios       │    │      JWT        │    │   - users       │
│   Chart.js      │    │    Bcrypt       │    │   - products    │
└─────────────────┘    └─────────────_───┘    │   - movements   │
│   - categories  │
└─────────────────┘

## Tecnologías Principales

### Frontend (client/)
- **React 18**: Framework principal
- **Material-UI**: Componentes de UI
- **Chart.js**: Gráficos y reportes
- **Axios**: Cliente HTTP
- **React Router**: Navegación

### Backend (server/)
- **Node.js**: Entorno de ejecución
- **Express.js**: Framework web
- **JWT**: Autenticación
- **Bcrypt**: Encriptación de contraseñas
- **Helmet**: Seguridad
- **Rate Limiting**: Protección contra ataques

### Base de Datos
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB

## Estructura de Carpetas
inventario-pro/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API calls
│   │   └── utils/         # Utilidades
│   └── package.json
├── server/                 # Backend Node.js
│   ├── models/            # Modelos de MongoDB
│   ├── routes/            # Rutas API
│   ├── middleware/        # Middleware customizado
│   ├── controllers/       # Lógica de negocio
│   └── package.json
├── docs/                   # Documentación
└── README.md

## Flujo de Autenticación

1. Usuario envía credenciales.
2. Backend valida con bcrypt.
3. Se genera token JWT.
4. Frontend guarda token.
5. Requests incluyen token en headers.
6. Middleware valida token.

## Seguridad Implementada

- ✅ Encriptación de contraseñas.
- ✅ Tokens JWT para sesiones.
- ✅ Rate limiting.
- ✅ Helmet para headers de seguridad.
- ✅ Validación de datos.
- ✅ Variables de entorno.
