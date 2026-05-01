'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Student { id: string; name: string; reg_no: string; programme: string }

export default function AdminFinancePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [finData, setFinData]   = useState<Record<string, { invoiced: number; paid: number }>>({})

  useEffect(() => {
    fetch('/api/admin/students').then(r => r.json()).then(async (studs: Student[]) => {
      setStudents(studs)
      const fd: Record<string, { invoiced: number; paid: number }> = {}
      await Promise.all(studs.map(async s => {
        const r = await fetch(`/api/admin/students/${s.id}`)
        const d = await r.json()
        fd[s.id] = {
          invoiced: (d.invoices || []).reduce((sum: number, i: { total: number }) => sum + Number(i.total), 0),
          paid:     (d.payments || []).reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0),
        }
      }))
      setFinData(fd)
    })
  }, [])

  const totalInvoiced = Object.values(finData).reduce((s, d) => s + d.invoiced, 0)
  const totalPaid     = Object.values(finData).reduce((s, d) => s + d.paid, 0)

  return (
    <main className="pt-14 lg:pt-0 px-4 lg:px-7 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Finance Overview</h1>
        <p className="text-sm text-gray-400 mt-0.5">All student invoices and payments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Invoiced', value: `USD ${totalInvoiced.toLocaleString()}`, color: 'bg-blue-50 text-blue-700' },
          { label: 'Total Collected', value: `USD ${totalPaid.toLocaleString()}`, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Outstanding', value: `USD ${(totalInvoiced - totalPaid).toLocaleString()}`, color: 'bg-red-50 text-red-700' },
        ].map(c => (
          <div key={c.label} className={`rounded-xl p-5 ${c.color}`}>
            <p className="text-xs font-bold uppercase tracking-wide opacity-70">{c.label}</p>
            <p className="text-2xl font-extrabold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Student</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400 hidden sm:table-cell">Programme</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Invoiced</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Paid</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Balance</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody>
              {students.map(s => {
                const fd = finData[s.id] || { invoiced: 0, paid: 0 }
                const bal = fd.invoiced - fd.paid
                return (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-xs">{s.name}</p>
                      <p className="text-[11px] text-gray-400">{s.reg_no || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell max-w-[150px] truncate">{s.programme || '—'}</td>
                    <td className="px-4 py-3 text-xs font-semibold">{fd.invoiced > 0 ? `USD ${fd.invoiced.toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3 text-xs font-bold text-emerald-600">{fd.paid > 0 ? `USD ${fd.paid.toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3 text-xs font-bold" style={{ color: bal > 0 ? '#e02424' : '#0e9f6e' }}>
                      {fd.invoiced > 0 ? `USD ${bal.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/students/${s.id}`} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all">
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
