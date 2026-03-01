import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Early log so you can confirm the app script runs and console level shows "Info"
if (typeof console !== 'undefined' && console.log) {
  console.log('[LUFEL] App booting…')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

