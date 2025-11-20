import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { API_URL } from '../config/constants';
import { MaterialIcons } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  useEffect(() => {
    // Recargar evento cuando se regrese de la pantalla de edición
    const unsubscribe = navigation.addListener('focus', () => {
      loadEvent();
    });

    return unsubscribe;
  }, [navigation]);

  const loadEvent = async () => {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));

      if (eventDoc.exists()) {
        const eventData = { id: eventDoc.id, ...eventDoc.data() };
        setEvent(eventData);

        // Verificar si el usuario está asistiendo
        const isAttending = eventData.participants?.some(
            p => p.userId === auth.currentUser?.uid
        );
        setAttending(isAttending);
      } else {
        Alert.alert('Error', 'Evento no encontrado');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error al cargar evento:', error);
      Alert.alert('Error', 'No se pudo cargar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleShareFacebook = async () => {
    // 1. Construimos la URL del evento (puedes cambiarla por tu dominio real)

    const eventUrl = `https://fe-events-murex.vercel.app` + eventId;

    // 2. Construimos la URL de Facebook para compartir
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;

    try {
      // 3. Verificamos si se puede abrir la URL
      const supported = await Linking.canOpenURL(facebookUrl);
      console.log(supported, 'LOG supported');

      if (supported) {
        await Linking.openURL(facebookUrl);
      } else {
        Alert.alert('Error', 'No se puede abrir Facebook');
      }
    } catch (error) {
      console.log('Error al compartir en Facebook:', error);
      Alert.alert('Error', 'Hubo un problema al compartir');
    }
  };

  const handleAttendance = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const endpoint = attending
          ? `${API_URL}/api/events/${eventId}/attend`
          : `${API_URL}/api/events/${eventId}/attend`;

      const method = attending ? 'DELETE' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setAttending(!attending);
        CustomAlert.alert(
            '¡Listo!',
            attending
                ? 'Has cancelado tu asistencia'
                : 'Tu asistencia ha sido confirmada. Recibirás una notificación.',
            () => loadEvent()
        );
      } else {
        CustomAlert.alert('Error', data.error || 'No se pudo actualizar tu asistencia');
      }
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
      CustomAlert.alert('Error', 'No se pudo actualizar tu asistencia');
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditEvent', { eventId, event });
  };

  const handleDelete = async () => {
    CustomAlert.confirm(
        'Eliminar evento',
        '¿Estás seguro de que quieres eliminar este evento?',
        async () => {
          try {
            const token = await auth.currentUser.getIdToken();
            console.log('Eliminando evento:', eventId);

            const response = await fetch(`${API_URL}/api/events/${eventId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
              CustomAlert.alert('Eliminado', 'El evento ha sido eliminado', () => {
                navigation.navigate('Events');
              });
            } else {
              CustomAlert.alert('Error', data.error || 'No se pudo eliminar el evento');
            }
          } catch (error) {
            console.error('Error al eliminar evento:', error);
            CustomAlert.alert('Error', 'No se pudo eliminar el evento: ' + error.message);
          }
        }
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
        </View>
    );
  }

  if (!event) {
    return null;
  }

  const isOrganizer = event.organizerId === auth.currentUser?.uid;

  // Combinar fecha y hora para una comparación precisa en hora local
  const [year, month, day] = event.date.split('-');
  const [hours, minutes] = (event.time || '00:00').split(':');
  const eventDateTime = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
  );
  const now = new Date();
  const isPastEvent = eventDateTime < now;

  return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Info Principal en Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <MaterialIcons name="event" size={20} color="#4285F4" />
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValue}>
                {event.date.split('-').reverse().join('/')}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <MaterialIcons name="schedule" size={20} color="#4285F4" />
              <Text style={styles.infoLabel}>Hora</Text>
              <Text style={styles.infoValue}>{event.time}</Text>
            </View>

            <View style={styles.infoCard}>
              <MaterialIcons name="group" size={20} color="#4285F4" />
              <Text style={styles.infoLabel}>Asistentes</Text>
              <Text style={styles.infoValue}>{event.participants?.length || 0}</Text>
            </View>
          </View>

          {/* Ubicación y Descripción */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons name="place" size={18} color="#666" />
              <Text style={styles.sectionTitle}>{event.location}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Organizador */}
          <View style={styles.organizerRow}>
            <MaterialIcons name="person" size={18} color="#666" />
            <Text style={styles.organizerText}>Organizado por: {event.organizerEmail}</Text>
          </View>

          {/* Participantes */}
          {event.participants && event.participants.length > 0 && (
              <View style={styles.participantsSection}>
                <Text style={styles.participantsTitle}>Participantes confirmados:</Text>
                {event.participants.map((participant, index) => (
                    <Text key={index} style={styles.participantEmail}>• {participant.userEmail}</Text>
                ))}
              </View>
          )}

          {/* Compartir Evento */}
          <View style={styles.shareSection}>
            <Text style={styles.shareSectionTitle}>Compartir evento</Text>
            <View style={styles.shareButtons}>
              <TouchableOpacity style={styles.shareButton} onPress={handleShareFacebook}>
                <MaterialIcons name="facebook" size={24} color="#1877F2" />
                <Text style={styles.shareButtonText}>Facebook</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton}>
                <MaterialIcons name="email" size={24} color="#EA4335" />
                <Text style={styles.shareButtonText}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton}>
                <MaterialIcons name="link" size={24} color="#666" />
                <Text style={styles.shareButtonText}>Copiar link</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Comentarios y Calificaciones */}
          <View style={styles.commentsSection}>
            <View style={styles.commentsSectionHeader}>
              <MaterialIcons name="star" size={20} color="#FFC107" />
              <Text style={styles.commentsSectionTitle}>Comentarios y Calificaciones</Text>
            </View>

            {/* Calificación promedio */}
            <View style={styles.ratingOverview}>
              <Text style={styles.ratingNumber}>4.5</Text>
              <View style={styles.starsContainer}>
                <MaterialIcons name="star" size={20} color="#FFC107" />
                <MaterialIcons name="star" size={20} color="#FFC107" />
                <MaterialIcons name="star" size={20} color="#FFC107" />
                <MaterialIcons name="star" size={20} color="#FFC107" />
                <MaterialIcons name="star-half" size={20} color="#FFC107" />
              </View>
              <Text style={styles.ratingCount}>12 calificaciones</Text>
            </View>

            {/* Lista de comentarios */}
            <View style={styles.commentsList}>
              <View style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>JD</Text>
                  </View>
                  <View style={styles.commentInfo}>
                    <Text style={styles.commentAuthor}>Juan Pérez</Text>
                    <View style={styles.commentStars}>
                      <MaterialIcons name="star" size={14} color="#FFC107" />
                      <MaterialIcons name="star" size={14} color="#FFC107" />
                      <MaterialIcons name="star" size={14} color="#FFC107" />
                      <MaterialIcons name="star" size={14} color="#FFC107" />
                      <MaterialIcons name="star" size={14} color="#FFC107" />
                    </View>
                  </View>
                </View>
                <Text style={styles.commentText}>
                  Excelente evento, muy bien organizado y con contenido de calidad.
                </Text>
                <Text style={styles.commentDate}>Hace 2 días</Text>
              </View>

              <View style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>MG</Text>
                  </View>
                  <View style={styles.commentInfo}>
                    <Text style={styles.commentAuthor}>María González</Text>
                    <View style={styles.commentStars}>
                      <MaterialIcons name="star" size={14} color="#FFC107" />
                      <MaterialIcons name="star" size={14} color="#FFC107" />
                      <MaterialIcons name="star" size={14} color="#FFC107" />
                      <MaterialIcons name="star" size={14} color="#FFC107" />
                      <MaterialIcons name="star-outline" size={14} color="#FFC107" />
                    </View>
                  </View>
                </View>
                <Text style={styles.commentText}>
                  Me gustó mucho, aunque el lugar estaba un poco lleno.
                </Text>
                <Text style={styles.commentDate}>Hace 1 semana</Text>
              </View>
            </View>

            {/* Botón para agregar comentario */}
            <TouchableOpacity style={styles.addCommentButton}>
              <MaterialIcons name="add-comment" size={18} color="#4285F4" />
              <Text style={styles.addCommentButtonText}>Agregar comentario</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isOrganizer ? (
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <MaterialIcons name="edit" size={16} color="#fff" />
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <MaterialIcons name="delete" size={16} color="#fff" />
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
        ) : (
            !isPastEvent && (
                <TouchableOpacity
                    style={[styles.attendButton, attending && styles.attendingButton]}
                    onPress={handleAttendance}
                >
                  <MaterialIcons name={attending ? "check-circle" : "add-circle"} size={18} color="#fff" />
                  <Text style={styles.attendButtonText}>
                    {attending ? 'Asistiendo' : 'Confirmar Asistencia'}
                  </Text>
                </TouchableOpacity>
            )
        )}

        {isPastEvent && (
            <View style={styles.pastEventBanner}>
              <MaterialIcons name="event-busy" size={20} color="#856404" />
              <Text style={styles.pastEventText}>Evento finalizado</Text>
            </View>
        )}

        <View style={styles.licenseSection}>
          <View style={styles.licenseTitleRow}>
            <MaterialIcons name="gavel" size={16} color="#333" />
            <Text style={styles.licenseTitle}>Licencia</Text>
          </View>
          <Text style={styles.licenseText}>
            Este contenido está bajo licencia Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
          </Text>
          <Text style={styles.licenseLink}>
            https://creativecommons.org/licenses/by-sa/4.0/
          </Text>
        </View>
      </ScrollView>
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
    backgroundColor: '#4285F4',
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  content: {
    padding: 16,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  organizerText: {
    fontSize: 13,
    color: '#666',
  },
  participantsSection: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  participantsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  participantEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  shareSection: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  shareSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-around',
  },
  shareButton: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  shareButtonText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  commentsSection: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  commentsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  commentsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 12,
  },
  ratingNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  },
  commentsList: {
    gap: 12,
    marginBottom: 12,
  },
  commentCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  commentStars: {
    flexDirection: 'row',
    gap: 2,
  },
  commentText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  commentDate: {
    fontSize: 11,
    color: '#999',
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4285F4',
    borderStyle: 'dashed',
  },
  addCommentButtonText: {
    fontSize: 13,
    color: '#4285F4',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 140,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#FF5252',
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 140,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  attendButton: {
    flexDirection: 'row',
    backgroundColor: '#34A853',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    alignSelf: 'center',
    minWidth: 250,
    maxWidth: 400,
  },
  attendingButton: {
    backgroundColor: '#666',
  },
  attendButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  pastEventBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  pastEventText: {
    color: '#856404',
    fontSize: 13,
    fontWeight: '600',
  },
  licenseSection: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  licenseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  licenseTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  licenseText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
  licenseLink: {
    fontSize: 10,
    color: '#4285F4',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
