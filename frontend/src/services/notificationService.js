// Servicio de notificaciones para eventos
class NotificationService {
  constructor() {
    this.permission = 'default';
    this.notificationHistory = [];
    this.init();
    this.loadNotificationHistory();
  }

  init() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }
    return false;
  }

  loadNotificationHistory() {
    try {
      const stored = localStorage.getItem('notificationHistory');
      this.notificationHistory = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading notification history:', error);
      this.notificationHistory = [];
    }
  }

  saveNotificationHistory() {
    try {
      localStorage.setItem('notificationHistory', JSON.stringify(this.notificationHistory));
    } catch (error) {
      console.error('Error saving notification history:', error);
    }
  }

  addToHistory(type, title, message) {
    const notification = {
      id: Date.now().toString() + Math.random().toString(36),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    this.notificationHistory.unshift(notification);
    
    // Mantener solo las últimas 50 notificaciones
    if (this.notificationHistory.length > 50) {
      this.notificationHistory = this.notificationHistory.slice(0, 50);
    }
    
    this.saveNotificationHistory();
  }

  getNotificationHistory() {
    return [...this.notificationHistory];
  }

  clearNotificationHistory() {
    this.notificationHistory = [];
    this.saveNotificationHistory();
  }

  deleteNotification(id) {
    this.notificationHistory = this.notificationHistory.filter(n => n.id !== id);
    this.saveNotificationHistory();
  }

  markAsRead(id) {
    const notification = this.notificationHistory.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotificationHistory();
    }
  }

  getUnreadCount() {
    return this.notificationHistory.filter(n => !n.read).length;
  }

  sendNotification(title, options = {}) {
    if (this.permission === 'granted') {
      new Notification(title, {
        icon: '/icon.png',
        badge: '/icon.png',
        ...options
      });
    }
  }

  // Notificar cuando se crea un evento
  notifyEventCreated(eventTitle) {
    const title = '✅ Evento Creado';
    const message = `Tu evento "${eventTitle}" ha sido creado exitosamente`;
    
    this.sendNotification(title, {
      body: message,
      tag: 'event-created'
    });
    
    this.addToHistory('event_created', title, message);
  }

  // Notificar cuando se actualiza un evento
  notifyEventUpdated(eventTitle) {
    const title = '📝 Evento Actualizado';
    const message = `El evento "${eventTitle}" ha sido actualizado`;
    
    this.sendNotification(title, {
      body: message,
      tag: 'event-updated'
    });
    
    this.addToHistory('event_updated', title, message);
  }

  // Notificar cuando alguien confirma asistencia a tu evento
  notifyNewAttendee(eventTitle, attendeeEmail) {
    const title = '👥 Nueva Confirmación';
    const message = `${attendeeEmail} confirmó asistencia a "${eventTitle}"`;
    
    this.sendNotification(title, {
      body: message,
      tag: 'new-attendee'
    });
    
    this.addToHistory('new_attendee', title, message);
  }

  // Notificar cuando confirmas asistencia
  notifyAttendanceConfirmed(eventTitle) {
    const title = '✓ Asistencia Confirmada';
    const message = `Has confirmado tu asistencia a "${eventTitle}"`;
    
    this.sendNotification(title, {
      body: message,
      tag: 'attendance-confirmed'
    });
    
    this.addToHistory('attendance_confirmed', title, message);
  }

  // Notificar recordatorio de evento próximo (24h antes)
  notifyEventReminder(eventTitle, eventDate, eventTime) {
    const title = '🔔 Recordatorio de Evento';
    const message = `Mañana: "${eventTitle}" a las ${eventTime}`;
    
    this.sendNotification(title, {
      body: message,
      tag: 'event-reminder',
      requireInteraction: true
    });
    
    this.addToHistory('event_reminder', title, message);
  }

  // Notificar cuando un evento al que asistes es modificado
  notifyEventChanged(eventTitle) {
    const title = '⚠️ Evento Modificado';
    const message = `El evento "${eventTitle}" al que asistes ha sido modificado`;
    
    this.sendNotification(title, {
      body: message,
      tag: 'event-changed',
      requireInteraction: true
    });
    
    this.addToHistory('event_changed', title, message);
  }

  // Notificar cuando un evento es cancelado
  notifyEventCancelled(eventTitle) {
    const title = '❌ Evento Cancelado';
    const message = `El evento "${eventTitle}" ha sido cancelado`;
    
    this.sendNotification(title, {
      body: message,
      tag: 'event-cancelled',
      requireInteraction: true
    });
    
    this.addToHistory('event_cancelled', title, message);
  }

  // Programar recordatorios automáticos
  scheduleReminder(eventId, eventTitle, eventDate, eventTime) {
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    const reminderTime = new Date(eventDateTime.getTime() - 24 * 60 * 60 * 1000); // 24h antes
    const now = new Date();

    if (reminderTime > now) {
      const timeUntilReminder = reminderTime.getTime() - now.getTime();
      
      setTimeout(() => {
        this.notifyEventReminder(eventTitle, eventDate, eventTime);
      }, timeUntilReminder);

      // Guardar en localStorage para persistencia
      const reminders = JSON.parse(localStorage.getItem('event-reminders') || '{}');
      reminders[eventId] = {
        eventTitle,
        eventDate,
        eventTime,
        reminderTime: reminderTime.toISOString()
      };
      localStorage.setItem('event-reminders', JSON.stringify(reminders));
    }
  }

  // Verificar y enviar recordatorios pendientes
  checkPendingReminders() {
    const reminders = JSON.parse(localStorage.getItem('event-reminders') || '{}');
    const now = new Date();

    Object.entries(reminders).forEach(([eventId, reminder]) => {
      const reminderTime = new Date(reminder.reminderTime);
      
      if (reminderTime <= now && reminderTime > new Date(now.getTime() - 60 * 60 * 1000)) {
        // Enviar si es en la última hora
        this.notifyEventReminder(reminder.eventTitle, reminder.eventDate, reminder.eventTime);
        
        // Eliminar del storage
        delete reminders[eventId];
      }
    });

    localStorage.setItem('event-reminders', JSON.stringify(reminders));
  }
}

export default new NotificationService();
