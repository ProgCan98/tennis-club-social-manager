const express  = require('express')
const bcrypt   = require('bcryptjs')              // Para hashear contraseñas
const jwt      = require('jsonwebtoken')          // Para generar tokens JWT
const { query } = require('../db')                // Conexión a la base de datos

const router = express.Router()

// ── POST /api/users/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  // Validación básica de campos obligatorios
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' })
  }

  // Verifica que el email no esté ya registrado (respetando borrado lógico)
  const existing = await query(
    'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  )
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'El email ya está registrado' })
  }

  // Hashea la contraseña con bcrypt (10 = costo del hash, más alto = más seguro pero más lento)
  const password_hash = await bcrypt.hash(password, 10)

  // Inserta el usuario y devuelve los campos seguros (sin password_hash)
  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, created_at`,
    [name, email, password_hash]
  )

  const user = result.rows[0]

  // Genera el token JWT que el frontend usará en cada request
  const token = jwt.sign(
    { userId: user.id, role: user.role },   // Payload: datos que van dentro del token
    process.env.JWT_SECRET,                  // Clave secreta para firmar
    { expiresIn: '7d' }                      // El token expira en 7 días
  )

  res.status(201).json({ user, token })
})

// ── POST /api/users/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' })
  }

  // Busca el usuario activo por email
  const result = await query(
    'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  )

  const user = result.rows[0]

  // Si no existe el usuario o la contraseña no coincide, mismo mensaje de error
  // (no revelar si el email existe o no, por seguridad)
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Credenciales inválidas' })
  }

  // Genera el token JWT
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  // Devuelve datos del usuario sin el hash de la contraseña
  const { password_hash, ...safeUser } = user
  res.json({ user: safeUser, token })
})

module.exports = router