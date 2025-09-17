import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ReviewPage from './pages/ReviewPage.tsx';
import '@globalStyles/theme/theme.module.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReviewPage />
  </StrictMode>,
)
