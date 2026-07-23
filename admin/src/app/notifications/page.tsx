'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function NotificationsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTransactions('?limit=20')
      .then((d: any) => setData(d.data || []))
      .catch(() => [])
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-sm text-gray-500">Historique des activités</p></div>
      </div>
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="divide-y">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Chargement...</div>
          ) : data.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Aucune activité récente</div>
          ) : data.slice(0, 20).map((t: any) => (
            <div key={t.id} className="flex items-start gap-4 p-4">
              <div className="rounded-full bg-blue-100 p-2"><Bell className="h-4 w-4 text-blue-600" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{t.type} - {t.description || 'Transaction'}</p>
                <p className="text-xs text-gray-500">{formatDate(t.createdAt)} · {t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)} €</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}