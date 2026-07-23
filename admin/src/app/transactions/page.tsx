'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { formatCurrency, getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'

export default function TransactionsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTransactions('?limit=50')
      .then((d: any) => setData(d.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Chargement...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucune transaction</td></tr>
            ) : data.map((t: any) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(t.createdAt)}</td>
                <td className="px-6 py-4 text-sm">{t.user?.firstName || 'N/A'}</td>
                <td className="px-6 py-4 text-sm">{t.type}</td>
                <td className={`px-6 py-4 text-sm font-medium text-right ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                </td>
                <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(t.status)}`}>{getStatusLabel(t.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}