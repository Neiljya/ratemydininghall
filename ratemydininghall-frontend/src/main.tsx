import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App'
import theme from '@globalStyles/theme/theme.module.css';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/react-router';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
      <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      domain={import.meta.env.PROD ? "ratemydininghall.cc" : undefined}
      >
        <div className={theme.themeVars}>
            <App />
        </div>
      </ClerkProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
