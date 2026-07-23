'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Target, Wallet, ArrowUpDown,
  Gift, Bell, Settings, Megaphone, Link2, Ticket, LogOut,
} from 'lucide-react'

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { name: 'Utilisateurs', href: '/users', icon: Users },
  { name: 'Tâches', href: '/tasks', icon: Target },
  { name: 'Retraits', href: '/withdrawals', icon: Wallet },
  { name: 'Transactions', href: '/transactions', icon: ArrowUpDown },
  { name: 'Bonus', href: '/bonus', icon: Gift },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Annonces', href: '/announcements', icon: Megaphone },
  { name: 'Canaux', href: '/channels', icon: Link2 },
  { name: 'Codes Promo', href: '/promocodes', icon: Ticket },
  { name: 'Paramètres', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-white">C</span>
        </div>
        <div>
          <h1 className="text-lg font-bold">Cashbot</h1>
          <p className="text-xs text-muted-foreground">Administration</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            // Vérifie si le chemin actuel correspond à ce lien
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className={cn('h-4 w-4', isActive ? 'text-white' : '')} />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </div>
  )
}