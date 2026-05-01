'use client'
import { useEffect, useState } from 'react'
import TopBar from '@/components/TopBar'
import { BookOpen, Clock, User, Mail, Calendar } from 'lucide-react'

interface Module {
  id: string; code: string; name: string; credits: number
  year: number; semester: number; description: string
  lecturer: string; lecturer_email: string; schedule: string
}
interface StudentModule { id: string; status: string; term: string; year: string; modules: Module }

export default function MyModulesPage() {
  const [studentModules, setStudentModules] = useState<StudentModule[]>([])
  const [student, setStudent] = useState<Record<string, string> | null>(null)
  const [selected, setSelected] = useState<Module | null>(null)

  useEffect(() => {
    fetch('/api/student/modules').then(r => r.json()).then(d => {
      // Get full module details for registered modules
      fetch('/api/student/profile').then(r => r.json()).then(setStudent)
    })
    // Get registered modules with details
    fetch('/api/student/my-modules').then(r => r.json()).then(setStudentModules)
  }, [])

  const bySemester: Record<string, StudentModule[]> = {}
  studentModules.forEach(sm => {
    const key = `${sm.term} ${sm.year}`
    ;(bySemester[key] = bySemester[key] || []).push(sm)
  })

  return (
    <>
      <TopBar title="My Modules" subtitle="Your registered academic modules" regNo={student?.reg_no} />
      <main className="pt-28 lg:pt-16 px-4 lg:px-7 pb-8">
        <div className="mb-5 mt-2">
          <h2 className="text-xl font-extrabold text-gray-900">My Modules</h2>
          <p className="text-sm text-gray-400 mt-0.5">Click a module card to view details</p>
        </div>

        {studentModules.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold">No modules registered yet.</p>
            <p className="text-sm mt-1">Complete the registration process to see your modules here.</p>
          </div>
        ) : (
          Object.entries(bySemester).map(([period, mods]) => (
            <div key={period} className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">{period}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {mods.map(sm => {
                  const m = sm.modules
                  if (!m) return null
                  return (
                    <div key={sm.id} onClick={() => setSelected(m)}
                      className="bg-white rounded-xl border-2 border-gray-200 p-5 cursor-pointer
                                 hover:border-blue-400 hover:shadow-md transition-all group">
                      {/* Module colour bar */}
                      <div className="h-1.5 rounded-full mb-4" style={{
                        background: `hsl(${(m.name.charCodeAt(0) * 37) % 360}, 60%, 55%)`
                      }} />
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{m.code}</span>
                          <h4 className="font-bold text-gray-900 text-sm mt-1.5 group-hover:text-blue-700 transition-colors">{m.name}</h4>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0
                          ${sm.status==='completed'?'bg-emerald-100 text-emerald-700':sm.status==='failed'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>
                          {sm.status}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-gray-500">
                        {m.lecturer && <p className="flex items-center gap-1.5"><User size={11}/>{m.lecturer}</p>}
                        {m.schedule && <p className="flex items-center gap-1.5"><Clock size={11}/>{m.schedule}</p>}
                        <p className="flex items-center gap-1.5"><BookOpen size={11}/>{m.credits} credits · Year {m.year} Sem {m.semester}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}

        {/* Module detail modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="h-2 rounded-full mb-5" style={{
                background: `hsl(${(selected.name.charCodeAt(0) * 37) % 360}, 60%, 55%)`
              }} />
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{selected.code}</span>
                  <h3 className="text-lg font-extrabold text-gray-900 mt-2">{selected.name}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
              </div>

              <div className="space-y-3 text-sm">
                {selected.description && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Description</p>
                    <p className="text-gray-700">{selected.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1">Credits</p>
                    <p className="font-bold text-blue-700 text-lg">{selected.credits}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-1">Year / Semester</p>
                    <p className="font-bold text-purple-700">Y{selected.year} / S{selected.semester}</p>
                  </div>
                </div>
                {selected.lecturer && (
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{selected.lecturer}</p>
                      {selected.lecturer_email && (
                        <p className="text-xs text-blue-600 flex items-center gap-1">
                          <Mail size={10}/>{selected.lecturer_email}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {selected.schedule && (
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
                    <Calendar size={16} className="text-gray-500 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{selected.schedule}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
