const { Pool } = require('pg')      // Pool maneja múltiples conexiones simultáneas
require('dotenv').config()           // Carga las variables del archivo .env

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // URL completa de Neon
  ssl: { rejectUnauthorized: false },           // Neon requiere SSL obligatorio
})

// Función helper: ejecuta una query y devuelve las filas
// Uso: const { rows } = await query('SELECT * FROM users WHERE id = $1', [id])
const query = (text, params) => pool.query(text, params)

module.exports = { query }