const { db } = require('../config/firebase.config');

// Crear notificación
const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, eventId, eventTitle } = req.body;

    const notification = {
      userId,
      type,
      title,
      message,
      eventId: eventId || null,
      eventTitle: eventTitle || null,
      read: false,
      createdAt: new Date().toISOString()
    };

    const notificationRef = await db.collection('notifications').add(notification);

    res.status(201).json({
      success: true,
      notificationId: notificationRef.id,
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al crear notificación' 
    });
  }
};

// Obtener notificaciones de un usuario
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.uid;

    const notificationsSnapshot = await db
      .collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const notifications = notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener notificaciones' 
    });
  }
};

// Marcar notificación como leída
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.uid;

    const notificationRef = db.collection('notifications').doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'Notificación no encontrada' 
      });
    }

    const notification = notificationDoc.data();
    if (notification.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'No autorizado' 
      });
    }

    await notificationRef.update({ read: true });

    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar notificación' 
    });
  }
};

// Marcar todas como leídas
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.uid;

    const notificationsSnapshot = await db
      .collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    notificationsSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();

    res.json({
      success: true,
      message: `${notificationsSnapshot.size} notificaciones marcadas como leídas`
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar notificaciones' 
    });
  }
};

// Eliminar notificación
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.uid;

    const notificationRef = db.collection('notifications').doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'Notificación no encontrada' 
      });
    }

    const notification = notificationDoc.data();
    if (notification.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'No autorizado' 
      });
    }

    await notificationRef.delete();

    res.json({
      success: true,
      message: 'Notificación eliminada'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al eliminar notificación' 
    });
  }
};

// Notificar a todos los participantes de un evento
const notifyEventParticipants = async (eventId, type, title, message) => {
  try {
    const eventDoc = await db.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      console.error('Event not found');
      return;
    }

    const event = eventDoc.data();
    const participants = event.participants || [];
    const organizerId = event.organizerId;

    // Notificar a todos los participantes
    const notifications = participants.map(participant => ({
      userId: participant.userId,
      type,
      title,
      message,
      eventId,
      eventTitle: event.title,
      read: false,
      createdAt: new Date().toISOString()
    }));

    // También notificar al organizador si no está en la lista de participantes
    const isOrganizerParticipant = participants.some(p => p.userId === organizerId);
    if (!isOrganizerParticipant && organizerId) {
      notifications.push({
        userId: organizerId,
        type,
        title,
        message,
        eventId,
        eventTitle: event.title,
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    // Guardar todas las notificaciones
    const batch = db.batch();
    notifications.forEach(notification => {
      const notificationRef = db.collection('notifications').doc();
      batch.set(notificationRef, notification);
    });

    await batch.commit();
    console.log(`${notifications.length} notificaciones creadas para el evento ${eventId}`);
  } catch (error) {
    console.error('Error notifying participants:', error);
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  notifyEventParticipants
};
