'use client'
import { useEffect, useState } from 'react'
import TopBar from '@/components/TopBar'
import Alert from '@/components/Alert'
import StatCard from '@/components/StatCard'
import { ClipboardList, TrendingUp, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'

const SEMESTERS = ['Semester 1','Semester 2','Year 1 — Sem 1','Year 1 — Sem 2','Year 2 — Sem 1','Year 2 — Sem 2','Year 3 — Sem 1','Year 3 — Sem 2']

interface Result { id: string; subject: string; marks: number; grade: string; semester: string }

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
  const [form, setForm] = useState({ subject: '', marks: '', grade: '', semester: 'Semester 1' })
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    fetch('/api/student/results').then(r => r.json()).then(setResults)
    fetch('/api/student/profile').then(r => r.json()).then(setStudent)
  }
  useEffect(load, [])

  const avg = results.length ? Math.round(results.reduce((s, r) => s + r.marks, 0) / results.length * 10) / 10 : 0
  const highest = results.length ? Math.max(...results.map(r => r.marks)) : 0
  const lowest  = results.length ? Math.min(...results.map(r => r.marks)) : 0

  // Group by semester
  const bySemester: Record<string, Result[]> = {}
  results.forEach(r => { (bySemester[r.semester] = bySemester[r.semester] || []).push(r) })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/student/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: form.subject, marks: parseInt(form.marks), grade: form.grade, semester: form.semester }),
    })
    const data = await res.json()
    if (res.ok) { setAlert({ type: 'success', message: `Result for "${form.subject}" added!` }); setForm(f => ({ ...f, subject: '', marks: '', grade: '' })); load() }
    else setAlert({ type: 'error', message: data.error })
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this result?')) return
    const res = await fetch('/api/student/results', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) { setAlert({ type: 'success', message: 'Result deleted.' }); load() }
  }

  return (
    <>
      <TopBar title="Academic Results" subtitle="View and manage your examination results" regNo={student?.reg_no} />
      <main className="pt-16 p-7">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">Results Management</h2>
          <p className="text-sm text-gray-400 mt-0.5">Your academic performance records</p>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          <StatCard icon={ClipboardList} value={String(results.length)} label="Total Subjects" color="purple" />
          <StatCard icon={TrendingUp}    value={`${avg}%`} label="Average Score" color="blue" />
          <StatCard icon={ArrowUp}       value={`${highest}%`} label="Highest Score" color="green" />
          <StatCard icon={ArrowDown}     value={`${lowest}%`} label="Lowest Score" color="red" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Add Result Form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">➕ Add Result</h3>
            </div>
            <div className="px-6 py-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject / Unit Name</label>
                  <input type="text" required placeholder="e.g. Mathematics, Programming"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none"
                    value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Marks (0–100)</label>
                    <input type="number" required min="0" max="100" placeholder="e.g. 75"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none"
                      value={form.marks} onChange={e => setForm(f => ({ ...f, marks: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Grade (auto)</label>
                    <select className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white"
                      value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}>
                      <option value="">Auto-calculate</option>
                      <option value="A">A (80–100)</option>
                      <option value="B">B (70–79)</option>
                      <option value="C">C (60–69)</option>
                      <option value="D">D (50–59)</option>
                      <option value="F">F (0–49)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Semester</label>
                  <select className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white"
                    value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                    {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
                  {loading ? 'Adding…' : '+ Add Result'}
                </button>
              </form>
            </div>
          </div>

          {/* Grading Scale */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">📋 Grading Scale</h3>
            </div>
            <div className="px-6 py-4">
              <table className="w-full text-sm mb-4">
                <thead><tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-[11px] font-bold uppercase text-gray-400">Grade</th>
                  <th className="px-4 py-2 text-left text-[11px] font-bold uppercase text-gray-400">Range</th>
                  <th className="px-4 py-2 text-left text-[11px] font-bold uppercase text-gray-400">Class</th>
                </tr></thead>
                <tbody>
                  {[['A','80–100','Distinction','bg-emerald-100 text-emerald-700'],['B','70–79','Credit','bg-blue-100 text-blue-700'],['C','60–69','Pass','bg-amber-100 text-amber-700'],['D','50–59','Marginal Pass','bg-orange-100 text-orange-700'],['F','0–49','Fail','bg-red-100 text-red-700']].map(([g,r,c,cls]) => (
                    <tr key={g} className="border-t border-gray-100">
                      <td className="px-4 py-2.5"><span className={`font-bold text-base ${cls.split(' ')[1]}`}>{g}</span></td>
                      <td className="px-4 py-2.5 text-gray-600">{r}</td>
                      <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{c}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Results by Semester */}
        {Object.keys(bySemester).length > 0 ? Object.entries(bySemester).map(([sem, semResults]) => (
          <div key={sem} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-5">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">📅 {sem}</h3>
              <span className="text-xs text-gray-400">
                Avg: {Math.round(semResults.reduce((s,r) => s+r.marks,0)/semResults.length*10)/10}% · {semResults.length} subject{semResults.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50">
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">#</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Subject</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Marks</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Grade</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Performance</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Action</th>
                </tr></thead>
                <tbody>
                  {semResults.map((r, i) => (
                    <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-400 text-xs">{i+1}</td>
                      <td className="px-5 py-3 font-semibold">{r.subject}</td>
                      <td className="px-5 py-3"><span className="font-bold text-base">{r.marks}</span><span className="text-gray-400 text-xs">/100</span></td>
                      <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${gradeBadge(r.grade)}`}>{r.grade}</span></td>
                      <td className="px-5 py-3 min-w-[120px]">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.marks}%`, background: barColor(r.marks) }} />
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm text-center py-12 text-gray-400 text-sm">
            No results recorded yet. Add your first result above.
          </div>
        )}
      </main>
    </>
  )
}
