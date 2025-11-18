const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
