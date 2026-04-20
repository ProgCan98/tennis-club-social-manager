import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import { seedIfEmpty } from './lib/seed'
import App from './App.jsx'

seedIfEmpty()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
