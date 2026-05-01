'use client'
import { useEffect, useState } from 'react'
import TopBar from '@/components/TopBar'
import Alert from '@/components/Alert'
import { BookOpen, CheckCircle } from 'lucide-react'

const PROGRAMMES = [
  'Bachelor of Computer Science',
  'Bachelor of Information Technology',
  'Bachelor of Business Administration',
  'Bachelor of Education',
  'Bachelor of Commerce',
  'Bachelor of Science in Nursing',
  'Bachelor of Laws (LLB)',
  'Diploma in Computer Science',
  'Diploma in Business Studies',
  'Certificate in Information Technology',
]

export default function CoursesPage() {
  const [student, setStudent] = useState<Record<string, string> | null>(null)
  const [selected, setSelected] = useState('')
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/student/profile').then(r => r.json()).then(d => {
      setStudent(d); setSelected(d.course || '')
    })
  }, [])

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setLoading(true)
    const res = await fetch('/api/student/course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course: selected }),
    })
    const data = await res.json()
    if (res.ok) {
      setStudent(s => s ? { ...s, course: selected } : s)
      setAlert({ type: 'success', message: 'Programme enrollment updated successfully!' })
    } else {
      setAlert({ type: 'error', message: data.error })
    }
    setLoading(false)
  }

  return (
    <>
      <TopBar title="Course Registration" subtitle="Enroll in your academic programme" regNo={student?.reg_no} />
      <main className="pt-28 lg:pt-16 px-4 lg:px-7 pb-8">
        <div className="mb-5 mt-2">
          <h2 className="text-xl font-extrabold text-gray-900">Programme Enrollment</h2>
          <p className="text-sm text-gray-400 mt-0.5">Select and enroll in your academic programme</p>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
          {/* Form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <BookOpen size={15} className="text-blue-600" /> Enroll / Change Programme
              </h3>
            </div>
            <div className="px-5 py-5">
              <form onSubmit={handleEnroll} className="space-y-4">
                <div>
                  <label htmlFor="course-select" className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Select Programme
                  </label>
                  <select
                    id="course-select"
                    required
                    value={selected}
                    onChange={e => setSelected(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                               focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  >
                    <option value="">-- Choose a Programme --</option>
                    {PROGRAMMES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                  ℹ️ Changing your programme updates your enrollment record. Contact the registrar for official changes.
                </div>
                <button type="submit" disabled={loading || !selected}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50
                             active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
                  {loading ? 'Saving…' : '✓ Confirm Enrollment'}
                </button>
              </form>
            </div>
          </div>

          {/* Current Enrollment */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">🎓 Current Enrollment</h3>
            </div>
            <div className="px-5 py-5 flex flex-col items-center justify-center min-h-[180px]">
              {student?.course ? (
                <div className="text-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={26} className="text-blue-600" />
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-3 px-2">{student.course}</p>
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                    <CheckCircle size={12} /> Currently Enrolled
                  </span>
                  <div className="mt-4 pt-4 border-t border-gray-100 w-full space-y-2">
                    {[['Student Name', student.name], ['Reg. Number', student.reg_no]].map(([l, v]) => (
                      <div key={l} className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-400 font-semibold">{l}</span>
                        <span className="font-semibold text-gray-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Not enrolled in any programme yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Programmes Grid */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">📋 Available Programmes</h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {PROGRAMMES.map(p => {
              const active = student?.course === p
              return (
                <div key={p} onClick={() => setSelected(p)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all
                    ${active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}>
                  <BookOpen size={14} className={active ? 'text-blue-600 flex-shrink-0' : 'text-gray-300 flex-shrink-0'} />
                  <span className={`text-xs sm:text-sm ${active ? 'font-bold text-blue-700' : 'font-medium text-gray-600'}`}>{p}</span>
                  {active && <span className="ml-auto text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">Enrolled</span>}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
