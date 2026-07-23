'use client'

import { Bell, Search } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex items-center gap-2 lg:gap-4">
      {/* Barre de recherche (cachée sur mobile) */}
      <div className="relative hidden sm:block w-48 lg:w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Notifications */}
      <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
      </button>

      {/* Profil admin */}
      <div className="flex items-center gap-2 lg:gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <span className="text-sm font-medium text-primary">A</span>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium leading-tight">Administrateur</p>
          <p className="text-xs text-muted-foreground">Super Admin</p>
        </div>
      </div>
    </div>
  )
}