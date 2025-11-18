import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import notificationService from '../services/notificationService';
import { MaterialIcons } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';

export default function EditEventScreen({ route, navigation }) {
  const { eventId, event } = route.params;
  
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time);
  const [location, setLocation] = useState(event.location);
  const [category, setCategory] = useState(event.category);
  const [loading, setLoading] = useState(false);

  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);

  const handleUpdateEvent = async () => {
    if (!title || !description || !date || !location) {
      CustomAlert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);

      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        title,
        description,
        date,
        time,
        location,
        category,
        updatedAt: new Date().toISOString()
      });

      // Notificar a los participantes sobre el cambio
      if (event.participants && event.participants.length > 0) {
        notificationService.notifyEventChanged(title);
      }

      // Notificar al organizador
      notificationService.notifyEventUpdated(title);

      CustomAlert.alert('¡Éxito!', 'Evento actualizado correctamente', () => {
        navigation.goBack();
      });
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      CustomAlert.alert('Error', 'No se pudo actualizar el evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Editar Evento</Text>

        <TextInput
          style={styles.input}
          placeholder="Título del evento *"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción *"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <View style={styles.dateTimeInput}>
              <MaterialIcons name="event" size={20} color="#666" />
              <input
                ref={dateInputRef}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  color: date ? '#333' : '#999',
                  backgroundColor: 'transparent',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              />
            </View>
          </View>
          <View style={styles.halfWidth}>
            <View style={styles.dateTimeInput}>
              <MaterialIcons name="schedule" size={20} color="#666" />
              <input
                ref={timeInputRef}
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  color: time ? '#333' : '#999',
                  backgroundColor: 'transparent',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              />
            </View>
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Ubicación *"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.categoryContainer}>
          {['general', 'deportes', 'cultura', 'tecnología', 'educación'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleUpdateEvent}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    outlineStyle: 'none',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: '#4285F4',
  },
  categoryText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoryTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4285F4',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
  },
});