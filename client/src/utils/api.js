const API_BASE = 'http://localhost:5555/api';

export async function apiFetch(endpoint, options = {}) {
  // Check both possible local storage keys so it never misses
  const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');

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
    console.warn("Unauthorized! Token may be missing or expired. Redirecting to login...");
    // Optional: clear bad token and redirect
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'API request failed');
  }

  return response.json();
}