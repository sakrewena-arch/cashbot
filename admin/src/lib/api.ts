// ============================================================
// CASHBOT - Client API pour le tableau de bord
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}/api${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data;
}

export const api = {
  getStats: () => fetchAPI('/stats'),
  getUsers: (params?: string) => fetchAPI(`/users${params || ''}`),
  getUser: (id: string) => fetchAPI(`/users/telegram/${id}`),
  getTasks: (params?: string) => fetchAPI(`/tasks${params || ''}`),
  createTask: (data: any) => fetchAPI('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) => fetchAPI(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id: string) => fetchAPI(`/tasks/${id}`, { method: 'DELETE' }),
  getCategories: () => fetchAPI('/categories'),
  getTransactions: (params?: string) => fetchAPI(`/transactions${params || ''}`),
  getWithdrawals: (params?: string) => fetchAPI(`/withdrawals${params || ''}`),
  processWithdrawal: (id: string, data: any) => fetchAPI(`/withdrawals/${id}/process`, { method: 'PUT', body: JSON.stringify(data) }),
  getChannels: () => fetchAPI('/channels'),
  createChannel: (data: any) => fetchAPI('/channels', { method: 'POST', body: JSON.stringify(data) }),
  deleteChannel: (id: string) => fetchAPI(`/channels/${id}`, { method: 'DELETE' }),
  getPromoCodes: () => fetchAPI('/promocodes'),
  createPromoCode: (data: any) => fetchAPI('/promocodes', { method: 'POST', body: JSON.stringify(data) }),
  createAnnouncement: (data: any) => fetchAPI('/announcements', { method: 'POST', body: JSON.stringify(data) }),
};