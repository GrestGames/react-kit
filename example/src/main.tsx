import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorTrackerProvider, Toaster } from '@grest-ts/react';
import '@grest-ts/react/css/base.css';
import App from './App';
import './App.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorTrackerProvider>
      <App />
      <Toaster position="top-right" />
    </ErrorTrackerProvider>
  </StrictMode>,
);
