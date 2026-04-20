import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import PostsPage     from './pages/PostsPage'
import IdeasPage     from './pages/IdeasPage'
import CalendarPage  from './pages/CalendarPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<DashboardPage />} />
        <Route path="/posts"    element={<PostsPage />} />
        <Route path="/ideas"    element={<IdeasPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
