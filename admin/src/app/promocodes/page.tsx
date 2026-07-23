'use client'

import { useState, useEffect } from 'react'
import { Ticket, Plus } from 'lucide-react'
import { api } from '@/lib/api'

export default function PromoCodesPage() {
  const [codes, setCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', reward: 0, maxUses: 100, description: '' })

  const load = () => {
    setLoading(true)
    api.getPromoCodes().then(setCodes).catch(() => setCodes([])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    await api.createPromoCode(form)
    setShowForm(false)
    setForm({ code: '', reward: 0, maxUses: 100, description: '' })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Codes Promo</h1><p className="text-sm text-gray-500">{codes.length} codes</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nouveau code
        </button>
      </div>

      {showForm && (
        <div className="max-w-lg rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <input type="text" placeholder="Code (ex: WELCOME10)" value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary" />
          <input type="number" step="0.01" placeholder="Récompense (€)" value={form.reward}
            onChange={(e) => setForm({ ...form, reward: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary" />
          <input type="number" placeholder="Utilisations max" value={form.maxUses}
            onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 1 })}
            className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary" />
          <input type="text" placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary" />
          <button onClick={handleCreate} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">Créer</button>
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Chargement...</div>
        ) : codes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Aucun code promo</div>
        ) : (
          <div className="divide-y">
            {codes.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-yellow-100 p-2"><Ticket className="h-4 w-4 text-yellow-600" /></div>
                  <div>
                    <p className="text-sm font-medium">{c.code} <span className="text-green-600">({c.reward} €)</span></p>
                    <p className="text-xs text-gray-500">{c.description || 'Aucune description'} · {c.currentUses}/{c.maxUses} utilisations</p>
                  </div>
                </div>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {c.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}