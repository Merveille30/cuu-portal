'use client'
import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'

interface Notification { id: string; title: string; message: string; type: string; is_read: boolean; link: string; created_at: string }

const typeStyle: Record<string, string> = {
  success: 'bg-emerald-50 border-emerald-200', error: 'bg-red-50 border-red-200',
  warning: 'bg-amber-50 border-amber-200', approval: 'bg-emerald-50 border-emerald-300',
  payment: 'bg-blue-50 border-blue-200', info: 'bg-gray-50 border-gray-200',
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const load = () => fetch('/api/admin/notifications').then(r => r.json()).then(setNotifications)
  useEffect(() => { load() }, [])

  async function markAllRead() {
    await fetch('/api/admin/notifications', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    load()
  }

  const unread = notifications.filter(n => !n.is_read).length

  return (
    <main className="pt-14 lg:pt-0 px-4 lg:px-7 py-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            Notifications
            {unread > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread}</span>}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{notifications.length} total</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <CheckCheck size={14}/> Mark all read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <Bell size={40} className="mx-auto mb-4 opacity-30"/><p>No notifications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className={`border rounded-xl p-4 ${typeStyle[n.type]||typeStyle.info} ${!n.is_read?'shadow-sm':'opacity-70'}`}>
              <div className="flex items-start gap-3">
                {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"/>}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-bold text-sm text-gray-900">{n.title}</p>
                    <span className="text-[11px] text-gray-400">{new Date(n.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                  {n.link && <a href={n.link} className="text-xs font-semibold text-blue-600 underline mt-1 inline-block">View →</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
