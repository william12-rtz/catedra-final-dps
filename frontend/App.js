import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebase';
import notificationService from './src/services/notificationService';
import LoginScreen from './src/screens/LoginScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import EventsScreen from './src/screens/EventsScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import CreateEventScreen from './src/screens/CreateEventScreen';
import EditEventScreen from './src/screens/EditEventScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { ActivityIndicator, View } from 'react-native';
import { AlertProvider } from './src/components/CustomAlert';
import * as Linking from 'expo-linking';

const Stack = createNativeStackNavigator();

// Configuración de Deep Links
const linking = {
  prefixes: [
    'catedrafinal://',
    'https://fe-events-murex.vercel.app',
    'http://fe-events-murex.vercel.app'
  ],
  config: {
    screens: {
      Login: 'login',
      Welcome: 'welcome',
      Events: 'eventos',
      EventDetail: {
        path: 'evento/:eventId',
        parse: {
          eventId: (eventId) => eventId,
        },
      },
      CreateEvent: 'crear-evento',
      EditEvent: 'editar-evento/:eventId',
      Notifications: 'notificaciones',
      Dashboard: 'dashboard',
    },
  },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigationRef = React.useRef(null);

  useEffect(() => {
    // Inicializar servicio de notificaciones
    notificationService.init();
    notificationService.requestPermission();
    notificationService.checkPendingReminders();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Listener para Deep Links
  useEffect(() => {
    // Escuchar cuando se recibe un deep link mientras la app está abierta
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Verificar si la app se abrió con un deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 App abierta con URL inicial:', url);
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove();
  }, []);

  const handleDeepLink = ({ url }) => {
    console.log('🔗 Deep link recibido:', url);

    // Extraer información del deep link
    if (url.includes('/evento/')) {
      // Extraer el eventId de la URL
      const match = url.match(/evento\/([^/?]+)/);
      if (match && match[1]) {
        const eventId = match[1];
        console.log('📅 Navegando al evento:', eventId);

        // Navegar al detalle del evento si navigationRef está disponible
        if (navigationRef.current) {
          navigationRef.current.navigate('EventDetail', { eventId });
        }
      }
    }
  };

  if (loading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
          <ActivityIndicator size="large" color="#4285F4" />
        </View>
    );
  }

  return (
      <AlertProvider>
        <NavigationContainer
            ref={navigationRef}
            linking={linking}
            fallback={
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4285F4" />
              </View>
            }
            onReady={() => {
              console.log('✅ NavigationContainer ready');
            }}
        >
          <Stack.Navigator
              initialRouteName={user ? 'Welcome' : 'Login'}
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#4285F4',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
          >
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Events"
                component={EventsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="EventDetail"
                component={EventDetailScreen}
                options={{ title: 'Detalle del Evento' }}
            />
            <Stack.Screen
                name="CreateEvent"
                component={CreateEventScreen}
                options={{ title: 'Crear Evento' }}
            />
            <Stack.Screen
                name="EditEvent"
                component={EditEventScreen}
                options={{ title: 'Editar Evento' }}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ title: 'Notificaciones' }}
            />
            <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: 'Dashboard' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AlertProvider>
  );
}
