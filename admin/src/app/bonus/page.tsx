'use client'

import { useState } from 'react'
import { Gift, Plus } from 'lucide-react'

export default function BonusPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Bonus</h1><p className="text-sm text-gray-500">Configuration des bonus</p></div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-yellow-100 p-3"><Gift className="h-5 w-5 text-yellow-600" /></div>
            <div><h2 className="font-semibold">Bonus quotidien</h2><p className="text-sm text-gray-500">0.10€ + 0.05€ par jour de streak</p></div>
          </div>
          <p className="text-sm text-gray-600">Le bonus quotidien est automatiquement géré par le bot via la commande /daily. Les utilisateurs reçoivent un bonus croissant chaque jour.</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-green-100 p-3"><Gift className="h-5 w-5 text-green-600" /></div>
            <div><h2 className="font-semibold">Parrainage</h2><p className="text-sm text-gray-500">10% des gains des filleuls</p></div>
          </div>
          <p className="text-sm text-gray-600">Le bonus de parrainage est automatiquement crédité quand un filleul gagne de l'argent. Configurable dans le code.</p>
        </div>
      </div>
    </div>
  )
}