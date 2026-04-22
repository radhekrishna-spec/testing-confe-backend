const isDev = import.meta.env.DEV;

export const API_BASE = isDev
  ? 'http://localhost:3008'
  : 'https://testing-confe-backend.onrender.com';
