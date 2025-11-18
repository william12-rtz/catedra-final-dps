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

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <AlertProvider>
      <NavigationContainer>
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
