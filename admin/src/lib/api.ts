// ============================================================
// CASHBOT - Client API (fonctionne en static & dev)
// ============================================================

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // En développement Next.js (port 3000), on doit appeler le port 3001
  // En production (servi par Express), l'URL relative suffit
  const base = typeof window !== 'undefined' && window.location.port === '3000'
    ? 'http://localhost:3001'
    : ''

  const res = await fetch(`${base}/api${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`)
  return data
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
}