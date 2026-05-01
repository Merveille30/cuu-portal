'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { BookOpen } from 'lucide-react'

interface Module { id: string; code: string; name: string; credits: number; year: number; semester: number; description: string; lecturer: string; schedule: string }

export default function RegisterModulesPage() {
  const router = useRouter()
  const [modules, setModules]       = useState<Module[]>([])
  const [registered, setRegistered] = useState<Set<string>>(new Set())
  const [selected, setSelected]     = useState<Set<string>>(new Set())
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [term, setTerm]             = useState('AUG')
  const [year, setYear]             = useState(String(new Date().getFullYear()))

  useEffect(() => {
    fetch('/api/student/modules').then(r => r.json()).then(d => {
      setModules(d.modules || [])
      const regSet = new Set<string>(d.registeredIds || [])
      setRegistered(regSet)
      setSelected(new Set(regSet))
    })
  }, [])

  function toggle(id: string) {
    if (registered.has(id)) return // can't deselect already registered
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selected.size === 0) { setError('Select at least one module.'); return }
    setLoading(true)
    const res = await fetch('/api/student/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module_ids: [...selected], term, year }),
    })
    if (res.ok) router.push('/register/documents')
    else { const d = await res.json(); setError(d.error) }
    setLoading(false)
  }

  const byYear: Record<number, Module[]> = {}
  modules.forEach(m => { (byYear[m.year] = byYear[m.year] || []).push(m) })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-white py-6 px-6 text-center" style={{ background: 'linear-gradient(135deg,#0f172a,#1a56db)' }}>
        <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-3 border-3 border-white/20 bg-white">
          <Image src="/cuu-logo.svg" alt="CUU" width={56} height={56} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-xl font-extrabold">Step 2 of 4 — Register Modules</h1>
        <p className="text-white/60 text-sm mt-1">Select the modules you wish to take this semester</p>
        <StepBar step={2} />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-5">⚠️ {error}</div>}

        {/* Term/Year selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Term</label>
            <select value={term} onChange={e => setTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white">
              <option>JAN</option><option>MAY</option><option>AUG</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Year</label>
            <select value={year} onChange={e => setYear(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white">
              {[2024,2025,2026].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {modules.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
            <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
            <p>No modules found for your programme. Contact the registrar.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {Object.entries(byYear).map(([yr, mods]) => (
              <div key={yr} className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Year {yr}</h3>
                <div className="space-y-3">
                  {mods.map(m => {
                    const isReg = registered.has(m.id)
                    const isSel = selected.has(m.id)
                    return (
                      <div key={m.id} onClick={() => toggle(m.id)}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all
                          ${isReg ? 'border-emerald-400 bg-emerald-50 cursor-default'
                            : isSel ? 'border-blue-500 bg-blue-50 cursor-pointer'
                            : 'border-gray-200 bg-white hover:border-blue-300 cursor-pointer'}`}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                          ${isReg ? 'border-emerald-500 bg-emerald-500' : isSel ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                          {(isReg || isSel) && <span className="text-white text-[10px] font-bold">✓</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-gray-900">{m.name}</span>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">{m.code}</span>
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{m.credits} credits</span>
                            {isReg && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-semibold">Registered</span>}
                          </div>
                          {m.description && <p className="text-xs text-gray-500 mt-1">{m.description}</p>}
                          {m.lecturer && <p className="text-xs text-gray-400 mt-0.5">👤 {m.lecturer}</p>}
                          {m.schedule  && <p className="text-xs text-gray-400">🕐 {m.schedule}</p>}
                        </div>
                        <div className="text-xs text-gray-400 flex-shrink-0">Sem {m.semester}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 mb-4">
              {selected.size} module{selected.size !== 1 ? 's' : ''} selected
            </div>

            <button type="submit" disabled={loading || selected.size === 0}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
              {loading ? 'Saving…' : 'Continue to Document Upload →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function StepBar({ step }: { step: number }) {
  const steps = ['Programme', 'Modules', 'Documents', 'Invoice']
  return (
    <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
            ${i+1===step?'bg-white text-blue-700':i+1<step?'bg-white/20 text-white':'bg-white/10 text-white/50'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
              ${i+1===step?'bg-blue-600 text-white':i+1<step?'bg-emerald-500 text-white':'bg-white/20 text-white/50'}`}>
              {i+1<step?'✓':i+1}
            </span>
            {s}
          </div>
          {i<steps.length-1&&<div className="w-4 h-px bg-white/30"/>}
        </div>
      ))}
    </div>
  )
}
