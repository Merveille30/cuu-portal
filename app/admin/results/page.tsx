'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Student { id: string; name: string; reg_no: string; programme: string }
interface Module  { id: string; name: string; code: string; semester: number; year: number }
interface Result  { id: string; subject: string; marks: number; grade: string; semester: string; created_at: string }

export default function AdminResultsPage() {
  const [students, setStudents]   = useState<Student[]>([])
  const [modules, setModules]     = useState<Module[]>([])
  const [results, setResults]     = useState<Result[]>([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedModule, setSelectedModule]   = useState('')
  const [success, setSuccess]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [loadingModules, setLoadingModules] = useState(false)

  const marksRef    = useRef<HTMLInputElement>(null)
  const semesterRef = useRef<HTMLSelectElement>(null)
  const termRef     = useRef<HTMLInputElement>(null)
  const yearRef     = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/students').then(r => r.json()).then(setStudents)
  }, [])

  // When student changes, load their modules and existing results
  async function handleStudentChange(studentId: string) {
    setSelectedStudent(studentId)
    setSelectedModule('')
    setModules([])
    setResults([])
    if (!studentId) return

    setLoadingModules(true)
    const [modsRes, detailRes] = await Promise.all([
      fetch(`/api/admin/results?student_id=${studentId}`).then(r => r.json()),
      fetch(`/api/admin/students/${studentId}`).then(r => r.json()),
    ])
    setModules(modsRes || [])
    setResults(detailRes.results || [])
    setLoadingModules(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)

    const marks = parseFloat(marksRef.current?.value || '0')
    if (!selectedStudent) { setError('Select a student.'); setLoading(false); return }
    if (!selectedModule)  { setError('Select a module.'); setLoading(false); return }
    if (isNaN(marks) || marks < 0 || marks > 100) { setError('Enter valid marks (0–100).'); setLoading(false); return }

    const res = await fetch('/api/admin/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: selectedStudent,
        module_id:  selectedModule,
        marks,
        semester:   semesterRef.current?.value || 'Semester 1',
        term:       termRef.current?.value.trim() || '',
        year:       yearRef.current?.value.trim() || '',
      }),
    })
    const d = await res.json()
    if (res.ok) {
      setSuccess('✅ Result posted! Student has been notified.')
      if (marksRef.current) marksRef.current.value = ''
      setSelectedModule('')
      // Refresh results
      const detail = await fetch(`/api/admin/students/${selectedStudent}`).then(r => r.json())
      setResults(detail.results || [])
    } else {
      setError(d.error)
    }
    setLoading(false)
  }

  const selectedStudentData = students.find(s => s.id === selectedStudent)

  function gradeColor(grade: string) {
    if (grade === 'A') return 'text-emerald-600 font-bold'
    if (grade === 'B') return 'text-blue-600 font-bold'
    if (grade === 'C') return 'text-amber-600 font-bold'
    return 'text-red-500 font-bold'
  }

  return (
    <main className="pt-14 lg:pt-0 px-4 lg:px-7 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Results Management</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Post examination results for students. Students are notified automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Add Result Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900">➕ Post Result</h3>
          </div>
          <div className="px-5 py-5">
            {error   && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-4">⚠️ {error}</div>}
            {success && <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-sm mb-4">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Select Student */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  1. Select Student
                </label>
                <select
                  value={selectedStudent}
                  onChange={e => handleStudentChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                             focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="">— Choose a student —</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.reg_no ? `(${s.reg_no})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Module */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  2. Select Module
                  {loadingModules && <span className="ml-2 text-blue-500 font-normal">Loading…</span>}
                </label>
                {selectedStudent && modules.length === 0 && !loadingModules ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                    ⚠️ This student has no registered modules yet.
                    <Link href={`/admin/students/${selectedStudent}`} className="ml-1 font-semibold underline">
                      View student →
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedModule}
                    onChange={e => setSelectedModule(e.target.value)}
                    required
                    disabled={!selectedStudent || loadingModules}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                               focus:border-blue-500 focus:outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">— Choose a module —</option>
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.code}) — Y{m.year} S{m.semester}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Step 3: Marks */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    3. Marks (0–100)
                  </label>
                  <input
                    ref={marksRef}
                    type="number"
                    required
                    min="0"
                    max="100"
                    placeholder="e.g. 75"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                               focus:border-blue-500 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Semester</label>
                  <select
                    ref={semesterRef}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                               focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option>Semester 1</option>
                    <option>Semester 2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Term</label>
                  <input
                    ref={termRef}
                    type="text"
                    placeholder="e.g. AUG"
                    autoComplete="off"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                               focus:border-blue-500 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Year</label>
                  <input
                    ref={yearRef}
                    type="text"
                    placeholder="e.g. 2025"
                    autoComplete="off"
                    defaultValue={String(new Date().getFullYear())}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                               focus:border-blue-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700">
                ℹ️ Grade is auto-calculated. The student will receive a notification when results are posted.
              </div>

              <button
                type="submit"
                disabled={loading || !selectedStudent || !selectedModule}
                className="w-full py-3 rounded-xl text-white font-bold text-sm
                           disabled:opacity-50 active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}
              >
                {loading ? 'Posting…' : 'Post Result & Notify Student'}
              </button>
            </form>
          </div>
        </div>

        {/* Student's existing results */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900">
              {selectedStudentData ? `📊 ${selectedStudentData.name}'s Results` : '📊 Student Results'}
            </h3>
          </div>
          {!selectedStudent ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              Select a student to view their results.
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No results posted for this student yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Subject</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Marks</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Grade</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400 hidden sm:table-cell">Semester</th>
                </tr></thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-xs sm:text-sm">{r.subject}</td>
                      <td className="px-4 py-3 font-bold text-xs sm:text-sm">{r.marks}/100</td>
                      <td className={`px-4 py-3 text-sm ${gradeColor(r.grade)}`}>{r.grade}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{r.semester}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
