/**
 * Middleware de autorización por rol (RBAC)
 * Uso: router.post('/', auth, checkRole(['admin']), handler)
 *
 * @param {string[]} allowedRoles - Roles que tienen permiso (ej: ['admin'])
 */
function checkRole(allowedRoles) {
  return (req, res, next) => {
    // req.user lo pone el middleware auth.js antes de llegar acá
    const role = req.user?.role

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'No tenés permiso para realizar esta acción' })
    }

    next()
  }
}

module.exports = checkRole
