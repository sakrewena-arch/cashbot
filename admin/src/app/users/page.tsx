'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, MoreHorizontal, Filter, Download } from 'lucide-react'

interface User {
  id: string
  telegramId: string
  username: string
  firstName: string
  lastName: string
  balance: number
  totalEarned: number
  referralCount: number
  status: string
  createdAt: string
}

const mockUsers: User[] = Array.from({ length: 25 }, (_, i) => ({
  id: `user_${i}`,
  telegramId: String(1000000000 + i),
  username: `user_${i}`,
  firstName: ['Jean', 'Marie', 'Paul', 'Sophie', 'Lucas', 'Emma', 'Léo', 'Chloé'][i % 8],
  lastName: ['Dupont', 'Martin', 'Bernard', 'Petit', 'Robert', 'Richard', 'Durand', 'Moreau'][i % 8],
  balance: Math.random() * 50,
  totalEarned: Math.random() * 200,
  referralCount: Math.floor(Math.random() * 15),
  status: Math.random() > 0.2 ? 'ACTIVE' : 'BLOCKED',
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
}))

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  const filtered = users.filter(u => 
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500">{filtered.length} utilisateurs</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filtres
          </button>
          <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Tableau */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Telegram ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Solde</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Gagné</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Filleuls</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Inscrit le</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-medium text-primary">
                          {user.firstName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.telegramId}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {user.balance.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.totalEarned.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.referralCount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      user.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status === 'ACTIVE' ? 'Actif' : 'Bloqué'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-6 py-3">
          <p className="text-sm text-gray-500">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              ← Précédent
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Suivant →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}