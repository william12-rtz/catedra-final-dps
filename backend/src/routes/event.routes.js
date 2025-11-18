const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Rutas protegidas
router.post('/', verifyToken, eventController.createEvent);
router.put('/:id', verifyToken, eventController.updateEvent);
router.delete('/:id', verifyToken, eventController.deleteEvent);

// Participación en eventos
router.post('/:id/attend', verifyToken, eventController.confirmAttendance);
router.delete('/:id/attend', verifyToken, eventController.cancelAttendance);

// Eventos del usuario
router.get('/my/organized', verifyToken, eventController.getMyEvents);
router.get('/my/participating', verifyToken, eventController.getMyParticipations);

module.exports = router;