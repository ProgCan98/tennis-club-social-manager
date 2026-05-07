import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function LoginPage() {
  const { login, register }     = useAuth()
  const { dark, toggleTheme }   = useTheme()
  const navigate                = useNavigate()
  const [isRegister, setIsRegister] = useState(false)  // Alterna entre login y registro
  const [form, setForm]         = useState({ name: '', email: '', password: '' })
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password)
      } else {
        await login(form.email, form.password)
      }
      navigate('/')    // Redirige al dashboard tras login exitoso
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Botón de tema flotante arriba a la derecha */}
      <button
        className="login-theme-btn"
        onClick={toggleTheme}
        title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        aria-label="Cambiar tema"
      >
        {dark ? '☀️' : '🌙'}
      </button>

      <div className="login-card">

        {/* Logo / título */}
        <div className="login-card__header">
          <img src="/Logo_mini_MarcaAgua.png" alt="Tennis Club logo" className="login-card__logo" />
          <h1 className="login-card__title">La Falda</h1>
          <p className="login-card__subtitle">Club de Campo · Social Manager</p>
        </div>

        {/* Tabs login / registro */}
        <div className="login-card__tabs">
          <button
            className={`login-tab${!isRegister ? ' login-tab--active' : ''}`}
            onClick={() => setIsRegister(false)}
            type="button"
          >
            Iniciar sesión
          </button>
          <button
            className={`login-tab${isRegister ? ' login-tab--active' : ''}`}
            onClick={() => setIsRegister(true)}
            type="button"
          >
            Registrarse
          </button>
        </div>

        <form className="login-card__form" onSubmit={handleSubmit}>
          {/* Campo nombre — solo en registro */}
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                className="form-input"
                type="text"
                placeholder="Tu nombre"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={e => setField('email', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setField('password', e.target.value)}
              required
            />
          </div>

          {/* Mensaje de error de la API */}
          {error && <p className="login-card__error">{error}</p>}

          <button
            className="btn btn--primary login-card__submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>

        {/* Credenciales de demo */}
        {!isRegister && (
          <div className="login-card__demo">
            <p>🎾 <strong>Admin:</strong> admin@tennis.com / 123456</p>
            <p>👁️ <strong>Visor:</strong> franco@tennis.com / 123456</p>
          </div>
        )}

      </div>
    </div>
  )
}