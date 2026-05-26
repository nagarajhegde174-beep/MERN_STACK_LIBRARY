import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './index.css'
import App from './App.jsx';

// ── Stale token cleanup ──────────────────────────────────
// Tokens signed before the admin-id fix don't have an `id` field.
// Clear them so the user is forced to re-login cleanly.
try {
  const token = localStorage.getItem('authToken');
  if (token) {
    const decoded = jwtDecode(token);
    if (!decoded?.id) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('role');
      console.warn('[Auth] Stale token detected (no id) — cleared. Please log in again.');
    }
  }
} catch {
  localStorage.removeItem('authToken');
  localStorage.removeItem('role');
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
  </StrictMode>
)   
