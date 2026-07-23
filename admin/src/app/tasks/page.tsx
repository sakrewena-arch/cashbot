'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit3, Copy, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getTasks('?limit=100')
      .then((d: any) => setTasks(d.data || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = tasks.filter((t: any) => t.title?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Tâches</h1><p className="text-sm text-gray-500">{tasks.length} tâches</p></div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nouvelle tâche
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary" />
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">Aucune tâche. Créez-en une !</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((task: any) => (
            <div key={task.id} className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">{task.icon || '🎯'}</div>
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-sm font-medium text-green-600">{formatCurrency(task.reward)}</span>
                      <span className="text-sm text-gray-500">{task.type?.replace(/_/g, ' ')}</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(task.status)}`}>{getStatusLabel(task.status)}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {task.category?.name || 'Sans catégorie'} · {task.currentParticipants}/{task.maxParticipants || '∞'} participants
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600"><Edit3 className="h-4 w-4" /></button>
                  <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-green-600"><Copy className="h-4 w-4" /></button>
                  <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}