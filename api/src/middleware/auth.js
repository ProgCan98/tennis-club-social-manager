const jwt = require('jsonwebtoken')   // Para verificar el token

// Middleware que protege rutas: se usa en cualquier ruta que requiera login
function auth(req, res, next) {
  // El token viene en el header: Authorization: Bearer <token>
  const authHeader = req.headers['authorization']

  // Valida que el header exista y tenga el formato correcto "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Formato de token invalido' })
  }

  const token = authHeader.split(' ')[1]   // Extrae solo el token

  // Verifica que el token sea valido y no haya expirado (version sincrona)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // Adjunta los datos del usuario al request para usarlos en la ruta
    // Ej: req.user.userId, req.user.role
    req.user = decoded
    next()   // Pasa al siguiente middleware o al handler de la ruta
  } catch (err) {
    return res.status(403).json({ error: 'Token invalido o expirado' })
  }
}

module.exports = auth
