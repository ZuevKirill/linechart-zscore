import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <a href="https://github.com/ZuevKirill/linechart-zscore">github</a>
    <App />
  </StrictMode>,
)
