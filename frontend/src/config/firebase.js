import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAqMu7iNTzcpVVc_ESp_XSLBWcHs7xtLgo",
  authDomain: "catedra-final-dps.firebaseapp.com",
  projectId: "catedra-final-dps",
  storageBucket: "catedra-final-dps.firebasestorage.app",
  messagingSenderId: "1035456657334",
  appId: "1:1035456657334:web:6de8fa9ce9a2db7a987317",
  measurementId: "G-Y5VR8GQ228"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth con persistencia local
const auth = getAuth(app);

// Configurar persistencia para que el usuario permanezca autenticado después de recargar
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Persistencia de autenticación configurada');
  })
  .catch((error) => {
    console.error('Error al configurar persistencia:', error);
  });

// Inicializar Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
