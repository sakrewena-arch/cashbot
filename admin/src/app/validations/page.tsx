'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

export default function ValidationsPage() {
  const { showToast } = useToast()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.getTasks('?status=PENDING&limit=100')
      .then((d: any) => setData(d.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (completionId: string) => {
    try {
      await fetch('/api/validations/' + completionId + '/approve', { method: 'POST' })
      showToast('success', '✅ Preuve acceptée !')
      load()
    } catch {
      showToast('error', '❌ Erreur')
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Validations</h1><p className="text-sm text-gray-500">Preuves en attente</p></div>
      <div className="rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Chargement...</div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Aucune preuve en attente</div>
        ) : (
          <div className="divide-y">
            {data.map((c: any) => (
              <div key={c.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{c.user?.firstName} - {c.task?.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(c.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(c.id)} className="rounded-lg bg-green-100 p-2 text-green-700 hover:bg-green-200">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}