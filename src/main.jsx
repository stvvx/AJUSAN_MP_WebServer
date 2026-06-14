import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AjusanPage from './AjusanPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AjusanPage />
  </StrictMode>,
)
