'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, RefreshCw, Copy, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [adminComment, setAdminComment] = useState('')
  const [revealedIds, setRevealedIds] = useState<string[]>([])

  const load = () => {
    setLoading(true)
    const params = filter === 'all' ? '' : `?status=${filter.toUpperCase()}`
    api.getWithdrawals(params)
      .then((d: any) => setWithdrawals(d.data || []))
      .catch(() => setWithdrawals([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const handleProcess = async (id: string, status: string) => {
    try {
      await api.processWithdrawal(id, { status, adminComment, processedById: 'admin' })
      setShowModal(false)
      setSelected(null)
      setAdminComment('')
      load()
    } catch (e) {
      alert('Erreur lors du traitement')
    }
  }

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const getMethodIcon = (method: string) => {
    const icons: Record<string, string> = { MOBILE_MONEY: '📱', CRYPTO: '₿', PAYPAL: '💰', BANK_TRANSFER: '🏦' }
    return icons[method] || '💳'
  }

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = { MOBILE_MONEY: 'Mobile Money', CRYPTO: 'Crypto', PAYPAL: 'PayPal', BANK_TRANSFER: 'Virement bancaire' }
    return labels[method] || method
  }

  const pendingCount = withdrawals.filter((w: any) => w.status === 'PENDING').length
  const processingCount = withdrawals.filter((w: any) => w.status === 'PROCESSING').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Retraits</h1>
          <p className="text-sm text-gray-500">{pendingCount} en attente · {processingCount} en cours</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-gray-500">En attente</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{processingCount}</p>
          <p className="text-sm text-gray-500">En cours</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{withdrawals.filter((w: any) => w.status === 'COMPLETED').length}</p>
          <p className="text-sm text-gray-500">Effectués</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'processing', 'completed', 'failed'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${filter === f ? 'bg-primary text-white' : 'border bg-white text-gray-600 hover:bg-gray-50'}`}>
            {f === 'all' ? 'Tous' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">Chargement...</div>
      ) : withdrawals.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">Aucun retrait</div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((w: any) => {
            let accountDetails: any[] = []
            try { accountDetails = JSON.parse(w.accountInfo || '{}') } catch {}
            const details = Array.isArray(accountDetails) ? accountDetails : 
              Object.entries(accountDetails).map(([k, v]) => ({ label: k, value: v }))
            const isRevealed = revealedIds.includes(w.id)

            return (
              <div key={w.id} className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg">{getMethodIcon(w.method)}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{w.user?.firstName || 'Utilisateur'} {w.user?.lastName || ''}</h3>
                              {w.user?.username && <span className="text-xs text-gray-400">@{w.user.username}</span>}
                            </div>
                            <p className="text-sm text-gray-500">{getMethodLabel(w.method)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{formatCurrency(w.amount)}</p>
                          {w.fee > 0 && <p className="text-xs text-gray-400">Frais: {formatCurrency(w.fee)}</p>}
                        </div>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700">📋 Coordonnées</h4>
                          <button onClick={() => toggleReveal(w.id)} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                            {isRevealed ? <><EyeOff className="h-3 w-3" /> Masquer</> : <><Eye className="h-3 w-3" /> Afficher</>}
                          </button>
                        </div>
                        {isRevealed ? (
                          <div className="space-y-2">
                            {details.map((d: any, i: number) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">{d.label || d.type}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-medium">{String(d.value)}</span>
                                  <button onClick={() => navigator.clipboard.writeText(String(d.value))} className="text-gray-400 hover:text-gray-600">
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">Cliquez sur "Afficher" pour voir les coordonnées</p>
                        )}
                      </div>

                      {w.adminComment && <div className="text-sm text-gray-500 italic">💬 {w.adminComment}</div>}

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">{formatDate(w.createdAt)}</p>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(w.status)}`}>{getStatusLabel(w.status)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 border-t pt-4">
                    {w.status === 'PENDING' && (
                      <>
                        <button onClick={() => { setSelected(w); setShowModal(true) }}
                          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                          <RefreshCw className="h-4 w-4" /> Traiter
                        </button>
                        <button onClick={() => handleProcess(w.id, 'FAILED')}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                          <XCircle className="h-4 w-4" /> Refuser
                        </button>
                      </>
                    )}
                    {w.status === 'PROCESSING' && (
                      <button onClick={() => handleProcess(w.id, 'COMPLETED')}
                        className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                        <CheckCircle className="h-4 w-4" /> Confirmer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">Traiter le retrait</h2>
            <p className="mt-1 text-sm text-gray-500">{selected.user?.firstName} · {formatCurrency(selected.amount)} · {getMethodLabel(selected.method)}</p>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Commentaire :</label>
              <textarea value={adminComment} onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Ex: Transfert effectué - Ref: VIRE123456..."
                className="w-full rounded-lg border p-3 text-sm outline-none focus:border-primary" rows={3} />
            </div>
            <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
              <strong>💡 Important :</strong> Effectue d'abord le transfert depuis ton compte personnel, puis confirme ici.
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => handleProcess(selected.id, 'PROCESSING')}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                ✅ Marquer en cours
              </button>
              <button onClick={() => setShowModal(false)}
                className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}