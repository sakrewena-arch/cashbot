'use client'

import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Paramètres</h1><p className="text-sm text-gray-500">Configuration du bot</p></div>
      <div className="max-w-2xl space-y-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Informations du bot</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Version</span><span>1.0.0</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Environnement</span><span className="text-green-600 font-medium">Production</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Base de données</span><span>SQLite</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Admin Telegram</span><span>8811784278</span></div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold mb-2">Bonus quotidien</h2>
          <p className="text-sm text-gray-600">0.10€ + 0.05€ par jour de streak · Cooldown: 20h</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold mb-2">Retraits</h2>
          <p className="text-sm text-gray-600">Montant minimum: 5€ · Frais: 2%</p>
        </div>
      </div>
    </div>
  )
}