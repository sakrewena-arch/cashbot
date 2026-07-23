'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Target, Wallet, ArrowUpDown,
  Gift, Bell, Settings, Megaphone, Link2, Ticket, LogOut, X,
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

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-white">C</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">Cashbot</h1>
            <p className="text-xs text-muted-foreground">Administration</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : '')} />
                  <span className="truncate">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="truncate">Déconnexion</span>
        </button>
      </div>
    </div>
  )
}