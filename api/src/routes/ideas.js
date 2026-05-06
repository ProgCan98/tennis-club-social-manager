const express   = require('express')
const { query } = require('../db')
const auth      = require('../middleware/auth')
const checkRole = require('../middleware/checkRole')

const router = express.Router()

router.use(auth)   // Todas las rutas requieren token

// ── GET /api/ideas ────────────────────────────────────────────────────────────
// Devuelve todas las ideas activas del usuario. Filtra por ?status=nueva|aprobada|etc
router.get('/', async (req, res) => {
  const { status } = req.query
  const userId = req.user.userId

  let text = `SELECT * FROM ideas
              WHERE user_id = $1 AND deleted_at IS NULL`
  const params = [userId]

  if (status) {
    params.push(status)
    text += ` AND status = $${params.length}`
  }

  text += ' ORDER BY created_at DESC'

  const { rows } = await query(text, params)
  res.json(rows)
})

// ── GET /api/ideas/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM ideas
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [req.params.id, req.user.userId]
  )

  if (!rows.length) {
    return res.status(404).json({ error: 'Idea no encontrada' })
  }
  res.json(rows[0])
})

// ── POST /api/ideas ───────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { title, description, priority, status, tags } = req.body

  if (!title) {
    return res.status(400).json({ error: 'El título es obligatorio' })
  }

  const { rows } = await query(
    `INSERT INTO ideas (user_id, title, description, priority, status, tags)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      req.user.userId,
      title,
      description || null,
      priority    || 'media',   // 'alta' | 'media' | 'baja'
      status      || 'nueva',   // 'nueva' | 'aprobada' | 'descartada' | 'convertida'
      tags        || [],
    ]
  )

  res.status(201).json(rows[0])
})

// ── PUT /api/ideas/:id ────────────────────────────────────────────────────────
// Edita campos generales de una idea
router.put('/:id', checkRole(['admin']), async (req, res) => {
  const { title, description, priority, status, tags } = req.body

  const existing = await query(
    'SELECT id FROM ideas WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    [req.params.id, req.user.userId]
  )
  if (!existing.rows.length) {
    return res.status(404).json({ error: 'Idea no encontrada' })
  }

  const { rows } = await query(
    `UPDATE ideas
     SET title = $1, description = $2, priority = $3,
         status = $4, tags = $5, updated_at = NOW()
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
    [
      title,
      description || null,
      priority    || 'media',
      status      || 'nueva',
      tags        || [],
      req.params.id,
      req.user.userId,
    ]
  )

  res.json(rows[0])
})

// ── PUT /api/ideas/:id/convert ────────────────────────────────────────────────
// Convierte una idea en un borrador de post
// Crea el post y actualiza el status de la idea a 'convertida'
router.put('/:id/convert', checkRole(['admin']), async (req, res) => {
  // Busca la idea del usuario
  const ideaResult = await query(
    'SELECT * FROM ideas WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    [req.params.id, req.user.userId]
  )
  if (!ideaResult.rows.length) {
    return res.status(404).json({ error: 'Idea no encontrada' })
  }

  const idea = ideaResult.rows[0]

  // Verifica que la idea no esté ya convertida o descartada
  if (idea.status === 'convertida' || idea.status === 'descartada') {
    return res.status(400).json({ error: 'La idea no puede convertirse en este estado' })
  }

  // Crea el post borrador con los datos de la idea
  const postResult = await query(
    `INSERT INTO posts (user_id, title, body, status, platforms, tags)
     VALUES ($1, $2, $3, 'draft', '{}', $4)
     RETURNING *`,
    [req.user.userId, idea.title, idea.description || null, idea.tags]
  )

  const newPost = postResult.rows[0]

  // Actualiza la idea: status=convertida y guarda el id del post creado
  const { rows } = await query(
    `UPDATE ideas
     SET status = 'convertida', converted_post_id = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [newPost.id, idea.id]
  )

  res.json({ idea: rows[0], post: newPost })
})

// ── DELETE /api/ideas/:id ─────────────────────────────────────────────────────
// Borrado lógico
router.delete('/:id', checkRole(['admin']), async (req, res) => {
  const existing = await query(
    'SELECT id FROM ideas WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    [req.params.id, req.user.userId]
  )
  if (!existing.rows.length) {
    return res.status(404).json({ error: 'Idea no encontrada' })
  }

  await query(
    'UPDATE ideas SET deleted_at = NOW() WHERE id = $1',
    [req.params.id]
  )

  res.json({ message: 'Idea eliminada correctamente' })
})

module.exports = router