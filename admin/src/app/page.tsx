'use client'

import { useEffect, useState } from 'react'
import { Users, Target, Wallet, ArrowUpDown, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { api } from '@/lib/api'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(() => setStats({
        totalUsers: 0, activeUsers: 0, totalTasks: 0,
        totalTransactions: 0, totalWithdrawals: 0, pendingWithdrawals: 0,
        recentUsers: []
      }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )

  const cards = [
    { title: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { title: 'Actifs', value: stats.activeUsers, icon: Activity, color: 'bg-green-500' },
    { title: 'Tâches', value: stats.totalTasks, icon: Target, color: 'bg-purple-500' },
    { title: 'Retraits en attente', value: stats.pendingWithdrawals, icon: Wallet, color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-sm text-gray-500">Vue d'ensemble de Cashbot</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.title} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`rounded-lg ${c.color} p-3`}><c.icon className="h-5 w-5 text-white" /></div>
            </div>
            <p className="mt-4 text-2xl font-bold">{c.value}</p>
            <p className="text-sm text-gray-500">{c.title}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4"><h2 className="font-semibold">Actions rapides</h2></div>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <a href="/tasks" className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50">
            <div className="rounded-lg bg-green-100 p-2"><Target className="h-5 w-5 text-green-600" /></div>
            <div><p className="font-medium">Nouvelle tâche</p><p className="text-xs text-gray-500">Créer une tâche</p></div>
          </a>
          <a href="/withdrawals" className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50">
            <div className="rounded-lg bg-blue-100 p-2"><Wallet className="h-5 w-5 text-blue-600" /></div>
            <div><p className="font-medium">Retraits ({stats.pendingWithdrawals})</p><p className="text-xs text-gray-500">Traiter les demandes</p></div>
          </a>
          <a href="/promocodes" className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50">
            <div className="rounded-lg bg-yellow-100 p-2"><ArrowUpDown className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="font-medium">Codes promo</p><p className="text-xs text-gray-500">Gérer les codes</p></div>
          </a>
          <a href="/announcements" className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50">
            <div className="rounded-lg bg-purple-100 p-2"><Users className="h-5 w-5 text-purple-600" /></div>
            <div><p className="font-medium">Annonces</p><p className="text-xs text-gray-500">Notifier les utilisateurs</p></div>
          </a>
        </div>
      </div>
    </div>
  )
}