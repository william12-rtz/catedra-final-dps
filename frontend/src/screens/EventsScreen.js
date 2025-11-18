import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { MaterialIcons } from '@expo/vector-icons';

export default function EventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('upcoming'); // upcoming, past, all
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Configurar header con botón de notificaciones
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <MaterialIcons name="notifications" size={28} color="#4285F4" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, unreadCount]);

  useEffect(() => {
    loadEvents();
  }, [filter]);

  useEffect(() => {
    // Actualizar contador de notificaciones no leídas
    if (!auth.currentUser) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', auth.currentUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  const loadEvents = () => {
    setLoading(true);
    
    let q;
    
    if (filter === 'upcoming' || filter === 'past') {
      // Consulta simple sin índices compuestos
      q = query(collection(db, 'events'), orderBy('date', 'desc'));
    } else {
      q = query(collection(db, 'events'), orderBy('date', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = [];
      const today = new Date().toISOString().split('T')[0];
      
      snapshot.forEach((doc) => {
        const eventData = { id: doc.id, ...doc.data() };
        
        // Filtrar en el cliente en lugar de en la consulta
        if (filter === 'upcoming') {
          if (eventData.date >= today && eventData.status === 'active') {
            eventsData.push(eventData);
          }
        } else if (filter === 'past') {
          if (eventData.date < today) {
            eventsData.push(eventData);
          }
        } else {
          eventsData.push(eventData);
        }
      });
      
      setEvents(eventsData);
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const formatDate = (dateString) => {
    // Evitar problemas de zona horaria usando split directamente
    const [year, month, day] = dateString.split('-');
    const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${parseInt(day)} de ${monthNames[parseInt(month) - 1]} de ${year}`;
  };

  const renderEvent = ({ item }) => {
    const isOrganizer = item.organizerId === auth.currentUser?.uid;
    const isParticipant = item.participants?.some(p => p.userId === auth.currentUser?.uid);
    
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          {isOrganizer && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Organizador</Text>
            </View>
          )}
          {isParticipant && !isOrganizer && (
            <View style={[styles.badge, styles.participantBadge]}>
              <Text style={styles.badgeText}>Asistiendo</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.eventDate}>{formatDate(item.date)} - {item.time}</Text>
        <View style={styles.locationRow}>
          <MaterialIcons name="place" size={16} color="#666" />
          <Text style={styles.eventLocation}>{item.location}</Text>
        </View>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.eventFooter}>
          <View style={styles.participantsRow}>
            <MaterialIcons name="group" size={16} color="#666" />
            <Text style={styles.participantsCount}>
              {item.participants?.length || 0} participantes
            </Text>
          </View>
          <Text style={styles.category}>{item.category}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Eventos</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.notificationButtonHeader}
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialIcons name="notifications" size={28} color="#4285F4" />
            {unreadCount > 0 && (
              <View style={styles.badgeHeader}>
                <Text style={styles.badgeTextHeader}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateEvent')}
          >
            <Text style={styles.createButtonText}>+ Crear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'upcoming' && styles.filterButtonActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
            Próximos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'past' && styles.filterButtonActive]}
          onPress={() => setFilter('past')}
        >
          <Text style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>
            Pasados
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay eventos disponibles</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notificationButtonHeader: {
    position: 'relative',
    padding: 5,
  },
  badgeHeader: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeTextHeader: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#4285F4',
  },
  filterText: {
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badge: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 10,
  },
  participantBadge: {
    backgroundColor: '#34A853',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
  },
  eventDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantsCount: {
    fontSize: 12,
    color: '#666',
  },
  category: {
    fontSize: 12,
    color: '#4285F4',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  notificationButton: {
    marginRight: 15,
    position: 'relative',
    padding: 5,
  },
});