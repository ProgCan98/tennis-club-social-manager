const jwt = require('jsonwebtoken')   // Para verificar el token

// Middleware que protege rutas: se usa en cualquier ruta que requiera login
function auth(req, res, next) {
  // El token viene en el header: Authorization: Bearer <token>
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]   // Extrae solo el token

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  // Verifica que el token sea válido y no haya expirado
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' })
    }
    // Adjunta los datos del usuario al request para usarlos en la ruta
    // Ej: req.user.userId, req.user.role
    req.user = decoded
    next()   // Pasa al siguiente middleware o al handler de la ruta
  })
}

module.exports = auth