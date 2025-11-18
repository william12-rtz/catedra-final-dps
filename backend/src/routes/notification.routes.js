const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notification.controller');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener notificaciones del usuario
router.get('/', getUserNotifications);

// Marcar notificación como leída
router.put('/:notificationId/read', markAsRead);

// Marcar todas como leídas
router.put('/read-all', markAllAsRead);

// Eliminar notificación
router.delete('/:notificationId', deleteNotification);

module.exports = router;
