// Configuração centralizada da API
export const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

// Helper para fazer requisições com autenticação
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  return fetch(url, {
    ...options,
    headers
  });
};
