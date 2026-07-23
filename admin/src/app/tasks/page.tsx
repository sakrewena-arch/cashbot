'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit3, Copy, Trash2, X } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function TasksPage() {
  const { showToast } = useToast()
  const [tasks, setTasks] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', instructions: '', icon: '🎯',
    reward: 0, type: 'JOIN_CHANNEL', validationMode: 'AUTO',
    proofType: '', linkUrl: '', maxPerUser: 1, maxParticipants: 0,
  })

  const load = () => {
    setLoading(true)
    api.getTasks('?limit=100')
      .then((d: any) => setTasks(d.data || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    try {
      await api.createTask({ ...form, status: 'ACTIVE', createdById: 'admin' })
      setShowForm(false)
      setForm({ title: '', description: '', instructions: '', icon: '🎯', reward: 0, type: 'JOIN_CHANNEL', validationMode: 'AUTO', proofType: '', linkUrl: '', maxPerUser: 1, maxParticipants: 0 })
      load()
      showToast('success', '✅ Tâche créée avec succès !')
    } catch (e) {
      showToast('error', '❌ Erreur lors de la création')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette tâche ?')) {
      await api.deleteTask(id)
      load()
    }
  }

  const filtered = tasks.filter((t: any) => t.title?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Tâches</h1><p className="text-sm text-gray-500">{tasks.length} tâches</p></div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nouvelle tâche
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Créer une nouvelle tâche</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Titre *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary" placeholder="Ex: Rejoindre notre canal" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icône</label>
              <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary" placeholder="🎯" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary">
                <option value="JOIN_CHANNEL">Rejoindre un canal</option>
                <option value="JOIN_GROUP">Rejoindre un groupe</option>
                <option value="VISIT_WEBSITE">Visiter un site</option>
                <option value="WATCH_VIDEO">Regarder une vidéo</option>
                <option value="INVITE_FRIENDS">Inviter des amis</option>
                <option value="CUSTOM_MISSION">Mission personnalisée</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Validation</label>
              <select value={form.validationMode} onChange={(e) => setForm({ ...form, validationMode: e.target.value })}
                className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary">
                <option value="AUTO">Automatique</option>
                <option value="MANUAL">Manuelle (preuve)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Récompense (€) *</label>
              <input type="number" step="0.01" value={form.reward} onChange={(e) => setForm({ ...form, reward: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lien (optionnel)</label>
              <input type="text" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary" placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Instructions</label>
              <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={3}
                className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <button onClick={handleCreate} disabled={!form.title || form.reward <= 0}
            className="mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            Créer la tâche
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary" />
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">Aucune tâche. Cliquez sur "Nouvelle tâche" pour en créer une !</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((task: any) => (
            <div key={task.id} className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">{task.icon || '🎯'}</div>
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <div className="mt-1 flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-medium text-green-600">{formatCurrency(task.reward)}</span>
                      <span className="text-sm text-gray-500">{task.type?.replace(/_/g, ' ')}</span>
                      <span className="text-sm text-gray-500">· {task.validationMode === 'AUTO' ? 'Auto' : 'Manuel'}</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(task.status)}`}>{getStatusLabel(task.status)}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {task.category?.name || 'Sans catégorie'} · {task.currentParticipants}/{task.maxParticipants || '∞'} participants
                    </div>
                    {task.description && <p className="mt-2 text-sm text-gray-600">{task.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600"><Edit3 className="h-4 w-4" /></button>
                  <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-green-600"><Copy className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(task.id)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}