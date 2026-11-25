import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)

// Dev-only debugging handles
if (import.meta.env.DEV) {
  import('./store/useGame').then((m) => (window.__game = m.useGame))
  import('./game/playerState').then((m) => (window.__player = m))
}
