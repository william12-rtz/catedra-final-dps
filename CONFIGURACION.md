# 🚀 CONFIGURACIÓN REQUERIDA

## ✅ YA ESTÁ HECHO:
- ✅ Dependencias del backend instaladas (268 paquetes)
- ✅ Dependencias del frontend instaladas (1236 paquetes)
- ✅ Servidor backend iniciado en http://localhost:3000

## ⚠️ NECESITAS CONFIGURAR:

### 1️⃣ FIREBASE (OBLIGATORIO)

#### Crear proyecto Firebase:
1. Ve a https://console.firebase.google.com/
2. Clic en "Agregar proyecto" o "Add project"
3. Nombre del proyecto: "catedrafinal-dps"
4. Sigue los pasos y crea el proyecto

#### Habilitar autenticación:
1. En el menú izquierdo: **Authentication**
2. Clic en "Comenzar" o "Get started"
3. En la pestaña **Sign-in method**, habilita:
   - ✅ **Google** (clic en Google > Enable > Save)
   - ✅ **Facebook** (necesitarás crear app en Facebook primero)

---

### 2️⃣ CONFIGURAR BACKEND

#### Obtener credenciales de Firebase Admin:
1. En Firebase Console, ve a: **⚙️ Project Settings** (rueda dentada arriba)
2. Pestaña **Service accounts**
3. Clic en **Generate new private key**
4. Se descargará un archivo JSON (por ejemplo: `catedrafinal-dps-firebase-adminsdk-xxxxx.json`)

#### Actualizar archivo .env del backend:
1. Abre el archivo: `backend\.env`
2. Abre el JSON descargado y copia los valores:

```env
PORT=3000
FIREBASE_PROJECT_ID=catedrafinal-dps
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w...(copia todo el private_key del JSON)...-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@catedrafinal-dps.iam.gserviceaccount.com
```

**IMPORTANTE:** 
- La clave privada debe estar entre comillas dobles
- Mantén los `\n` tal como aparecen en el JSON
- Copia TODO el contenido del campo "private_key" del JSON

#### Reiniciar el servidor:
Después de actualizar el .env, presiona `Ctrl+C` en la terminal del backend y ejecuta:
```powershell
npm run dev
```

---

### 3️⃣ CONFIGURAR FRONTEND

#### A. Configuración Web de Firebase:
1. En Firebase Console > **Project Settings** > Pestaña **General**
2. En "Your apps", si no hay app web, clic en **</>** (icono web)
3. Nombre de la app: "catedrafinal-mobile"
4. Marca "Also set up Firebase Hosting" (opcional)
5. Clic en "Register app"
6. Copia la configuración de `firebaseConfig`

#### B. Actualizar firebase.js del frontend:
Abre `frontend\src\config\firebase.js` y reemplaza:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "catedrafinal-dps.firebaseapp.com",
  projectId: "catedrafinal-dps",
  storageBucket: "catedrafinal-dps.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};
```

#### C. Obtener Google Web Client ID:
1. En Firebase Console > **Authentication** > **Sign-in method**
2. Clic en **Google**
3. Copia el **Web SDK configuration** > **Web client ID**
4. Se ve así: `123456789012-abc123xyz789.apps.googleusercontent.com`

#### D. Actualizar constants.js:
Abre `frontend\src\config\constants.js` y actualiza:

```javascript
export const API_URL = 'http://localhost:3000/api';
export const GOOGLE_WEB_CLIENT_ID = '123456789012-abc123xyz789.apps.googleusercontent.com';
export const FACEBOOK_APP_ID = '123456789012345'; // Ver siguiente sección
```

---

### 4️⃣ CONFIGURAR FACEBOOK (OPCIONAL PERO RECOMENDADO)

#### Crear App de Facebook:
1. Ve a https://developers.facebook.com/apps/
2. Clic en **Crear app** o **Create App**
3. Tipo: **Consumer** o **None**
4. Nombre de la app: "Cátedra Final DPS"
5. Crea la app

#### Configurar Facebook Login:
1. En el Dashboard de tu app, añade producto: **Facebook Login**
2. En **Configuración** > **Básica**:
   - Copia el **ID de la aplicación** (App ID)
   - Copia la **Clave secreta de la app** (App Secret)

#### Conectar Facebook con Firebase:
1. En Firebase Console > **Authentication** > **Sign-in method**
2. Clic en **Facebook**
3. Enable
4. Pega el **App ID** y **App Secret** de Facebook
5. Copia la **URL de redireccionamiento de OAuth**
6. Ve a Facebook Developers > Tu app > **Facebook Login** > **Configuración**
7. En "Valid OAuth Redirect URIs", pega la URL que copiaste de Firebase
8. Guarda cambios

#### Actualizar constants.js con Facebook App ID:
```javascript
export const FACEBOOK_APP_ID = '123456789012345'; // Tu App ID de Facebook
```

---

### 5️⃣ INICIAR LA APLICACIÓN

#### Opción 1: Expo Go (Más rápido para probar)
```powershell
cd frontend
npm start
```

Luego:
- Escanea el QR con la app **Expo Go** (Android/iOS)
- O presiona `w` para abrir en el navegador
- O presiona `a` para Android emulator
- O presiona `i` para iOS simulator

#### Opción 2: Desarrollo con emulador
- **Android**: Asegúrate de tener Android Studio y emulador corriendo
- **iOS**: Solo en Mac con Xcode

---

## 📱 CÓMO USAR LA APP

1. Se abrirá la pantalla de Login
2. Presiona "Continuar con Google" o "Continuar con Facebook"
3. Inicia sesión con tu cuenta
4. Te llevará a la pantalla de Bienvenida con tu nombre
5. Puedes cerrar sesión con el botón "Cerrar Sesión"

---

## 🐛 PROBLEMAS COMUNES

### Error: "Firebase Admin initialization failed"
- Verifica que el archivo .env tenga las credenciales correctas
- Asegúrate de que la private_key esté completa y entre comillas

### Error: "Google Sign-In failed"
- Verifica que el GOOGLE_WEB_CLIENT_ID sea correcto
- Debe ser el Web Client ID de Firebase Console

### Error: "Facebook Login failed"
- Verifica que el FACEBOOK_APP_ID sea correcto
- Confirma que las URLs de redirección estén configuradas en Facebook

### El backend no conecta:
- Si usas dispositivo físico, cambia `localhost` por tu IP local
- En `frontend\src\config\constants.js`: `export const API_URL = 'http://192.168.X.X:3000/api';`

---

## 📚 ARCHIVOS A CONFIGURAR

✅ **Backend:**
- `backend\.env` - Credenciales de Firebase Admin

✅ **Frontend:**
- `frontend\src\config\firebase.js` - Configuración de Firebase
- `frontend\src\config\constants.js` - IDs de Google y Facebook

---

## 🎯 SIGUIENTE PASO

1. Configura Firebase siguiendo la sección 1️⃣
2. Actualiza el archivo `backend\.env` (sección 2️⃣)
3. Actualiza `frontend\src\config\firebase.js` y `constants.js` (sección 3️⃣)
4. (Opcional) Configura Facebook (sección 4️⃣)
5. Inicia la app con `npm start` en la carpeta frontend

¡Ya casi está todo listo! Solo falta la configuración de Firebase.
