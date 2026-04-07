import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { connectSupabase } from './store.js'
import { initializeDatabase } from './initSupabase.js'

// Initialize Supabase and Connect Realtime Listeners
initializeDatabase().then(() => connectSupabase())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
