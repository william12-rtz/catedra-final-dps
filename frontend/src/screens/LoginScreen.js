import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../config/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      let userCredential;

      if (isRegister) {
        // Registrar nuevo usuario
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('¡Éxito!', 'Cuenta creada correctamente');
      } else {
        // Iniciar sesión
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      // Navegar a la pantalla de bienvenida
      navigation.replace('Welcome', { 
        userName: userCredential.user.email.split('@')[0],
        userEmail: userCredential.user.email 
      });
    } catch (error) {
      console.error('Error en autenticación:', error);
      
      let errorMessage = 'Error al autenticar';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya está registrado';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Credenciales inválidas';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Panel izquierdo - Welcome */}
      <View style={styles.leftPanel}>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
        
        <View style={styles.welcomeContent}>
          <Text style={styles.niceToSee}>Es un gusto verte de nuevo</Text>
          <Text style={styles.welcomeBack}>BIENVENIDO DE VUELTA</Text>
          <Text style={styles.welcomeDescription}>
            Gestiona tus eventos, conecta con participantes{'\n'}
            y mantente informado con notificaciones en tiempo real
          </Text>
        </View>
      </View>

      {/* Panel derecho - Login Form */}
      <View style={styles.rightPanel}>
        <View style={styles.formWrapper}>
          <Text style={styles.formTitle}>
            {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </Text>
          <Text style={styles.formSubtitle}>
            {isRegister 
              ? 'Crea tu cuenta para comenzar a gestionar eventos' 
              : 'Inicia sesión para continuar con la gestión de eventos'}
          </Text>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {!isRegister && (
              <View style={styles.rememberRow}>
                <Text style={styles.rememberText}>Mantener sesión iniciada</Text>
                <TouchableOpacity>
                  <Text style={styles.linkText}>¿Ya tienes cuenta?</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleEmailAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isRegister ? 'REGISTRARSE' : 'CONTINUAR'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsRegister(!isRegister)}
              disabled={loading}
            >
              <Text style={styles.switchText}>
                {isRegister 
                  ? '¿Ya tienes cuenta? Inicia sesión' 
                  : '¿No tienes cuenta? Regístrate'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  leftPanel: {
    flex: 1,
    backgroundColor: '#4285F4',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -100,
    left: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: 100,
    right: -50,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    bottom: 50,
    left: 100,
  },
  welcomeContent: {
    zIndex: 10,
    alignItems: 'center',
  },
  niceToSee: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
    letterSpacing: 1,
  },
  welcomeBack: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    letterSpacing: 2,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 400,
  },
  rightPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
  formWrapper: {
    width: '100%',
    maxWidth: 450,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 40,
    lineHeight: 20,
  },
  formContainer: {
    gap: 20,
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    outlineStyle: 'none',
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  rememberText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  switchButton: {
    padding: 15,
    alignItems: 'center',
  },
  switchText: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '500',
  },
});
