import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorTrackerProvider, OverlayStackProvider, RkOverlayHost } from '@grest-ts/react';
import '@grest-ts/react/css/base.css';
import App from './App';
import './App.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorTrackerProvider>
      <OverlayStackProvider>
        <App />
        <RkOverlayHost position="top-right" />
      </OverlayStackProvider>
    </ErrorTrackerProvider>
  </StrictMode>,
);
