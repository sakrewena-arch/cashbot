'use client'

import { useState } from 'react'
import { Search, CheckCircle, XCircle, RefreshCw, ExternalLink, Copy, Eye, EyeOff } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Withdrawal {
  id: string
  user: string
  userId: string
  amount: number
  fee: number
  method: string
  accountInfo: string
  accountDetails: {
    type: string
    label: string
    value: string
  }[]
  status: string
  adminComment: string
  createdAt: string
  telegramUsername?: string
}

const mockWithdrawals: Withdrawal[] = [
  {
    id: '1', user: 'Jean Dupont', userId: 'user_1', amount: 15.00, fee: 0.30,
    method: 'MOBILE_MONEY', status: 'PENDING',
    accountInfo: 'Orange Money: +225 01 02 03 04 05',
    adminComment: '',
    createdAt: '2024-01-15T10:30:00Z',
    telegramUsername: 'jean_dupont',
    accountDetails: [
      { type: 'operator', label: 'Opérateur', value: 'Orange Money' },
      { type: 'phone', label: 'Numéro', value: '+225 01 02 03 04 05' },
      { type: 'name', label: 'Nom du compte', value: 'Jean Dupont' },
    ]
  },
  {
    id: '2', user: 'Marie Martin', userId: 'user_2', amount: 25.50, fee: 0.51,
    method: 'CRYPTO', status: 'PENDING',
    accountInfo: 'USDT (TRC20)',
    adminComment: '',
    createdAt: '2024-01-15T09:15:00Z',
    telegramUsername: 'marie_l',
    accountDetails: [
      { type: 'network', label: 'Réseau', value: 'TRC20' },
      { type: 'currency', label: 'Cryptomonnaie', value: 'USDT' },
      { type: 'address', label: 'Adresse wallet', value: 'TYx8H3k9Jm2N5pQr7Wv1Bc4Df6Gh8Jk0Lm' },
    ]
  },
  {
    id: '3', user: 'Paul Bernard', userId: 'user_3', amount: 10.00, fee: 0.20,
    method: 'PAYPAL', status: 'PROCESSING',
    accountInfo: 'paul@email.com',
    adminComment: 'En attente de confirmation',
    createdAt: '2024-01-14T18:20:00Z',
    telegramUsername: 'paul_d',
    accountDetails: [
      { type: 'email', label: 'Email PayPal', value: 'paul.bernard@email.com' },
      { type: 'name', label: 'Nom du compte', value: 'Paul Bernard' },
    ]
  },
  {
    id: '4', user: 'Sophie Petit', userId: 'user_4', amount: 50.00, fee: 1.00,
    method: 'BANK_TRANSFER', status: 'COMPLETED',
    accountInfo: 'Virement bancaire',
    adminComment: 'Transfert effectué le 15/01/2024 - Ref: VIRE123456',
    createdAt: '2024-01-13T16:00:00Z',
    telegramUsername: 'sophie_m',
    accountDetails: [
      { type: 'bank', label: 'Banque', value: 'Société Générale' },
      { type: 'iban', label: 'IBAN', value: 'FR76 1234 5678 9012 3456 7890 123' },
      { type: 'bic', label: 'BIC/SWIFT', value: 'SOGEFRPP' },
      { type: 'name', label: 'Titulaire', value: 'Sophie Petit' },
    ]
  },
  {
    id: '5', user: 'Lucas Robert', userId: 'user_5', amount: 8.75, fee: 0.18,
    method: 'MOBILE_MONEY', status: 'FAILED',
    accountInfo: 'MTN: +225 05 06 07 08 09',
    adminComment: 'Numéro invalide - contacter le support',
    createdAt: '2024-01-12T14:45:00Z',
    telegramUsername: 'lucas_b',
    accountDetails: [
      { type: 'operator', label: 'Opérateur', value: 'MTN Mobile Money' },
      { type: 'phone', label: 'Numéro', value: '+225 05 06 07 08 09' },
      { type: 'name', label: 'Nom du compte', value: 'Lucas Robert' },
    ]
  },
]

