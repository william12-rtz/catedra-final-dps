# Aplicación Cátedra Final DPS

Aplicación con autenticación de Firebase (Google y Facebook) usando Node.js en el backend y React Native en el frontend.

## 📁 Estructura del Proyecto

```
Catedrafinal_dps/
├── backend/          # Backend con Node.js y Express
└── frontend/         # Frontend con React Native y Expo
```

## 🚀 Configuración

### 1. Configurar Firebase

#### Crear proyecto en Firebase:
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita **Authentication** > **Sign-in methods**:
   - Google: Habilitar
   - Facebook: Habilitar (necesitas App ID de Facebook)

#### Configurar Google Sign-In:
- Ya está habilitado por defecto en Firebase

#### Configurar Facebook Login:
1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Crea una nueva aplicación
3. Añade el producto "Facebook Login"
4. Copia el **App ID** y **App Secret**
5. En Firebase Console > Authentication > Facebook, pega el App ID y App Secret
6. Copia la URL de redirección de OAuth de Firebase y pégala en Facebook

### 2. Configurar Backend

```powershell
cd backend
npm install
```

#### Configurar credenciales de Firebase Admin:
1. En Firebase Console > Project Settings > Service Accounts
2. Click en "Generate New Private Key"
3. Descarga el archivo JSON
4. Abre el archivo `.env` y completa:

```env
PORT=3000
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tu-project-id.iam.gserviceaccount.com
```

#### Iniciar el servidor:
```powershell
npm run dev
```

El servidor estará en: `http://localhost:3000`

### 3. Configurar Frontend

```powershell
cd frontend
npm install
```

#### Configurar Firebase en el frontend:
1. En Firebase Console > Project Settings > General
2. En "Your apps", selecciona "Web" o "Android/iOS"
3. Copia la configuración de Firebase
4. Abre `frontend/src/config/firebase.js` y completa:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-project-id.firebaseapp.com",
  projectId: "tu-project-id",
  storageBucket: "tu-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

#### Configurar IDs en constants.js:
Abre `frontend/src/config/constants.js` y completa:

```javascript
export const FACEBOOK_APP_ID = 'TU_FACEBOOK_APP_ID';
export const GOOGLE_WEB_CLIENT_ID = 'TU_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';
```

**Nota:** El Google Web Client ID se encuentra en Firebase Console > Authentication > Sign-in method > Google > Web SDK configuration

#### Iniciar la aplicación:
```powershell
npm start
```

Luego presiona:
- `a` para Android
- `i` para iOS
- `w` para web

## 📱 Funcionalidades

### Backend (Node.js + Express)
- ✅ Servidor Express configurado
- ✅ Firebase Admin SDK para verificar tokens
- ✅ Middleware de autenticación
- ✅ Endpoints:
  - `POST /api/auth/verify` - Verificar token de Firebase
  - `GET /api/auth/profile` - Obtener perfil del usuario (protegido)

### Frontend (React Native + Expo)
- ✅ Autenticación con Google
- ✅ Autenticación con Facebook
- ✅ Pantalla de Login con botones de Google y Facebook
- ✅ Pantalla de Bienvenida personalizada
- ✅ Navegación entre pantallas
- ✅ Persistencia de sesión
- ✅ Cerrar sesión

## 🔐 Flujo de Autenticación

1. Usuario presiona "Continuar con Google" o "Continuar con Facebook"
2. Se abre el navegador de autenticación
3. Usuario se autentica con su cuenta
4. Firebase valida las credenciales
5. Se obtiene el token del usuario
6. (Opcional) Se envía el token al backend para validación
7. Usuario es redirigido a la pantalla de bienvenida

## 📝 Notas Importantes

### Para Android:
- Necesitas configurar el SHA-1 en Firebase Console
- Genera el SHA-1 con: `cd android && ./gradlew signingReport`

### Para iOS:
- Necesitas configurar el URL Scheme en Xcode
- Descarga el archivo `GoogleService-Info.plist` desde Firebase

### Para Facebook:
- Asegúrate de que la aplicación esté en modo "Live" en Facebook Developers
- Configura correctamente los dominios permitidos

## 🛠️ Tecnologías

**Backend:**
- Node.js
- Express
- Firebase Admin SDK
- dotenv
- CORS

**Frontend:**
- React Native
- Expo
- Firebase Authentication
- React Navigation
- Expo Auth Session
- AsyncStorage

## 📞 API Endpoints

### Verificar Token
```http
POST /api/auth/verify
Content-Type: application/json

{
  "token": "FIREBASE_ID_TOKEN"
}
```

### Obtener Perfil (Protegido)
```http
GET /api/auth/profile
Authorization: Bearer FIREBASE_ID_TOKEN
```

## 🐛 Troubleshooting

### Error: "Google Sign-In failed"
- Verifica que el Google Web Client ID sea correcto
- Asegúrate de habilitar Google Sign-In en Firebase Console

### Error: "Facebook Login failed"
- Verifica el Facebook App ID
- Confirma que la app de Facebook esté en modo "Live"
- Revisa las URLs de redirección en Facebook Developers

### Error: "Network request failed"
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Si usas un dispositivo físico, cambia `localhost` por la IP de tu computadora

## 📄 Licencia

ISC
