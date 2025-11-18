const { admin } = require('../config/firebase.config');

const verifyUser = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    // Verificar el token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Obtener información del usuario
    const user = await admin.auth().getUser(decodedToken.uid);

    res.status(200).json({
      success: true,
      message: 'Usuario autenticado correctamente',
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: user.providerData[0]?.providerId || 'password'
      }
    });
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    res.status(401).json({ 
      success: false, 
      error: 'Token inválido o expirado' 
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

module.exports = {
  verifyUser,
  getUserProfile
};
