'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { BookOpen, CheckSquare, Square, ArrowLeft } from 'lucide-react'

interface Module {
  id: string; code: string; name: string; credits: number
  year: number; semester: number; description: string
  lecturer: string; schedule: string
}

export default function RegisterModulesPage() {
  const router = useRouter()
  const [modules, setModules]       = useState<Module[]>([])
  const [registered, setRegistered] = useState<Set<string>>(new Set())
  const [selected, setSelected]     = useState<Set<string>>(new Set())
  const [loading, setLoading]       = useState(false)
  const [fetching, setFetching]     = useState(true)
  const [error, setError]           = useState('')
  const [apiMsg, setApiMsg]         = useState('')
  const [term, setTerm]             = useState('AUG')
  const [year, setYear]             = useState(String(new Date().getFullYear()))

  useEffect(() => {
    setFetching(true)
    fetch('/api/student/modules')
      .then(r => r.json())
      .then(d => {
        if (d.error === 'no_programme') {
          setApiMsg('no_programme')
        } else if (d.error === 'no_modules') {
          setApiMsg('no_modules')
        } else {
          setModules(d.modules || [])
          const regSet = new Set<string>(d.registeredIds || [])
          setRegistered(regSet)
          setSelected(new Set(regSet))
        }
      })
      .catch(() => setError('Failed to load modules. Please refresh.'))
      .finally(() => setFetching(false))
  }, [])

  function toggle(id: string) {
    if (registered.has(id)) return
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(modules.map(m => m.id)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selected.size === 0) { setError('Select at least one module.'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/student/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module_ids: [...selected], term, year }),
    })
    const d = await res.json()
    if (res.ok) router.push('/register/documents')
    else setError(d.error || 'Failed to register modules.')
    setLoading(false)
  }

  const byYear: Record<number, Module[]> = {}
  modules.forEach(m => { (byYear[m.year] = byYear[m.year] || []).push(m) })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white py-5 px-4 text-center"
        style={{ background: 'linear-gradient(135deg,#0f172a,#1a56db)' }}>
        <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-3 border-3 border-white/20 bg-white">
          <Image src="/cuu-logo.svg" alt="CUU" width={56} height={56}
            className="w-full h-full object-cover" />
        </div>
        <h1 className="text-lg font-extrabold">Step 2 of 4 — Register Modules</h1>
        <p className="text-white/60 text-xs mt-1">Select the modules you wish to take this semester</p>
        <StepBar step={2} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Back button */}
        <button onClick={() => router.push('/register/programme')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft size={15} /> Back to Programme Selection
        </button>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* No programme selected */}
        {apiMsg === 'no_programme' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <BookOpen size={32} className="mx-auto mb-3 text-amber-500" />
            <p className="font-bold text-amber-800 mb-2">No Programme Selected</p>
            <p className="text-sm text-amber-700 mb-4">
              You need to select your programme before registering modules.
            </p>
            <button onClick={() => router.push('/register/programme')}
              className="px-6 py-2.5 rounded-xl text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
              Select Programme →
            </button>
          </div>
        )}

        {/* No modules in DB */}
        {apiMsg === 'no_modules' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <BookOpen size={32} className="mx-auto mb-3 text-blue-500" />
            <p className="font-bold text-blue-800 mb-2">Modules Not Set Up Yet</p>
            <p className="text-sm text-blue-700 mb-4">
              The admin needs to run <strong>FINAL_SETUP.sql</strong> in Supabase to add modules.
              Once done, refresh this page.
            </p>
            <button onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
              Refresh Page
            </button>
          </div>
        )}

        {/* Loading */}
        {fetching && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Modules list */}
        {!fetching && modules.length > 0 && (
          <>
            {/* Term/Year + Select All */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Term</label>
                  <select value={term} onChange={e => setTerm(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                               focus:border-blue-500 focus:outline-none bg-white">
                    <option>JAN</option><option>MAY</option><option>AUG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Year</label>
                  <select value={year} onChange={e => setYear(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                               focus:border-blue-500 focus:outline-none bg-white">
                    {[2024,2025,2026].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-blue-600">{selected.size}</span> of {modules.length} modules selected
                </p>
                <button type="button" onClick={selectAll}
                  className="text-xs text-blue-600 font-semibold hover:underline">
                  Select All
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {Object.entries(byYear).map(([yr, mods]) => (
                <div key={yr} className="mb-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">
                    Year {yr}
                  </h3>
                  <div className="space-y-2">
                    {mods.map(m => {
                      const isReg = registered.has(m.id)
                      const isSel = selected.has(m.id)
                      return (
                        <div key={m.id} onClick={() => toggle(m.id)}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all
                            ${isReg
                              ? 'border-emerald-400 bg-emerald-50 cursor-default'
                              : isSel
                              ? 'border-blue-500 bg-blue-50 cursor-pointer'
                              : 'border-gray-200 bg-white hover:border-blue-300 cursor-pointer'
                            }`}>
                          <div className="flex-shrink-0 mt-0.5">
                            {isReg
                              ? <CheckSquare size={18} className="text-emerald-500" />
                              : isSel
                              ? <CheckSquare size={18} className="text-blue-500" />
                              : <Square size={18} className="text-gray-300" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="min-w-0">
                                <span className="font-bold text-sm text-gray-900 block">{m.name}</span>
                                <span className="text-[11px] font-mono text-gray-400">{m.code}</span>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-semibold">
                                  {m.credits} cr
                                </span>
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                                  Sem {m.semester}
                                </span>
                                {isReg && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">
                                    ✓ Registered
                                  </span>
                                )}
                              </div>
                            </div>
                            {m.description && (
                              <p className="text-xs text-gray-500 mt-1">{m.description}</p>
                            )}
                            <div className="flex flex-wrap gap-3 mt-1.5">
                              {m.lecturer && (
                                <span className="text-[11px] text-gray-400">👤 {m.lecturer}</span>
                              )}
                              {m.schedule && (
                                <span className="text-[11px] text-gray-400">🕐 {m.schedule}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              <button type="submit" disabled={loading || selected.size === 0}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm
                           disabled:opacity-50 active:scale-95 transition-all mt-2"
                style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
                {loading ? 'Saving…' : `Register ${selected.size} Module${selected.size !== 1 ? 's' : ''} & Continue →`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function StepBar({ step }: { step: number }) {
  const steps = ['Programme', 'Modules', 'Documents', 'Invoice']
  return (
    <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5">
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
            ${i+1===step?'bg-white text-blue-700':i+1<step?'bg-white/20 text-white':'bg-white/10 text-white/50'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
              ${i+1===step?'bg-blue-600 text-white':i+1<step?'bg-emerald-500 text-white':'bg-white/20 text-white/50'}`}>
              {i+1<step?'✓':i+1}
            </span>
            {s}
          </div>
          {i<steps.length-1&&<div className="w-3 h-px bg-white/30"/>}
        </div>
      ))}
    </div>
  )
}
