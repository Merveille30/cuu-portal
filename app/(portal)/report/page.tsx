'use client'
import { useEffect, useState } from 'react'
import TopBar from '@/components/TopBar'
import { Printer } from 'lucide-react'

interface ReportRow {
  student: { id: string; name: string; reg_no: string; course: string; email: string }
  totalPaid: number
  results: { subject: string; marks: number; grade: string; semester: string }[]
  avgMarks: number
}

function gradeColor(grade: string) {
  const g = grade?.toUpperCase()
  if (g === 'A') return 'text-emerald-600 font-bold'
  if (g === 'B') return 'text-blue-600 font-bold'
  if (g === 'C') return 'text-amber-600 font-bold'
  return 'text-red-500 font-bold'
}

export default function ReportPage() {
  const [report, setReport] = useState<ReportRow[]>([])
  const [myProfile, setMyProfile] = useState<Record<string, string> | null>(null)
  const [myRow, setMyRow] = useState<ReportRow | null>(null)

  useEffect(() => {
    fetch('/api/report').then(r => r.json()).then(setReport)
    fetch('/api/student/profile').then(r => r.json()).then(setMyProfile)
  }, [])

  useEffect(() => {
    if (report.length && myProfile) {
      setMyRow(report.find(r => r.student.id === myProfile.id) || null)
    }
  }, [report, myProfile])

  return (
    <>
      <TopBar title="Reports" subtitle="Academic and financial reports" regNo={myProfile?.reg_no} />
      <main className="pt-28 lg:pt-16 px-4 lg:px-7 pb-8">
        <div className="mb-5 mt-2 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Student Reports</h2>
            <p className="text-sm text-gray-400 mt-0.5">Comprehensive academic and financial overview</p>
          </div>
          <button onClick={() => window.print()}
            className="no-print flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
            <Printer size={14} /> Print Report
          </button>
        </div>

        {/* My Personal Report */}
        {myRow && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg,#0f172a,#1a56db)' }}>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                🎓 My Academic Report — {myRow.student.name}
              </h3>
              <span className="text-white/50 text-xs">Generated: {new Date().toLocaleString('en-GB', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
            </div>
            <div className="p-6">
              {/* Info row */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 pb-5 mb-5 border-b border-gray-100">
                {[['Full Name', myRow.student.name], ['Reg. Number', myRow.student.reg_no], ['Programme', myRow.student.course || 'Not Enrolled'], ['Average Score', `${myRow.avgMarks}%`]].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{l}</p>
                    <p className="font-bold text-gray-900 text-sm">{v}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Results */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">📊 Academic Results</p>
                  {myRow.results.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-[11px] font-bold uppercase text-gray-400">Subject</th>
                        <th className="px-4 py-2 text-left text-[11px] font-bold uppercase text-gray-400">Marks</th>
                        <th className="px-4 py-2 text-left text-[11px] font-bold uppercase text-gray-400">Grade</th>
                        <th className="px-4 py-2 text-left text-[11px] font-bold uppercase text-gray-400">Semester</th>
                      </tr></thead>
                      <tbody>
                        {myRow.results.map((r, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="px-4 py-2.5 font-medium">{r.subject}</td>
                            <td className="px-4 py-2.5">{r.marks}%</td>
                            <td className={`px-4 py-2.5 ${gradeColor(r.grade)}`}>{r.grade}</td>
                            <td className="px-4 py-2.5 text-gray-400 text-xs">{r.semester}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot><tr className="bg-gray-50 border-t border-gray-200">
                        <td className="px-4 py-2.5 font-bold">Average</td>
                        <td className="px-4 py-2.5 font-extrabold text-blue-600">{myRow.avgMarks}%</td>
                        <td colSpan={2} />
                      </tr></tfoot>
                    </table>
                  ) : <p className="text-sm text-gray-400 py-4">No results recorded.</p>}
                </div>

                {/* Payments */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">💳 Fee Summary</p>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
                    <p className="text-3xl font-extrabold text-emerald-700">UGX {myRow.totalPaid.toLocaleString()}</p>
                    <p className="text-sm text-emerald-600 mt-1">Total Fees Paid</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Students Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">👥 All Students Overview</h3>
            <span className="text-xs text-gray-400">{report.length} students registered</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">#</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Student</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Reg. No</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Programme</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Total Paid</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Subjects</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Avg Score</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Status</th>
              </tr></thead>
              <tbody>
                {report.map((row, i) => {
                  const isMe = row.student.id === myProfile?.id
                  return (
                    <tr key={row.student.id} className={`border-t border-gray-100 hover:bg-gray-50 ${isMe ? 'bg-blue-50' : ''}`}>
                      <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
                            {row.student.name[0]?.toUpperCase()}
                          </div>
                          <span className="font-semibold">{row.student.name}</span>
                          {isMe && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">You</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{row.student.reg_no}</td>
                      <td className="px-5 py-3">
                        {row.student.course
                          ? <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{row.student.course}</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3 font-bold text-emerald-600">UGX {row.totalPaid.toLocaleString()}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{row.results.length}</span>
                      </td>
                      <td className="px-5 py-3">
                        {row.avgMarks > 0
                          ? <span className={`font-bold ${row.avgMarks >= 70 ? 'text-emerald-600' : row.avgMarks >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{row.avgMarks}%</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.student.course ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {row.student.course ? 'Enrolled' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
