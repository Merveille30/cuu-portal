'use client'
import { useEffect, useState } from 'react'
import TopBar from '@/components/TopBar'
import StatCard from '@/components/StatCard'
import { ClipboardList, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'

interface Result {
  id: string; subject: string; marks: number; grade: string
  semester: string; term: string; year: string
}

function gradeBadge(grade: string) {
  const g = grade?.toUpperCase()
  if (g === 'A') return 'bg-emerald-100 text-emerald-700'
  if (g === 'B') return 'bg-blue-100 text-blue-700'
  if (g === 'C') return 'bg-amber-100 text-amber-700'
  if (g === 'D') return 'bg-orange-100 text-orange-700'
  return 'bg-gray-100 text-gray-600'
}

function barColor(marks: number) {
  if (marks >= 70) return '#0e9f6e'
  if (marks >= 50) return '#d97706'
  return '#e02424'
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([])
  const [student, setStudent] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/student/results').then(r => r.json()),
      fetch('/api/student/profile').then(r => r.json()),
    ]).then(([res, prof]) => {
      setResults(res || [])
      setStudent(prof)
      setLoading(false)
    })
  }, [])

  const avg     = results.length ? Math.round(results.reduce((s, r) => s + Number(r.marks), 0) / results.length * 10) / 10 : 0
  const highest = results.length ? Math.max(...results.map(r => Number(r.marks))) : 0
  const lowest  = results.length ? Math.min(...results.map(r => Number(r.marks))) : 0

  // Group by semester
  const bySemester: Record<string, Result[]> = {}
  results.forEach(r => {
    const key = r.semester || 'Semester 1'
    ;(bySemester[key] = bySemester[key] || []).push(r)
  })

  return (
    <>
      <TopBar title="My Results" subtitle="Academic results posted by the registrar" regNo={student?.reg_no} />
      <main className="pt-28 lg:pt-16 px-4 lg:px-7 pb-8">
        <div className="mb-5 mt-2">
          <h2 className="text-xl font-extrabold text-gray-900">Academic Results</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Results are posted by the Academic Registrar. Contact admin if you have queries.
          </p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-5 mb-6">
          <StatCard icon={ClipboardList} value={String(results.length)} label="Total Subjects"  color="purple" />
          <StatCard icon={TrendingUp}    value={`${avg}%`}              label="Average Score"   color="blue" />
          <StatCard icon={ArrowUp}       value={`${highest}%`}          label="Highest Score"   color="green" />
          <StatCard icon={ArrowDown}     value={`${lowest}%`}           label="Lowest Score"    color="red" />
        </div>

        {/* Grading scale info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">📋 Grading Scale</h3>
          </div>
          <div className="px-5 py-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-[11px] font-bold uppercase text-gray-400">Grade</th>
                <th className="px-4 py-2 text-left text-[11px] font-bold uppercase text-gray-400">Marks Range</th>
                <th className="px-4 py-2 text-left text-[11px] font-bold uppercase text-gray-400">Classification</th>
              </tr></thead>
              <tbody>
                {[
                  ['A', '80–100', 'Distinction',    'bg-emerald-100 text-emerald-700'],
                  ['B', '70–79',  'Credit',          'bg-blue-100 text-blue-700'],
                  ['C', '60–69',  'Pass',            'bg-amber-100 text-amber-700'],
                  ['D', '50–59',  'Marginal Pass',   'bg-orange-100 text-orange-700'],
                  ['F', '0–49',   'Fail',            'bg-red-100 text-red-700'],
                ].map(([g, r, c, cls]) => (
                  <tr key={g} className="border-t border-gray-100">
                    <td className="px-4 py-2.5">
                      <span className={`font-bold text-base ${cls.split(' ')[1]}`}>{g}</span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs sm:text-sm">{r}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{c}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm text-center py-14">
            <ClipboardList size={40} className="mx-auto mb-4 text-gray-300" />
            <p className="font-semibold text-gray-500">No results posted yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Results will appear here once posted by the Academic Registrar.
            </p>
          </div>
        ) : (
          Object.entries(bySemester).map(([sem, semResults]) => (
            <div key={sem} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-5">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-gray-900 text-sm">📅 {sem}</h3>
                <span className="text-xs text-gray-400">
                  Avg: {Math.round(semResults.reduce((s, r) => s + Number(r.marks), 0) / semResults.length * 10) / 10}%
                  &nbsp;·&nbsp; {semResults.length} subject{semResults.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">#</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Subject / Module</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Marks</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Grade</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400 hidden sm:table-cell">Progress</th>
                  </tr></thead>
                  <tbody>
                    {semResults.map((r, i) => (
                      <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold text-xs sm:text-sm">{r.subject}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-sm sm:text-base">{r.marks}</span>
                          <span className="text-gray-400 text-xs">/100</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${gradeBadge(r.grade)}`}>
                            {r.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3 min-w-[100px] hidden sm:table-cell">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all"
                              style={{ width: `${r.marks}%`, background: barColor(Number(r.marks)) }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </main>
    </>
  )
}
