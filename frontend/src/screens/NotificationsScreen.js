import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { MaterialIcons } from '@expo/vector-icons';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Consulta simple sin índice compuesto - ordenar en el cliente
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar en el cliente por createdAt descendente
      notificationsList.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      
      setNotifications(notificationsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAllNotifications = () => {
    Alert.alert(
      'Limpiar notificaciones',
      '¿Estás seguro de que quieres eliminar todas las notificaciones?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todas',
          style: 'destructive',
          onPress: async () => {
            try {
              const batch = writeBatch(db);
              notifications.forEach(notification => {
                const notificationRef = doc(db, 'notifications', notification.id);
                batch.delete(notificationRef);
              });
              await batch.commit();
              Alert.alert('Éxito', 'Todas las notificaciones han sido eliminadas');
            } catch (error) {
              console.error('Error al eliminar notificaciones:', error);
              Alert.alert('Error', 'No se pudieron eliminar las notificaciones');
            }
          }
        }
      ]
    );
  };

  const deleteNotification = async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      Alert.alert('Error', 'No se pudo eliminar la notificación');
    }
  };

  const markAsRead = async (id, isRead) => {
    if (!isRead) {
      try {
        await updateDoc(doc(db, 'notifications', id), { read: true });
      } catch (error) {
        console.error('Error al marcar como leída:', error);
      }
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      event_created: 'auto-awesome',
      event_updated: 'edit',
      event_cancelled: 'cancel',
      event_changed: 'warning',
      attendance_confirmed: 'check-circle',
      new_attendee: 'person-add',
      event_reminder: 'notifications-active'
    };
    return icons[type] || 'campaign';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => {
        markAsRead(item.id, item.read);
        if (item.eventId) {
          navigation.navigate('EventDetail', { eventId: item.eventId });
        }
      }}
      onLongPress={() => deleteNotification(item.id)}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name={getNotificationIcon(item.type)} size={24} color="#4285F4" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.timestamp}>{formatTime(item.timestamp || item.createdAt)}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAllNotifications}>
            <Text style={styles.clearButton}>Limpiar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="notifications-none" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No tienes notificaciones</Text>
          <Text style={styles.emptySubtext}>
            Aquí aparecerán las notificaciones sobre eventos, confirmaciones y recordatorios
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4285F4',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
