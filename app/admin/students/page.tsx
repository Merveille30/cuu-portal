'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

interface Student { id: string; name: string; reg_no: string; email: string; programme: string; reg_status: string; created_at: string }

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

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')

  useEffect(() => {
    fetch('/api/admin/students').then(r => r.json()).then(setStudents)
  }, [])

  const filtered = students.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.reg_no || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || s.reg_status === filter
    return matchSearch && matchFilter
  })

  return (
    <main className="pt-14 lg:pt-0 px-4 lg:px-7 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Students</h1>
        <p className="text-sm text-gray-400 mt-0.5">{students.length} students registered</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, reg no or email…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white">
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">#</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Name</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400 hidden sm:table-cell">Reg No</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400 hidden lg:table-cell">Programme</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Action</th>
            </tr></thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i+1}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-xs text-gray-900">{s.name}</p>
                    <p className="text-[11px] text-gray-400">{s.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{s.reg_no || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell max-w-[180px] truncate">{s.programme || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_LABELS[s.reg_status]?.color || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[s.reg_status]?.label || s.reg_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/students/${s.id}`}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No students found.</div>
          )}
        </div>
      </div>
    </main>
  )
}
