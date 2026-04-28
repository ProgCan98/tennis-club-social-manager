const { Pool } = require('pg')      // Pool maneja múltiples conexiones simultáneas
require('dotenv').config()           // Carga las variables del archivo .env

// Separa la DATABASE_URL del parámetro sslmode para evitar conflicto con pg v8
const connectionString = process.env.DATABASE_URL?.replace('?sslmode=require', '')

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },  // Acepta el certificado de Neon sin verificar CA
})

// Función helper: ejecuta una query y devuelve las filas
// Uso: const { rows } = await query('SELECT * FROM users WHERE id = $1', [id])
const query = (text, params) => pool.query(text, params)

module.exports = { query }