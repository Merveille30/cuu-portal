'use client'
import { useEffect, useRef, useState } from 'react'

interface Student { id: string; name: string; reg_no: string }

export default function AdminResultsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [success, setSuccess]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const studentRef  = useRef<HTMLSelectElement>(null)
  const subjectRef  = useRef<HTMLInputElement>(null)
  const marksRef    = useRef<HTMLInputElement>(null)
  const semesterRef = useRef<HTMLSelectElement>(null)
  const termRef     = useRef<HTMLInputElement>(null)
  const yearRef     = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/students').then(r => r.json()).then(setStudents)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    const res = await fetch('/api/admin/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentRef.current?.value,
        subject:    subjectRef.current?.value.trim(),
        marks:      parseFloat(marksRef.current?.value || '0'),
        semester:   semesterRef.current?.value,
        term:       termRef.current?.value.trim(),
        year:       yearRef.current?.value.trim(),
      }),
    })
    const d = await res.json()
    if (res.ok) {
      setSuccess('Result added successfully!')
      if (subjectRef.current) subjectRef.current.value = ''
      if (marksRef.current)   marksRef.current.value   = ''
    } else setError(d.error)
    setLoading(false)
  }

  return (
    <main className="pt-14 lg:pt-0 px-4 lg:px-7 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Results Management</h1>
        <p className="text-sm text-gray-400 mt-0.5">Add examination results for students</p>
      </div>

      <div className="max-w-xl">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900">➕ Add Result</h3>
          </div>
          <div className="px-5 py-5">
            {error   && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-4">⚠️ {error}</div>}
            {success && <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-sm mb-4">✅ {success}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Student</label>
                <select ref={studentRef} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white">
                  <option value="">Select student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.reg_no || 'no reg'})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject / Module</label>
                <input ref={subjectRef} type="text" required autoComplete="off" placeholder="e.g. Mathematics"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Marks (0–100)</label>
                  <input ref={marksRef} type="number" required min="0" max="100" placeholder="75"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Semester</label>
                  <select ref={semesterRef} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white">
                    <option>Semester 1</option><option>Semester 2</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Term</label>
                  <input ref={termRef} type="text" placeholder="e.g. AUG" autoComplete="off"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Year</label>
                  <input ref={yearRef} type="text" placeholder="e.g. 2025" autoComplete="off"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
                {loading ? 'Adding…' : 'Add Result'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
