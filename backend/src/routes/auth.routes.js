const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Ruta para verificar el token de Firebase
router.post('/verify', authController.verifyUser);

// Ruta protegida para obtener el perfil del usuario
router.get('/profile', verifyToken, authController.getUserProfile);

module.exports = router;
