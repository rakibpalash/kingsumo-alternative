import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply saved theme before first paint to avoid flash
const savedTheme = localStorage.getItem('theme')
const prefersDark = savedTheme ? savedTheme === 'dark' : true
document.documentElement.classList.toggle('dark', prefersDark)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
