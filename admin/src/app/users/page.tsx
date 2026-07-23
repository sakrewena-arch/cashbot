'use client'

import { useState, useEffect } from 'react'
import { Search, MoreHorizontal } from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency, getStatusLabel, getStatusColor } from '@/lib/utils'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const perPage = 10

  useEffect(() => {
    setLoading(true)
    api.getUsers(`?page=${page}&limit=${perPage}&search=${search}`)
      .then((data: any) => { setUsers(data.data || []); setTotal(data.pagination?.total || 0) })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [page, search])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <p className="text-sm text-gray-500">{total} utilisateurs</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Rechercher..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary" />
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Telegram ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Solde</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Filleuls</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Inscrit</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Chargement...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucun utilisateur</td></tr>
            ) : users.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-medium text-primary">{(u.firstName || '?').charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.firstName || ''} {u.lastName || ''}</p>
                      <p className="text-xs text-gray-500">@{u.username || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{u.telegramId}</td>
                <td className="px-6 py-4 text-sm font-medium">{formatCurrency(u.balance || 0)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{u.referralCount || 0}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(u.status)}`}>{getStatusLabel(u.status)}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-3">
            <p className="text-sm text-gray-500">Page {page} sur {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">← Précédent</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Suivant →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}