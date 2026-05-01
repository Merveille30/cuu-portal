'use client'
import { useEffect, useState } from 'react'
import { Users, FileText, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import StatCard from '@/components/StatCard'
import Link from 'next/link'

interface Student { id: string; name: string; reg_no: string; programme: string; reg_status: string; created_at: string }
interface Notification { id: string; title: string; message: string; type: string; is_read: boolean; created_at: string; link: string }

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:             { label: 'Pending',              color: 'bg-gray-100 text-gray-600' },
  course_selected:     { label: 'Course Selected',      color: 'bg-blue-100 text-blue-700' },
  modules_registered:  { label: 'Modules Registered',   color: 'bg-indigo-100 text-indigo-700' },
  documents_uploaded:  { label: 'Docs Uploaded',        color: 'bg-amber-100 text-amber-700' },
  documents_approved:  { label: 'Docs Approved',        color: 'bg-emerald-100 text-emerald-700' },
  invoiced:            { label: 'Invoiced',              color: 'bg-purple-100 text-purple-700' },
  paid:                { label: 'Paid',                  color: 'bg-teal-100 text-teal-700' },
  active:              { label: 'Active',                color: 'bg-green-100 text-green-700' },
}

export default function AdminDashboard() {
  const [students, setStudents]         = useState<Student[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    fetch('/api/admin/students').then(r => r.json()).then(setStudents)
    fetch('/api/admin/notifications').then(r => r.json()).then(setNotifications)
  }, [])

  const docsUploaded = students.filter(s => s.reg_status === 'documents_uploaded').length
  const active       = students.filter(s => s.reg_status === 'active').length
  const unreadNotifs = notifications.filter(n => !n.is_read).length

  async function markAllRead() {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  return (
    <main className="pt-14 lg:pt-0 px-4 lg:px-7 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Overview of all student registrations and activities</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-5 mb-6">
        <StatCard icon={Users}       value={String(students.length)} label="Total Students"    color="blue" />
        <StatCard icon={CheckCircle} value={String(active)}          label="Active Students"   color="green" />
        <StatCard icon={FileText}    value={String(docsUploaded)}    label="Docs Pending Review" color="yellow" />
        <StatCard icon={AlertCircle} value={String(unreadNotifs)}    label="Unread Notifications" color="red" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent students */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">👥 Recent Registrations</h3>
            <Link href="/admin/students" className="text-xs text-blue-600 font-semibold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Name</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400 hidden sm:table-cell">Programme</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Status</th>
              </tr></thead>
              <tbody>
                {students.slice(0, 8).map(s => (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/students/${s.id}`} className="font-semibold text-xs text-blue-600 hover:underline">{s.name}</Link>
                      <p className="text-[11px] text-gray-400">{s.reg_no || 'No reg no'}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell max-w-[150px] truncate">{s.programme || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_LABELS[s.reg_status]?.color || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[s.reg_status]?.label || s.reg_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              🔔 Notifications
              {unreadNotifs > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotifs}</span>}
            </h3>
            {unreadNotifs > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-600 font-semibold hover:underline">Mark all read</button>
            )}
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No notifications.</div>
            ) : notifications.slice(0, 10).map(n => (
              <div key={n.id} className={`px-4 py-3 ${!n.is_read ? 'bg-blue-50/50' : ''}`}>
                <div className="flex items-start gap-2">
                  {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-gray-900">{n.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(n.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                  {n.link && (
                    <Link href={n.link} className="text-[11px] text-blue-600 font-semibold hover:underline flex-shrink-0">View</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
