'use client'

import { useState } from 'react'
import { Plus, Search, MoreHorizontal, Edit3, Copy, Trash2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  icon: string
  reward: number
  type: string
  validationMode: string
  status: string
  category: string
  participants: number
  maxParticipants: number | null
  createdAt: string
}

const mockTasks: Task[] = [
  { id: '1', title: 'Rejoindre notre canal', icon: '📢', reward: 0.10, type: 'JOIN_CHANNEL', validationMode: 'AUTO', status: 'ACTIVE', category: 'Réseaux sociaux', participants: 1234, maxParticipants: null, createdAt: '2024-01-10' },
  { id: '2', title: "S'inscrire sur 26KADO", icon: '📝', reward: 0.50, type: 'REGISTER_26KADO', validationMode: 'AUTO', status: 'ACTIVE', category: 'Inscriptions', participants: 567, maxParticipants: 1000, createdAt: '2024-01-12' },
  { id: '3', title: 'Regarder une vidéo', icon: '🎬', reward: 0.05, type: 'WATCH_VIDEO', validationMode: 'MANUAL', status: 'ACTIVE', category: 'Vidéos', participants: 3421, maxParticipants: null, createdAt: '2024-01-14' },
  { id: '4', title: 'Visiter notre site', icon: '🌐', reward: 0.03, type: 'VISIT_WEBSITE', validationMode: 'AUTO', status: 'ACTIVE', category: 'Visites', participants: 5678, maxParticipants: null, createdAt: '2024-01-15' },
  { id: '5', title: 'Inviter 5 amis', icon: '👥', reward: 1.00, type: 'INVITE_FRIENDS', validationMode: 'AUTO', status: 'DRAFT', category: 'Parrainage', participants: 0, maxParticipants: 100, createdAt: '2024-01-16' },
]

export default function TasksPage() {
  const [tasks] = useState<Task[]>(mockTasks)
  const [search, setSearch] = useState('')

  const filtered = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tâches</h1>
          <p className="text-sm text-gray-500">{filtered.length} tâches</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nouvelle tâche
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher une tâche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid gap-4">
        {filtered.map((task) => (
          <div key={task.id} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                  {task.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-sm font-medium text-green-600">
                      {task.reward.toFixed(2)} €
                    </span>
                    <span className="text-sm text-gray-500">{task.type.replace('_', ' ')}</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      task.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status === 'ACTIVE' ? 'Active' : 'Brouillon'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {task.category} · {task.participants}/{task.maxParticipants || '∞'} participants
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600" title="Modifier">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-green-600" title="Dupliquer">
                  <Copy className="h-4 w-4" />
                </button>
                <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600" title="Supprimer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}