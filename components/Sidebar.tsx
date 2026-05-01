'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, CreditCard, BarChart2,
  FileText, User, LogOut
} from 'lucide-react'
import CUULogo from './CUULogo'

const navItems = [
  { label: 'Dashboard',    href: '/dashboard',  icon: LayoutDashboard, section: 'Main' },
  { label: 'My Profile',   href: '/profile',    icon: User,            section: 'Main' },
  { label: 'Courses',      href: '/courses',    icon: BookOpen,        section: 'Academics' },
  { label: 'Results',      href: '/results',    icon: BarChart2,       section: 'Academics' },
  { label: 'Fee Payments', href: '/payments',   icon: CreditCard,      section: 'Finance' },
  { label: 'Reports',      href: '/report',     icon: FileText,        section: 'Reports' },
]

interface SidebarProps {
  studentName: string
  regNo: string
}

export default function Sidebar({ studentName, regNo }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const initials = studentName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const sections = [...new Set(navItems.map((i) => i.section))]

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col z-50"
      style={{ background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)' }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
        <CUULogo size={44} />
        <div>
          <p className="text-white font-bold text-sm leading-tight">CUU Portal</p>
          <p className="text-white/40 text-xs">Student Management</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section}>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-2 pt-3 pb-1.5">
              {section}
            </p>
            {navItems.filter((i) => i.section === section).map((item) => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all
                    ${active
                      ? 'text-white shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/8'
                    }`}
                  style={active ? { background: 'linear-gradient(135deg,#1a56db,#6366f1)', boxShadow: '0 4px 12px rgba(26,86,219,0.4)' } : {}}>
                  <item.icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/6 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{studentName}</p>
            <p className="text-white/40 text-[11px] truncate">{regNo}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm font-medium">
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
