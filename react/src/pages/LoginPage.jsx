import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, register }     = useAuth()
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
      <div className="login-card">

        {/* Logo / título */}
        <div className="login-card__header">
          <h1 className="login-card__title">🎾 Tennis Club</h1>
          <p className="login-card__subtitle">Social Manager</p>
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
            <p>🎾 <strong>Demo:</strong> Usuario: admin@tennis.com / Contraseña: 123456</p>
          </div>
        )}

      </div>
    </div>
  )
}