const API_BASE = 'http://localhost:5555/api';

// In client/src/utils/api.js
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('jwt_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`http://localhost:5555/api${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // 🛡️ STALE LOGIN FIX: Automatically clear storage and force a hard reload to login
    localStorage.removeItem('user');
    localStorage.removeItem('jwt_token');
    window.location.href = '/'; // Forces App.jsx to re-evaluate currentUser as null
    throw new Error('Session expired. Unauthorized.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'API request failed');
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}