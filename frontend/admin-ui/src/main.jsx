import axios from 'axios';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

axios.defaults.withCredentials = true;
const originalFetch = window.fetch;

window.fetch = (url, options = {}) => {
  return originalFetch(url, {
    credentials: 'include',
    ...options,
  });
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
