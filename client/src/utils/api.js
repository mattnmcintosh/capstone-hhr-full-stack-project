const API_BASE = 'http://localhost:5555/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('jwt_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return null; // No content for deletes
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'API request failed');
  
  return data;
}