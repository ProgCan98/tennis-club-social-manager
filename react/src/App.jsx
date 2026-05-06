import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import DashboardPage from './pages/DashboardPage'
import PostsPage     from './pages/PostsPage'
import IdeasPage     from './pages/IdeasPage'
import CalendarPage  from './pages/CalendarPage'
import LoginPage     from './pages/LoginPage'

// Requiere sesión activa; si no hay sesión → /login
// Si hay sesión pero el rol no está permitido → redirige según rol
function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/calendar" replace />
  }
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Solo ADMIN */}
      <Route path="/"      element={<PrivateRoute allowedRoles={['admin']}><DashboardPage /></PrivateRoute>} />
      <Route path="/posts" element={<PrivateRoute allowedRoles={['admin']}><PostsPage /></PrivateRoute>} />
      <Route path="/ideas" element={<PrivateRoute allowedRoles={['admin']}><IdeasPage /></PrivateRoute>} />

      {/* Todos los roles autenticados */}
      <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />

      {/* Ruta raíz: admin → dashboard, viewer → calendar */}
      <Route
        path="*"
        element={
          <Navigate to={user?.role === 'viewer' ? '/calendar' : '/'} replace />
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App