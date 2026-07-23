// ============================================================
// CASHBOT - Client API pour le tableau de bord
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_BASE}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export const api = {
  // Stats
  getStats: () => fetchAPI('/stats'),

  // Users
  getUsers: (params?: string) => fetchAPI(`/users${params || ''}`),
  getUser: (id: string) => fetchAPI(`/users/telegram/${id}`),

  // Tasks
  getTasks: (params?: string) => fetchAPI(`/tasks${params || ''}`),
  createTask: (data: any) => fetchAPI('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) => fetchAPI(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id: string) => fetchAPI(`/tasks/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => fetchAPI('/categories'),

  // Transactions
  getTransactions: (params?: string) => fetchAPI(`/transactions${params || ''}`),

  // Withdrawals
  getWithdrawals: (params?: string) => fetchAPI(`/withdrawals${params || ''}`),
  processWithdrawal: (id: string, data: any) => fetchAPI(`/withdrawals/${id}/process`, { method: 'PUT', body: JSON.stringify(data) }),

  // Channels
  getChannels: () => fetchAPI('/channels'),
  createChannel: (data: any) => fetchAPI('/channels', { method: 'POST', body: JSON.stringify(data) }),
  deleteChannel: (id: string) => fetchAPI(`/channels/${id}`, { method: 'DELETE' }),

  // Promo Codes
  getPromoCodes: () => fetchAPI('/promocodes'),
  createPromoCode: (data: any) => fetchAPI('/promocodes', { method: 'POST', body: JSON.stringify(data) }),

  // Announcements
  createAnnouncement: (data: any) => fetchAPI('/announcements', { method: 'POST', body: JSON.stringify(data) }),
};