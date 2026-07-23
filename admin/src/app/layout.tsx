'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Toaster } from 'sonner'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar desktop */}
          <div className="hidden lg:flex">
            <Sidebar />
          </div>

          {/* Overlay mobile */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          )}

          {/* Sidebar mobile */}
          <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header avec menu hamburger sur mobile */}
            <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileMenuOpen(true)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden">
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2 lg:hidden">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                    <span className="text-sm font-bold text-white">C</span>
                  </div>
                  <span className="font-bold">Cashbot</span>
                </div>
              </div>
              <Header />
            </header>

            <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
              <div className="mx-auto max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </div>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}