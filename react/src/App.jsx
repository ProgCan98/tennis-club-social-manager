import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import DashboardPage from './pages/DashboardPage'
import PostsPage     from './pages/PostsPage'
import IdeasPage     from './pages/IdeasPage'
import CalendarPage  from './pages/CalendarPage'
import LoginPage     from './pages/LoginPage'

// Componente que protege rutas: si no hay sesión redirige a /login
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas */}
      <Route path="/"         element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/posts"    element={<PrivateRoute><PostsPage /></PrivateRoute>} />
      <Route path="/ideas"    element={<PrivateRoute><IdeasPage /></PrivateRoute>} />
      <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />

      {/* Cualquier ruta desconocida → dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    // AuthProvider envuelve toda la app para que useAuth() funcione en cualquier componente
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App