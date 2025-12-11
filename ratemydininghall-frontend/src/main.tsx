import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App'
import theme from '@globalStyles/theme/theme.module.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <div className={theme.themeVars}>
        <App />
      </div>
    </Provider>
  </StrictMode>,
)
