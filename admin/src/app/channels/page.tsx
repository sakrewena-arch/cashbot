'use client'

import { useState, useEffect } from 'react'
import { Link2, Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/toast'

export default function ChannelsPage() {
  const { showToast } = useToast()
  const [channels, setChannels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ channelId: '', channelName: '', channelUrl: '' })

  const load = () => {
    setLoading(true)
    api.getChannels().then(setChannels).catch(() => setChannels([])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.channelId || !form.channelName) {
      showToast('error', '❌ Remplis tous les champs obligatoires')
      return
    }
    try {
      await api.createChannel(form)
      setShowForm(false)
      setForm({ channelId: '', channelName: '', channelUrl: '' })
      load()
      showToast('success', '✅ Canal ajouté avec succès !')
    } catch (e: any) {
      showToast('error', `❌ ${e.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteChannel(id)
      load()
      showToast('success', '✅ Canal supprimé')
    } catch (e: any) {
      showToast('error', `❌ ${e.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Canaux obligatoires</h1><p className="text-sm text-gray-500">Canaux à rejoindre avant d'utiliser le bot</p></div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> {showForm ? 'Fermer' : 'Ajouter un canal'}
        </button>
      </div>

      {showForm && (
        <div className="max-w-lg rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <input type="text" placeholder="ID du canal (ex: -1001234567890) *" value={form.channelId}
            onChange={(e) => setForm({ ...form, channelId: e.target.value })}
            className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary" />
          <input type="text" placeholder="Nom du canal *" value={form.channelName}
            onChange={(e) => setForm({ ...form, channelName: e.target.value })}
            className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary" />
          <input type="text" placeholder="URL du canal" value={form.channelUrl}
            onChange={(e) => setForm({ ...form, channelUrl: e.target.value })}
            className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary" />
          <button onClick={handleCreate} disabled={!form.channelId || !form.channelName}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            Ajouter
          </button>
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Chargement...</div>
        ) : channels.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Aucun canal. Ajoutez-en un !</div>
        ) : (
          <div className="divide-y">
            {channels.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2"><Link2 className="h-4 w-4 text-blue-600" /></div>
                  <div>
                    <p className="text-sm font-medium">{c.channelName}</p>
                    <p className="text-xs text-gray-500">{c.channelId} · {c.channelUrl}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}