import React from 'react'
import ReactDOM from 'react-dom/client'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import HubbleRedshift from './HubbleRedshift/HubbleRedshift.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<HubbleRedshift />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)
