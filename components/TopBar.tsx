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
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-7 z-40 shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {regNo && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
            🎓 {regNo}
          </span>
        )}
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-semibold no-print">
          <LogOut size={13} /> Logout
        </button>
      </div>
    </header>
  )
}
