'use client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

interface TopBarProps {
  title: string
  subtitle?: string
  regNo?: string
}

export default function TopBar({ title, subtitle, regNo }: TopBarProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    /* Mobile: sits below the 56px mobile top bar → top-14
       Desktop: sits at top-0 (no mobile top bar) → lg:top-0
       Left: 0 on mobile (full width), lg:left-64 on desktop */
    <header className="fixed top-14 lg:top-0 left-0 lg:left-64 right-0 z-40
                       h-14 lg:h-16 bg-white border-b border-gray-200 shadow-sm
                       flex items-center justify-between px-4 lg:px-7">
      <div className="min-w-0 flex-1">
        <h1 className="text-base lg:text-lg font-bold text-gray-900 leading-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-gray-400 hidden sm:block truncate">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {regNo && (
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50
                           text-blue-700 rounded-full text-xs font-semibold max-w-[160px] truncate">
            🎓 {regNo}
          </span>
        )}
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600
                     hover:bg-red-600 hover:text-white rounded-lg text-xs font-semibold
                     transition-all no-print whitespace-nowrap">
          <LogOut size={13} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
