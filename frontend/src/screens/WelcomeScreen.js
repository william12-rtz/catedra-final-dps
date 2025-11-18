import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { MaterialIcons } from '@expo/vector-icons';

export default function WelcomeScreen({ route, navigation }) {
  // Obtener datos del usuario desde auth.currentUser
  const currentUser = auth.currentUser;
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario';
  const userEmail = currentUser?.email || '';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  const goToEvents = () => {
    navigation.navigate('Events');
  };

  const goToNotifications = () => {
    navigation.navigate('Notifications');
  };

  const goToCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  return (
    <View style={styles.container}>
      {/* Header con botón de cerrar sesión */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.headerName}>{userName}</Text>
            <Text style={styles.headerEmail}>{userEmail}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={18} color="#fff" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido principal */}
      <View style={styles.content}>
        <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
        <Text style={styles.subtitle}>Selecciona una opción para comenzar</Text>

        {/* Cards Grid */}
        <View style={styles.cardsContainer}>
          {/* Card Eventos */}
          <TouchableOpacity 
            style={styles.card}
            onPress={goToEvents}
          >
            <View style={styles.cardIconContainer}>
              <MaterialIcons name="event" size={50} color="#4285F4" />
            </View>
            <Text style={styles.cardTitle}>Eventos</Text>
            <Text style={styles.cardDescription}>
              Gestiona y participa en eventos disponibles
            </Text>
            <View style={styles.cardButton}>
              <Text style={styles.cardButtonText}>Ver Más</Text>
            </View>
          </TouchableOpacity>

          {/* Card Dashboard */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <View style={styles.cardIconContainer}>
              <MaterialIcons name="dashboard" size={50} color="#4285F4" />
            </View>
            <Text style={styles.cardTitle}>Dashboard</Text>
            <Text style={styles.cardDescription}>
              Visualiza estadísticas y métricas de tus eventos
            </Text>
            <View style={styles.cardButton}>
              <Text style={styles.cardButtonText}>Ver Más</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer con licencia */}
      <View style={styles.footer}>
        <Text style={styles.licenseText}>
          📜 Contenido bajo licencia CC BY-SA 4.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarSmall: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmallText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerEmail: {
    fontSize: 12,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF5252',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 30,
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 800,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    width: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderTopWidth: 4,
    borderTopColor: '#4285F4',
  },
  cardIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  cardButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 6,
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  licenseText: {
    fontSize: 12,
    color: '#666',
  },
});
