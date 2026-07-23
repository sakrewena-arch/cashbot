'use client'

import { useState, useEffect } from 'react'
import { Megaphone, Send } from 'lucide-react'
import { api } from '@/lib/api'

export default function AnnouncementsPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState('')

  const handleSend = async () => {
    if (!title || !message) return
    setSending(true)
    try {
      await api.createAnnouncement({ title, message, priority: 0 })
      setStatus('✅ Annonce envoyée avec succès !')
      setTitle('')
      setMessage('')
    } catch {
      setStatus('❌ Erreur lors de l\'envoi')
    }
    setSending(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Annonces</h1><p className="text-sm text-gray-500">Envoyer une annonce à tous les utilisateurs</p></div>
      </div>
      <div className="max-w-2xl rounded-xl border bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary" placeholder="Ex: Nouvelle tâche disponible !" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5}
              className="w-full rounded-lg border p-2.5 text-sm outline-none focus:border-primary" placeholder="Écris ton message ici..." />
          </div>
          <button onClick={handleSend} disabled={sending || !title || !message}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            <Send className="h-4 w-4" /> {sending ? 'Envoi...' : 'Envoyer l\'annonce'}
          </button>
          {status && <p className="text-sm">{status}</p>}
        </div>
      </div>
    </div>
  )
}