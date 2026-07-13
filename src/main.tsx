import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/styles/global.css';
import App from './App';

document.documentElement.classList.toggle('dark', localStorage.getItem('ideia-theme') === 'dark');

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
