/* import React, {createContext, useContext, useRef} from 'react' */
import React from 'react'

import ReactDOM from 'react-dom/client'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App.jsx'

import OriginalThree from './HubbleRedshift/OriginalThree.jsx'
import './index.css'



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<OriginalThree />} />

      </Routes>
    </Router>
  </React.StrictMode>,
)
