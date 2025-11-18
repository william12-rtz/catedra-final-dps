const { db } = require('../config/firebase.config');
const { notifyEventParticipants } = require('./notification.controller');

// Crear nuevo evento
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, category } = req.body;
    const userId = req.user.uid;

    if (!title || !description || !date || !location) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const eventData = {
      title,
      description,
      date,
      time: time || '00:00',
      location,
      category: category || 'general',
      organizerId: userId,
      organizerEmail: req.user.email,
      participants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };

    const eventRef = await db.collection('events').add(eventData);

    // Crear notificación para el organizador
    await db.collection('notifications').add({
      userId: userId,
      type: 'event_created',
      title: '✨ Evento Creado',
      message: `Tu evento "${title}" ha sido creado exitosamente`,
      eventId: eventRef.id,
      eventTitle: title,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      eventId: eventRef.id,
      event: { id: eventRef.id, ...eventData }
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ error: 'Error al crear evento' });
  }
};

// Obtener todos los eventos
const getAllEvents = async (req, res) => {
  try {
    const { upcoming, past } = req.query;
    const now = new Date().toISOString();

    let query = db.collection('events');

    if (upcoming === 'true') {
      query = query.where('date', '>=', now.split('T')[0]).where('status', '==', 'active');
    } else if (past === 'true') {
      query = query.where('date', '<', now.split('T')[0]);
    }

    const snapshot = await query.orderBy('date', 'desc').get();

    const events = [];
    snapshot.forEach(doc => {
      events.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
};

// Obtener evento por ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const eventDoc = await db.collection('events').doc(id).get();

    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.status(200).json({
      success: true,
      event: { id: eventDoc.id, ...eventDoc.data() }
    });
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ error: 'Error al obtener evento' });
  }
};

// Actualizar evento
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const updates = req.body;

    // Verificar que el evento existe
    const eventDoc = await db.collection('events').doc(id).get();

    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const eventData = eventDoc.data();

    // Verificar que el usuario es el organizador
    if (eventData.organizerId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para editar este evento' });
    }

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // No permitir cambiar el organizador o participantes desde aquí
    delete updateData.organizerId;
    delete updateData.organizerEmail;
    delete updateData.participants;

    await db.collection('events').doc(id).update(updateData);

    const updatedEvent = await db.collection('events').doc(id).get();

    // Notificar a todos los participantes sobre la actualización
    if (eventData.participants && eventData.participants.length > 0) {
      const notificationTitle = '⚠️ Evento Modificado';
      const notificationMessage = `El evento "${eventData.title}" al que asistes ha sido modificado`;
      
      // Crear notificaciones para cada participante
      const batch = db.batch();
      eventData.participants.forEach(participant => {
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, {
          userId: participant.userId,
          type: 'event_changed',
          title: notificationTitle,
          message: notificationMessage,
          eventId: id,
          eventTitle: eventData.title,
          read: false,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    // Notificar al organizador
    await db.collection('notifications').add({
      userId: userId,
      type: 'event_updated',
      title: '📝 Evento Actualizado',
      message: `El evento "${eventData.title}" ha sido actualizado`,
      eventId: id,
      eventTitle: eventData.title,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Evento actualizado exitosamente',
      event: { id: updatedEvent.id, ...updatedEvent.data() }
    });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
};

// Eliminar evento
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const eventDoc = await db.collection('events').doc(id).get();

    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const eventData = eventDoc.data();

    if (eventData.organizerId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este evento' });
    }

    // Notificar a todos los participantes sobre la cancelación
    if (eventData.participants && eventData.participants.length > 0) {
      const batch = db.batch();
      eventData.participants.forEach(participant => {
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, {
          userId: participant.userId,
          type: 'event_cancelled',
          title: '❌ Evento Cancelado',
          message: `El evento "${eventData.title}" ha sido cancelado`,
          eventId: id,
          eventTitle: eventData.title,
          read: false,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    await db.collection('events').doc(id).delete();

    res.status(200).json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
};

// Confirmar asistencia a evento
const confirmAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const userEmail = req.user.email;

    const eventDoc = await db.collection('events').doc(id).get();

    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const eventData = eventDoc.data();
    const participants = eventData.participants || [];

    // Verificar si ya está registrado
    const alreadyRegistered = participants.some(p => p.userId === userId);

    if (alreadyRegistered) {
      return res.status(400).json({ error: 'Ya estás registrado en este evento' });
    }

    // Agregar participante
    participants.push({
      userId,
      userEmail,
      confirmedAt: new Date().toISOString()
    });

    await db.collection('events').doc(id).update({ participants });

    // Notificar al participante
    await db.collection('notifications').add({
      userId: userId,
      type: 'attendance_confirmed',
      title: '✓ Asistencia Confirmada',
      message: `Has confirmado tu asistencia a "${eventData.title}"`,
      eventId: id,
      eventTitle: eventData.title,
      read: false,
      createdAt: new Date().toISOString()
    });

    // Notificar al organizador
    await db.collection('notifications').add({
      userId: eventData.organizerId,
      type: 'new_attendee',
      title: '👥 Nueva Confirmación',
      message: `${userEmail} confirmó asistencia a "${eventData.title}"`,
      eventId: id,
      eventTitle: eventData.title,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Asistencia confirmada exitosamente',
      participantsCount: participants.length
    });
  } catch (error) {
    console.error('Error al confirmar asistencia:', error);
    res.status(500).json({ error: 'Error al confirmar asistencia' });
  }
};

// Cancelar asistencia
const cancelAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const eventDoc = await db.collection('events').doc(id).get();

    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const eventData = eventDoc.data();
    const participants = eventData.participants || [];

    const updatedParticipants = participants.filter(p => p.userId !== userId);

    await db.collection('events').doc(id).update({ participants: updatedParticipants });

    res.status(200).json({
      success: true,
      message: 'Asistencia cancelada',
      participantsCount: updatedParticipants.length
    });
  } catch (error) {
    console.error('Error al cancelar asistencia:', error);
    res.status(500).json({ error: 'Error al cancelar asistencia' });
  }
};

// Obtener eventos del usuario (como organizador)
const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db.collection('events')
      .where('organizerId', '==', userId)
      .orderBy('date', 'desc')
      .get();

    const events = [];
    snapshot.forEach(doc => {
      events.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error al obtener mis eventos:', error);
    res.status(500).json({ error: 'Error al obtener mis eventos' });
  }
};

// Obtener eventos en los que participo
const getMyParticipations = async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db.collection('events').get();

    const events = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const isParticipant = data.participants?.some(p => p.userId === userId);
      if (isParticipant) {
        events.push({ id: doc.id, ...data });
      }
    });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error al obtener participaciones:', error);
    res.status(500).json({ error: 'Error al obtener participaciones' });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  confirmAttendance,
  cancelAttendance,
  getMyEvents,
  getMyParticipations
};