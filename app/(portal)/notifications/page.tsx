'use client'
import { useEffect, useState } from 'react'
import TopBar from '@/components/TopBar'
import { Bell, CheckCheck } from 'lucide-react'

interface Notification {
  id: string; title: string; message: string; type: string
  is_read: boolean; link: string; created_at: string
}

const typeStyle: Record<string, string> = {
  success:  'bg-emerald-50 border-emerald-200 text-emerald-700',
  error:    'bg-red-50 border-red-200 text-red-700',
  warning:  'bg-amber-50 border-amber-200 text-amber-700',
  approval: 'bg-emerald-50 border-emerald-300 text-emerald-800',
  payment:  'bg-blue-50 border-blue-200 text-blue-700',
  info:     'bg-gray-50 border-gray-200 text-gray-700',
}

const typeIcon: Record<string, string> = {
  success: '✅', error: '❌', warning: '⚠️', approval: '🎉', payment: '💳', info: 'ℹ️'
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [student, setStudent] = useState<Record<string, string> | null>(null)

  const load = () => {
    fetch('/api/student/notifications').then(r => r.json()).then(setNotifications)
    fetch('/api/student/profile').then(r => r.json()).then(setStudent)
  }
  useEffect(() => { load() }, [])

  async function markAllRead() {
    await fetch('/api/student/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    load()
  }

  async function markRead(id: string) {
    await fetch('/api/student/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const unread = notifications.filter(n => !n.is_read).length

  return (
    <>
      <TopBar title="Notifications" subtitle="Your alerts and updates" regNo={student?.reg_no} />
      <main className="pt-28 lg:pt-16 px-4 lg:px-7 pb-8">
        <div className="mb-5 mt-2 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              Notifications
              {unread > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread}</span>}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">{notifications.length} total notifications</p>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            <Bell size={40} className="mx-auto mb-4 opacity-30" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`border rounded-xl p-4 transition-all cursor-pointer
                  ${typeStyle[n.type] || typeStyle.info}
                  ${!n.is_read ? 'shadow-sm' : 'opacity-70'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{typeIcon[n.type] || 'ℹ️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-bold text-sm">{n.title}</p>
                      <div className="flex items-center gap-2">
                        {!n.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                        <span className="text-[11px] opacity-60">
                          {new Date(n.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs mt-1 opacity-80">{n.message}</p>
                    {n.link && (
                      <a href={n.link} className="text-xs font-semibold underline mt-1 inline-block" onClick={e => e.stopPropagation()}>
                        View →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
