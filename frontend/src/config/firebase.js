import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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

// Inicializar Auth
const auth = getAuth(app);

export { auth };
export default app;
