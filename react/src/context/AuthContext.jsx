import { createContext, useContext, useState } from 'react'
import { saveAuth, clearAuth, getToken, getUser } from '../lib/auth'
import { api } from '../lib/api'

// Contexto que comparte el estado de autenticación en toda la app
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Inicializa con el usuario guardado en localStorage (sesión persistente)
  const [user, setUser] = useState(() => getUser())

  // Devuelve true si hay sesión activa
  const isAuthenticated = !!user

  // Llama a la API de registro, guarda token y actualiza el estado
  async function register(name, email, password) {
    const data = await api.post('/api/users/register', { name, email, password })
    saveAuth(data.token, data.user)
    setUser(data.user)
  }

  // Llama a la API de login, guarda token y actualiza el estado
  async function login(email, password) {
    const data = await api.post('/api/users/login', { email, password })
    saveAuth(data.token, data.user)
    setUser(data.user)
  }

  // Limpia token y estado del usuario
  function logout() {
    clearAuth()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para consumir el contexto fácilmente en cualquier componente
// Uso: const { user, login, logout } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}