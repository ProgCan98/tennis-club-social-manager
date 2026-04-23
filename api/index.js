require('dotenv').config()                        // Carga .env antes que todo

const express  = require('express')
const cors     = require('cors')                  // Permite requests desde el frontend React

const usersRouter  = require('./src/routes/users')
const postsRouter  = require('./src/routes/posts')
const ideasRouter  = require('./src/routes/ideas')
const eventsRouter = require('./src/routes/events')

const app  = express()
const PORT = process.env.PORT || 3001             // Usa el puerto del .env o 3001 por defecto

// ── Middlewares globales ──────────────────────────────────────────────────────
app.use(cors())                    // Acepta requests de cualquier origen (en prod se restringe)
app.use(express.json())            // Parsea el body de los requests como JSON

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/users',  usersRouter)   // POST /api/users/register, POST /api/users/login
app.use('/api/posts',  postsRouter)   // CRUD de publicaciones
app.use('/api/ideas',  ideasRouter)   // CRUD de ideas
app.use('/api/events', eventsRouter)  // CRUD de eventos

// ── Ruta de salud: sirve para verificar que el servidor está vivo ──────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Manejo global de errores: captura cualquier error no manejado ──────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Error interno del servidor' })
})

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`)
})