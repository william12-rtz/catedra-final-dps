# 🎉 Aplicación Cátedra Final DPS

Aplicación completa de gestión de eventos con autenticación de Firebase, sistema de notificaciones en tiempo real, comentarios y estadísticas. Backend con Node.js y frontend con React Native/Expo.

## 📁 Estructura del Proyecto

```
Catedrafinal_dps/
├── backend/          # Backend con Node.js, Express y Firebase Admin
│   ├── src/
│   │   ├── config/       # Configuración de Firebase
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── middleware/   # Autenticación JWT
│   │   ├── models/       # (Firestore maneja los modelos)
│   │   └── routes/       # Rutas de la API
│   ├── .env             # Variables de entorno (NO incluido en git)
│   └── package.json
│
└── frontend/         # Frontend con React Native y Expo
    ├── src/
    │   ├── components/   # Componentes reutilizables (CustomAlert)
    │   ├── config/       # Configuración de Firebase y constantes
    │   ├── screens/      # Pantallas de la app
    │   └── services/     # Servicios (notificaciones)
    └── package.json
```

## ✨ Funcionalidades

### 🔐 Autenticación
- Registro y login con email y contraseña
- Autenticación con Firebase
- Persistencia de sesión
- Cerrar sesión

### 📅 Gestión de Eventos
- **Crear eventos**: Los organizadores pueden crear eventos con:
  - Título, descripción, fecha, hora
  - Ubicación y categoría
  - Estado del evento
  
- **Actualizar eventos**: Los organizadores pueden editar sus eventos

- **Eliminar eventos**: Los organizadores pueden eliminar sus eventos

- **Ver eventos**: 
  - Lista de eventos próximos
  - Lista de eventos pasados
  - Detalles completos de cada evento
  - Filtros por categoría y fecha

- **Participación**:
  - Confirmar asistencia a eventos
  - Cancelar asistencia
  - Ver lista de participantes
  - Contador de asistentes

### 🔔 Notificaciones
- Sistema de notificaciones en tiempo real
- Notificaciones cuando se crea un evento
- Notificaciones cuando se edita un evento
- Notificaciones cuando se cancela un evento
- Notificaciones al confirmar asistencia
- Badge de notificaciones no leídas
- Marcar notificaciones como leídas

### 💬 Interacción Social (Visual)
- Sistema de comentarios y calificaciones
- Calificación con estrellas (1-5)
- Compartir eventos en redes sociales
- Compartir por email
- Copiar enlace del evento

### 📊 Dashboard
- Estadísticas de participación
- Gráficos de actividad mensual
- Categorías favoritas
- Historial de eventos pasados
- Actividad reciente del usuario
- Métricas de eventos creados y asistidos

### 📜 Licencias Creative Commons
- Todo el contenido está bajo licencia **CC BY-SA 4.0**
- Atribución visible en detalles de eventos
- Documentación completa de la licencia

## 🚀 Instalación y Configuración

### 📋 Pasos para Clonar e Instalar

### 1️ Clonar el Repositorio

```powershell
git clone https://github.com/william12-rtz/catedra-final-dps.git
cd catedra-final-dps
```

### 2 Configurar Backend

```powershell
cd backend
npm install
```

#### Iniciar el servidor:
```powershell
npm start
```

✅ El servidor estará corriendo en: `http://localhost:3000`

### 4️⃣ Configurar Frontend

```powershell
cd frontend
npm install
```

#### Iniciar la aplicación:
```powershell
npx expo start
```

Luego en la consola presiona:
- `w` para **abrir en navegador web** (recomendado para desarrollo)
- `a` para Android (requiere emulador o Expo Go)
- `i` para iOS (requiere Mac con Xcode)

✅ La aplicación web estará en: `http://localhost:8081`

## 📄 Licencia del Contenido

Todo el contenido generado en la aplicación está bajo licencia:
**Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**

Más información: https://creativecommons.org/licenses/by-sa/4.0/

## 📄 Licencia del Código

ISC
