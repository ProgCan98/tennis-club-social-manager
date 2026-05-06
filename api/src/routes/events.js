const express   = require('express')
const { query } = require('../db')
const auth      = require('../middleware/auth')
const checkRole = require('../middleware/checkRole')

const router = express.Router()

router.use(auth)

// ── GET /api/events ───────────────────────────────────────────────────────────
// Devuelve todos los eventos activos del usuario.
// Filtra por ?month=2026-05 para traer solo los de un mes específico
router.get('/', async (req, res) => {
  const { month } = req.query   // Formato esperado: '2026-05'
  const userId = req.user.userId

  let text = `SELECT * FROM events
              WHERE user_id = $1 AND deleted_at IS NULL`
  const params = [userId]

  // Si viene el filtro de mes, filtra con DATE_TRUNC
  if (month) {
    params.push(month)
    text += ` AND TO_CHAR(event_date, 'YYYY-MM') = $${params.length}`
  }

  text += ' ORDER BY event_date ASC'   // Más próximos primero

  const { rows } = await query(text, params)
  res.json(rows)
})

// ── GET /api/events/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM events
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [req.params.id, req.user.userId]
  )

  if (!rows.length) {
    return res.status(404).json({ error: 'Evento no encontrado' })
  }
  res.json(rows[0])
})

// ── POST /api/events ──────────────────────────────────────────────────────────
router.post('/', checkRole(['admin']), async (req, res) => {
  const { title, description, event_type, event_date } = req.body

  if (!title) {
    return res.status(400).json({ error: 'El título es obligatorio' })
  }
  if (!event_date) {
    return res.status(400).json({ error: 'La fecha es obligatoria' })
  }

  const { rows } = await query(
    `INSERT INTO events (user_id, title, description, event_type, event_date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      req.user.userId,
      title,
      description || null,
      event_type  || 'otro',   // 'torneo' | 'clase' | 'social' | 'feriado' | 'otro'
      event_date,
    ]
  )

  res.status(201).json(rows[0])
})

// ── PUT /api/events/:id ───────────────────────────────────────────────────────
router.put('/:id', checkRole(['admin']), async (req, res) => {
  const { title, description, event_type, event_date } = req.body

  const existing = await query(
    'SELECT id FROM events WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    [req.params.id, req.user.userId]
  )
  if (!existing.rows.length) {
    return res.status(404).json({ error: 'Evento no encontrado' })
  }

  const { rows } = await query(
    `UPDATE events
     SET title = $1, description = $2, event_type = $3,
         event_date = $4, updated_at = NOW()
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [
      title,
      description || null,
      event_type  || 'otro',
      event_date,
      req.params.id,
      req.user.userId,
    ]
  )

  res.json(rows[0])
})

// ── DELETE /api/events/:id ────────────────────────────────────────────────────
// Borrado lógico
router.delete('/:id', checkRole(['admin']), async (req, res) => {
  const existing = await query(
    'SELECT id FROM events WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    [req.params.id, req.user.userId]
  )
  if (!existing.rows.length) {
    return res.status(404).json({ error: 'Evento no encontrado' })
  }

  await query(
    'UPDATE events SET deleted_at = NOW() WHERE id = $1',
    [req.params.id]
  )

  res.json({ message: 'Evento eliminado correctamente' })
})

module.exports = router