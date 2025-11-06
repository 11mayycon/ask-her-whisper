const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async signup(email: string, password: string, full_name: string) {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getMe(token: string) {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Admin
  async getStats(token: string) {
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getAdmins(token: string) {
    const res = await fetch(`${API_URL}/admin/admins`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async createAdmin(token: string, data: any) {
    const res = await fetch(`${API_URL}/admin/admins`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async deleteAdmin(token: string, id: string) {
    const res = await fetch(`${API_URL}/admin/admins/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
