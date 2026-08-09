import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@styles/global/reset.css';
import { bootstrapTelegramWebApp } from '@shared/telegram/telegramWebApp';

bootstrapTelegramWebApp();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
