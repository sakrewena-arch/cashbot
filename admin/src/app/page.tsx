'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Target,
  Wallet,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Types
interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalTasks: number
  totalTransactions: number
  totalWithdrawals: number
  pendingWithdrawals: number
  recentUsers: Array<{
    username: string
    firstName: string
    balance: number
    createdAt: string
  }>
}

// Statistiques mockées pour le développement
const mockStats: DashboardStats = {
  totalUsers: 15234,
  activeUsers: 8921,
  totalTasks: 45,
  totalTransactions: 89234,
  totalWithdrawals: 1234,
  pendingWithdrawals: 23,
  recentUsers: [
    { username: 'jean_dupont', firstName: 'Jean', balance: 12.50, createdAt: '2024-01-15T10:30:00Z' },
    { username: 'marie_l', firstName: 'Marie', balance: 8.75, createdAt: '2024-01-15T09:15:00Z' },
    { username: 'paul_d', firstName: 'Paul', balance: 25.00, createdAt: '2024-01-15T08:45:00Z' },
    { username: 'sophie_m', firstName: 'Sophie', balance: 3.20, createdAt: '2024-01-14T18:20:00Z' },
    { username: 'lucas_b', firstName: 'Lucas', balance: 15.80, createdAt: '2024-01-14T16:00:00Z' },
  ],
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger les stats depuis l'API
    async function loadStats() {
      try {
        const response = await fetch('/api/stats', {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
          },
        })
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          // Utiliser les données mockées en développement
          setStats(mockStats)
        }
      } catch {
        setStats(mockStats)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!stats) {
    return <div>Erreur de chargement</div>
  }

  const statCards = [
    {
      title: 'Utilisateurs totaux',
      value: stats.totalUsers.toLocaleString('fr-FR'),
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Utilisateurs actifs',
      value: stats.activeUsers.toLocaleString('fr-FR'),
      icon: Activity,
      color: 'bg-green-500',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Tâches actives',
      value: stats.totalTasks.toString(),
      icon: Target,
      color: 'bg-purple-500',
      trend: '+3',
      trendUp: true,
    },
    {
      title: 'Retraits en attente',
      value: stats.pendingWithdrawals.toString(),
      icon: Wallet,
      color: 'bg-orange-500',
      trend: stats.pendingWithdrawals > 10 ? 'Attention' : 'OK',
      trendUp: false,
    },
  ]

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500">
          Bienvenue sur le panneau d'administration Cashbot
        </p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg ${card.color} p-3`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  card.trendUp ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {card.trendUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {card.trend}
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Deux colonnes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Derniers utilisateurs */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold text-gray-900">Derniers inscrits</h2>
          </div>
          <div className="divide-y">
            {stats.recentUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-medium text-primary">
                      {user.firstName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName}
                    </p>
                    <p className="text-xs text-gray-500">
                      @{user.username || 'pas de pseudo'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(user.balance)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t px-6 py-3">
            <button className="text-sm font-medium text-primary hover:text-primary/80">
              Voir tous les utilisateurs →
            </button>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold text-gray-900">Actions rapides</h2>
          </div>
          <div className="space-y-2 p-6">
            <button className="flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50">
              <div className="rounded-lg bg-green-100 p-2">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Nouvelle tâche</p>
                <p className="text-xs text-gray-500">Créer une tâche personnalisée</p>
              </div>
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50">
              <div className="rounded-lg bg-blue-100 p-2">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Traiter les retraits
                </p>
                <p className="text-xs text-gray-500">
                  {stats.pendingWithdrawals} retraits en attente
                </p>
              </div>
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50">
              <div className="rounded-lg bg-purple-100 p-2">
                <ArrowUpDown className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Ajuster un solde
                </p>
                <p className="text-xs text-gray-500">
                  Modifier le solde d'un utilisateur
                </p>
              </div>
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50">
              <div className="rounded-lg bg-yellow-100 p-2">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Envoyer une annonce
                </p>
                <p className="text-xs text-gray-500">
                  Notifier tous les utilisateurs
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}