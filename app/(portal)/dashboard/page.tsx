'use client'
import { useEffect, useState } from 'react'
import TopBar from '@/components/TopBar'
import StatCard from '@/components/StatCard'
import { BookOpen, DollarSign, ClipboardList, Star, Edit } from 'lucide-react'
import Link from 'next/link'

function gradeColor(grade: string) {
  const g = grade?.toUpperCase()
  if (g === 'A') return 'text-emerald-600 font-bold'
  if (g === 'B') return 'text-blue-600 font-bold'
  if (g === 'C') return 'text-amber-600 font-bold'
  if (g === 'D') return 'text-orange-600 font-bold'
  return 'text-gray-500 font-bold'
}

export default function DashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    fetch('/api/student/dashboard').then(r => r.json()).then(setData)
  }, [])

  if (!data) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const s = data.student as Record<string, string>
  const payments = (data.recentPayments as Record<string, unknown>[]) || []
  const results  = (data.recentResults  as Record<string, unknown>[]) || []

  return (
    <>
      <TopBar title="Dashboard" subtitle={`Welcome back, ${s?.name}`} regNo={s?.reg_no} />
      <main className="pt-16 p-7">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">Overview</h2>
          <p className="text-sm text-gray-400 mt-0.5">Your academic summary at a glance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
          <StatCard icon={BookOpen}     value={s?.course ? '1' : '0'} label="Enrolled Programme" color="blue" />
          <StatCard icon={DollarSign}   value={`UGX ${Number(data.totalPaid).toLocaleString()}`} label="Total Fees Paid" color="green" />
          <StatCard icon={ClipboardList}value={String(data.resultCount)} label="Results Recorded" color="purple" />
          <StatCard icon={Star}         value={`${data.avgMarks}%`} label="Average Score" color="yellow" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Student Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">👤 Student Information</h3>
              <Link href="/profile" className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline">
                <Edit size={12} /> Edit
              </Link>
            </div>
            <div className="px-6 py-4 space-y-3">
              {[
                ['Full Name', s?.name],
                ['Reg. Number', s?.reg_no],
                ['Username', s?.username],
                ['Email', s?.email || '—'],
                ['Phone', s?.phone || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex text-sm">
                  <span className="w-36 text-gray-400 font-semibold flex-shrink-0">{label}</span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Programme */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">📚 Current Programme</h3>
              <Link href="/courses" className="text-xs text-blue-600 font-semibold hover:underline">Manage</Link>
            </div>
            <div className="px-6 py-4 flex flex-col items-center justify-center min-h-[160px]">
              {s?.course ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={28} className="text-blue-600" />
                  </div>
                  <p className="font-bold text-gray-900 text-base mb-2">{s.course}</p>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                    ✓ Enrolled
                  </span>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm mb-3">No programme enrolled yet.</p>
                  <Link href="/courses" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
                    Enroll Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Payments */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">💳 Recent Payments</h3>
              <Link href="/payments" className="text-xs text-blue-600 font-semibold hover:underline">View All</Link>
            </div>
            {payments.length > 0 ? (
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50">
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-gray-400">Description</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-gray-400">Amount</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-gray-400">Date</th>
                </tr></thead>
                <tbody>
                  {payments.map((p: Record<string, unknown>) => (
                    <tr key={String(p.id)} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3">{String(p.description)}</td>
                      <td className="px-5 py-3 font-bold text-emerald-600">UGX {Number(p.amount).toLocaleString()}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{new Date(String(p.payment_date)).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm">No payments recorded yet.</div>
            )}
          </div>

          {/* Recent Results */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">📊 Recent Results</h3>
              <Link href="/results" className="text-xs text-blue-600 font-semibold hover:underline">View All</Link>
            </div>
            {results.length > 0 ? (
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50">
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-gray-400">Subject</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-gray-400">Marks</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-gray-400">Grade</th>
                </tr></thead>
                <tbody>
                  {results.map((r: Record<string, unknown>) => (
                    <tr key={String(r.id)} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium">{String(r.subject)}</td>
                      <td className="px-5 py-3 font-bold">{String(r.marks)}%</td>
                      <td className={`px-5 py-3 ${gradeColor(String(r.grade))}`}>{String(r.grade)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm">No results recorded yet.</div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
