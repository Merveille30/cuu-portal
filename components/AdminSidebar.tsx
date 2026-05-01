'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { LayoutDashboard, Users, FileText, Bell, BarChart2, LogOut, Menu, X, DollarSign, ClipboardList } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard',    href: '/admin/dashboard',  icon: LayoutDashboard },
  { label: 'Students',     href: '/admin/students',   icon: Users },
  { label: 'Documents',    href: '/admin/documents',  icon: FileText },
  { label: 'Results',      href: '/admin/results',    icon: BarChart2 },
  { label: 'Reports',      href: '/admin/reports',    icon: ClipboardList },
  { label: 'Finance',      href: '/admin/finance',    icon: DollarSign },
  { label: 'Notifications',href: '/admin/notifications', icon: Bell },
]

export default function AdminSidebar({ adminName, role }: { adminName: string; role: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const NavContent = () => (
    <>
      <div className="flex flex-col items-center py-6 px-4 border-b border-white/10">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/20 shadow-xl bg-white mb-3">
          <Image src="/cuu-logo.svg" alt="CUU" width={80} height={80} className="w-full h-full object-cover" priority />
        </div>
        <p className="text-white font-bold text-sm text-center">Admin Portal</p>
        <p className="text-white/40 text-[11px] text-center mt-0.5 capitalize">{role.replace('_', ' ')}</p>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all
                ${active ? 'text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/8'}`}
              style={active ? { background: 'linear-gradient(135deg,#1a56db,#6366f1)', boxShadow: '0 4px 12px rgba(26,86,219,0.4)' } : {}}>
              <item.icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/6 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
            {adminName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{adminName}</p>
            <p className="text-white/40 text-[11px] capitalize">{role.replace('_', ' ')}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm font-medium">
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 border-b border-white/10"
        style={{ background: '#0f172a' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 bg-white">
            <Image src="/cuu-logo.svg" alt="CUU" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <span className="text-white font-bold text-sm">Admin Portal</span>
        </div>
        <button onClick={() => setOpen(o => !o)} className="text-white p-1.5 rounded-lg hover:bg-white/10">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />}

      <aside className={`lg:hidden fixed top-0 left-0 h-full w-72 z-50 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)' }}>
        <NavContent />
      </aside>

      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-64 flex-col z-50"
        style={{ background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)' }}>
        <NavContent />
      </aside>
    </>
  )
}
