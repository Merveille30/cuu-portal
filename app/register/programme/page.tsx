'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { BookOpen, CheckCircle } from 'lucide-react'

interface Programme { id: string; name: string; code: string; faculty: string; duration: number }

export default function SelectProgrammePage() {
  const router = useRouter()
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [selected, setSelected]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    fetch('/api/student/programme').then(r => r.json()).then(setProgrammes)
  }, [])

  const faculties = [...new Set(programmes.map(p => p.faculty))]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) { setError('Please select a programme.'); return }
    setLoading(true)
    const res = await fetch('/api/student/programme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programme_id: selected }),
    })
    if (res.ok) router.push('/register/modules')
    else { const d = await res.json(); setError(d.error) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white py-6 px-6 text-center" style={{ background: 'linear-gradient(135deg,#0f172a,#1a56db)' }}>
        <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-3 border-3 border-white/20 bg-white">
          <Image src="/cuu-logo.svg" alt="CUU" width={56} height={56} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-xl font-extrabold">Step 1 of 4 — Select Your Programme</h1>
        <p className="text-white/60 text-sm mt-1">Choose the academic programme you wish to enroll in</p>
        <StepBar step={1} />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-5">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {faculties.map(faculty => (
            <div key={faculty} className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">{faculty}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {programmes.filter(p => p.faculty === faculty).map(p => (
                  <div key={p.id} onClick={() => setSelected(p.id)}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${selected === p.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                      ${selected === p.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                      {selected === p.id && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${selected === p.id ? 'text-blue-700' : 'text-gray-800'}`}>{p.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.code} · {p.duration} year{p.duration > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button type="submit" disabled={loading || !selected}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 active:scale-95 transition-all mt-4"
            style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
            {loading ? 'Saving…' : 'Continue to Module Registration →'}
          </button>
        </form>
      </div>
    </div>
  )
}

function StepBar({ step }: { step: number }) {
  const steps = ['Programme', 'Modules', 'Documents', 'Invoice']
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
            ${i + 1 === step ? 'bg-white text-blue-700' : i + 1 < step ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
              ${i + 1 === step ? 'bg-blue-600 text-white' : i + 1 < step ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white/50'}`}>
              {i + 1 < step ? '✓' : i + 1}
            </span>
            {s}
          </div>
          {i < steps.length - 1 && <div className="w-4 h-px bg-white/30" />}
        </div>
      ))}
    </div>
  )
}
