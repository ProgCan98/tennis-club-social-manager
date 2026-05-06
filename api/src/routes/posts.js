const express    = require('express')
const { query }  = require('../db')          // Conexión a Neon
const auth       = require('../middleware/auth') // Middleware JWT
const checkRole  = require('../middleware/checkRole')

const router = express.Router()

// Todas las rutas de posts requieren token válido
router.use(auth)

// ── GET /api/posts ────────────────────────────────────────────────────────────
// Devuelve todos los posts activos del usuario logueado
// Acepta query param ?status=draft|scheduled|published para filtrar
router.get('/', async (req, res) => {
  const { status } = req.query         // Filtro opcional por status
  const userId = req.user.userId       // ID del usuario extraído del token

  let text = `SELECT * FROM posts
              WHERE user_id = $1 AND deleted_at IS NULL`
  const params = [userId]

  // Si viene filtro de status lo agrega dinámicamente
  if (status) {
    params.push(status)
    text += ` AND status = $${params.length}`
  }

  text += ' ORDER BY created_at DESC'  // Más recientes primero

  const { rows } = await query(text, params)
  res.json(rows)
})

// ── GET /api/posts/:id ────────────────────────────────────────────────────────
// Devuelve un post específico del usuario logueado
router.get('/:id', async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM posts
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [req.params.id, req.user.userId]
  )

  if (!rows.length) {
    return res.status(404).json({ error: 'Post no encontrado' })
  }
  res.json(rows[0])
})

// ── POST /api/posts ───────────────────────────────────────────────────────────
// Crea un nuevo post
router.post('/', checkRole(['admin']), async (req, res) => {
  const { title, body, status, platforms, scheduled_date, tags } = req.body

  if (!title) {
    return res.status(400).json({ error: 'El título es obligatorio' })
  }
  if (!platforms || !platforms.length) {
    return res.status(400).json({ error: 'Seleccioná al menos una plataforma' })
  }

  const { rows } = await query(
    `INSERT INTO posts (user_id, title, body, status, platforms, scheduled_date, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      req.user.userId,
      title,
      body        || null,
      status      || 'draft',
      platforms,                // pg guarda el array TEXT[] directamente
      scheduled_date || null,
      tags        || [],
    ]
  )

  res.status(201).json(rows[0])
})

// ── PUT /api/posts/:id ────────────────────────────────────────────────────────
// Edita un post existente del usuario logueado
router.put('/:id', checkRole(['admin']), async (req, res) => {
  const { title, body, status, platforms, scheduled_date, tags } = req.body

  // Verifica que el post exista y pertenezca al usuario
  const existing = await query(
    'SELECT id FROM posts WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    [req.params.id, req.user.userId]
  )
  if (!existing.rows.length) {
    return res.status(404).json({ error: 'Post no encontrado' })
  }

  const { rows } = await query(
    `UPDATE posts
     SET title = $1, body = $2, status = $3, platforms = $4,
         scheduled_date = $5, tags = $6, updated_at = NOW()
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [
      title,
      body           || null,
      status         || 'draft',
      platforms      || [],
      scheduled_date || null,
      tags           || [],
      req.params.id,
      req.user.userId,
    ]
  )

  res.json(rows[0])
})

// ── DELETE /api/posts/:id ─────────────────────────────────────────────────────
// Borrado LÓGICO: setea deleted_at en lugar de eliminar el registro
router.delete('/:id', checkRole(['admin']), async (req, res) => {
  const existing = await query(
    'SELECT id FROM posts WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    [req.params.id, req.user.userId]
  )
  if (!existing.rows.length) {
    return res.status(404).json({ error: 'Post no encontrado' })
  }

  await query(
    'UPDATE posts SET deleted_at = NOW() WHERE id = $1',
    [req.params.id]
  )

  res.json({ message: 'Post eliminado correctamente' })
})

module.exports = router