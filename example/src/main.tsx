import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorTrackerProvider, RkOverlayHost } from '@grest-ts/react';
import { Router, RouterProvider } from '@grest-ts/react/router';
import '@grest-ts/react/css/base.css';
import App from './App';
import './App.css';

const router = new Router({}, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorTrackerProvider>
      <RouterProvider router={router}>
        <App />
        <RkOverlayHost position="top-right" />
      </RouterProvider>
    </ErrorTrackerProvider>
  </StrictMode>,
);
