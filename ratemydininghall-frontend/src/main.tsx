import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux';
import { store } from './redux/store';
import ReviewPage from './pages/ReviewPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
        <ReviewPage />
    </Provider>
  </StrictMode>,
)