export default function WithdrawalsPage() {
  const [withdrawals] = useState<Withdrawal[]>(mockWithdrawals)
  const [filter, setFilter] = useState('all')
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [adminComment, setAdminComment] = useState('')
  const [revealedIds, setRevealedIds] = useState<string[]>([])

  const filtered = filter === 'all' 
    ? withdrawals 
    : withdrawals.filter(w => w.status === filter.toUpperCase())

  const pendingCount = withdrawals.filter(w => w.status === 'PENDING').length
  const processingCount = withdrawals.filter(w => w.status === 'PROCESSING').length

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
    }
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      PROCESSING: 'En cours',
      COMPLETED: 'Effectué',
      FAILED: 'Échoué',
    }
    return { style: styles[status] || 'bg-gray-100', label: labels[status] || status }
  }

  const getMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      MOBILE_MONEY: '📱',
      CRYPTO: '₿',
      PAYPAL: '💰',
      BANK_TRANSFER: '🏦',
    }
    return icons[method] || '💳'
  }

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      MOBILE_MONEY: 'Mobile Money',
      CRYPTO: 'Crypto',
      PAYPAL: 'PayPal',
      BANK_TRANSFER: 'Virement bancaire',
    }
    return labels[method] || method
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleProcess = (withdrawal: Withdrawal, newStatus: string) => {
    // Logique pour traiter le retrait
    setSelectedWithdrawal(null)
    setShowModal(false)
    setAdminComment('')
  }

  const openProcessModal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setAdminComment(withdrawal.adminComment || '')
    setShowModal(true)
  }

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Retraits</h1>
          <p className="text-sm text-gray-500">
            {pendingCount} en attente · {processingCount} en cours de traitement
          </p>
        </div>
      </div>

      {/* Statistiques rapides */}
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
          <p className="text-2xl font-bold text-green-600">
            {withdrawals.filter(w => w.status === 'COMPLETED').length}
          </p>
          <p className="text-sm text-gray-500">Effectués</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'pending', label: 'En attente' },
          { key: 'processing', label: 'En cours' },
          { key: 'completed', label: 'Effectués' },
          { key: 'failed', label: 'Échoués' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.key 
                ? 'bg-primary text-white' 
                : 'border bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste des retraits */}
      <div className="space-y-4">
        {filtered.map((w) => {
          const badge = getStatusBadge(w.status)
          const isRevealed = revealedIds.includes(w.id)
          
          return (
            <div key={w.id} className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    {/* En-tête avec utilisateur et montant */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg">
                          {getMethodIcon(w.method)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{w.user}</h3>
                            {w.telegramUsername && (
                              <span className="text-xs text-gray-400">@{w.telegramUsername}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{getMethodLabel(w.method)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(w.amount)}</p>
                        <p className="text-xs text-gray-400">Frais: {formatCurrency(w.fee)}</p>
                      </div>
                    </div>

                    {/* Coordonnées de paiement (visibles seulement si dévoilé) */}
                    <div className="rounded-lg bg-gray-50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">
                          📋 Coordonnées de paiement
                        </h4>
                        <button
                          onClick={() => toggleReveal(w.id)}
                          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                        >
                          {isRevealed ? (
                            <><EyeOff className="h-3 w-3" /> Masquer</>
                          ) : (
                            <><Eye className="h-3 w-3" /> Afficher</>
                          )}
                        </button>
                      </div>
                      
                      {isRevealed ? (
                        <div className="space-y-2">
                          {w.accountDetails.map((detail, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">{detail.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium text-gray-900">
                                  {detail.value}
                                </span>
                                <button
                                  onClick={() => handleCopy(detail.value)}
                                  className="text-gray-400 hover:text-gray-600"
                                  title="Copier"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">
                          Cliquez sur "Afficher" pour voir les coordonnées bancaires
                        </p>
                      )}
                    </div>

                    {/* Commentaire admin */}
                    {w.adminComment && (
                      <div className="text-sm text-gray-500 italic">
                        💬 {w.adminComment}
                      </div>
                    )}

                    {/* Date */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        {new Date(w.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${badge.style}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2 border-t pt-4">
                  {w.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => openProcessModal(w)}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Traiter le paiement
                      </button>
                      <button className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                        <XCircle className="h-4 w-4" />
                        Refuser
                      </button>
                    </>
                  )}
                  {w.status === 'PROCESSING' && (
                    <button
                      onClick={() => openProcessModal(w)}
                      className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Confirmer le paiement
                    </button>
                  )}
                  <button className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                    <ExternalLink className="h-4 w-4" />
                    Voir le profil
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de traitement */}
      {showModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">
              Traiter le retrait
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {selectedWithdrawal.user} · {formatCurrency(selectedWithdrawal.amount)} · {getMethodLabel(selectedWithdrawal.method)}
            </p>

            {/* Coordonnées de paiement */}
            <div className="mt-4 rounded-lg bg-blue-50 p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-3">
                📋 Coordonnées pour effectuer le virement :
              </h3>
              <div className="space-y-2">
                {selectedWithdrawal.accountDetails.map((detail, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-blue-600">{detail.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-blue-900">{detail.value}</span>
                      <button
                        onClick={() => handleCopy(detail.value)}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commentaire */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commentaire (optionnel) :
              </label>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Ex: Transfert effectué - Ref: VIRE123456..."
                className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                rows={3}
              />
            </div>

            {/* Instructions */}
            <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
              <strong>💡 Important :</strong> Effectue d'abord le transfert depuis ton compte 
              personnel (Orange Money, Binance, PayPal...), puis confirme ici.
            </div>

            {/* Boutons d'action */}
            <div className="mt-6 flex gap-3">
              {selectedWithdrawal.status === 'PENDING' && (
                <button
                  onClick={() => handleProcess(selectedWithdrawal, 'PROCESSING')}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  ✅ J'ai effectué le transfert, marquer en cours
                </button>
              )}
              {selectedWithdrawal.status === 'PROCESSING' && (
                <button
                  onClick={() => handleProcess(selectedWithdrawal, 'COMPLETED')}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
                >
                  ✅ Confirmer le paiement
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}