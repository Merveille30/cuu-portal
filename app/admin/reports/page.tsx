'use client'
import { useEffect, useRef, useState } from 'react'
import { Clock, CheckCircle, Send, FileText } from 'lucide-react'

interface ReportRequest {
  id: string; student_id: string; type: string; title: string
  content: string; status: string; created_at: string; requested_by: string
  students: { name: string; reg_no: string; programme: string }
}
interface Student { id: string; name: string; reg_no: string }

export default function AdminReportsPage() {
  const [requests, setRequests] = useState<ReportRequest[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [active, setActive]     = useState<ReportRequest | null>(null)
  const [success, setSuccess]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [tab, setTab]           = useState<'requests' | 'new'>('requests')

  const studentRef  = useRef<HTMLSelectElement>(null)
  const titleRef    = useRef<HTMLInputElement>(null)
  const contentRef  = useRef<HTMLTextAreaElement>(null)
  const typeRef     = useRef<HTMLSelectElement>(null)

  const load = () => {
    fetch('/api/admin/reports').then(r => r.json()).then(setRequests)
    fetch('/api/admin/students').then(r => r.json()).then(setStudents)
  }
  useEffect(load, [])

  async function handleRespond(e: React.FormEvent) {
    e.preventDefault()
    if (!active) return
    setLoading(true); setError(''); setSuccess('')
    const res = await fetch('/api/admin/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: active.student_id,
        title:      titleRef.current?.value || active.title,
        content:    contentRef.current?.value || '',
        type:       active.type,
        report_id:  active.id,
      }),
    })
    const d = await res.json()
    if (res.ok) {
      setSuccess('Report shared with student. They have been notified.')
      setActive(null)
      load()
    } else setError(d.error)
    setLoading(false)
  }

  async function handleNew(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const res = await fetch('/api/admin/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentRef.current?.value,
        title:      titleRef.current?.value,
        content:    contentRef.current?.value,
        type:       typeRef.current?.value || 'report',
      }),
    })
    const d = await res.json()
    if (res.ok) {
      setSuccess('Report shared with student successfully!')
      if (contentRef.current) contentRef.current.value = ''
      if (titleRef.current)   titleRef.current.value   = ''
    } else setError(d.error)
    setLoading(false)
  }

  const pending   = requests.filter(r => r.status === 'pending')
  const completed = requests.filter(r => r.status !== 'pending')

  return (
    <main className="pt-14 lg:pt-0 px-4 lg:px-7 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Reports & Ledgers</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage student report requests and share ledgers/reports
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
            ${tab==='requests'?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          📋 Requests {pending.length > 0 && <span className="ml-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">{pending.length}</span>}
        </button>
        <button onClick={() => setTab('new')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
            ${tab==='new'?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          ➕ Share New Report
        </button>
      </div>

      {success && <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-sm mb-4">✅ {success}</div>}
      {error   && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-4">⚠️ {error}</div>}

      {/* Requests tab */}
      {tab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <FileText size={36} className="mx-auto mb-3 opacity-30" />
              <p>No report requests yet.</p>
            </div>
          )}

          {pending.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">
                ⏳ Pending Requests ({pending.length})
              </h3>
              {pending.map(r => (
                <div key={r.id} className="bg-white rounded-xl border-2 border-amber-300 p-5 mb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className="text-amber-500" />
                        <p className="font-bold text-sm text-gray-900">{r.students?.name || 'Unknown'}</p>
                        <span className="text-xs text-gray-400">{r.students?.reg_no}</span>
                      </div>
                      <p className="text-xs text-gray-500">{r.students?.programme}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Requested: {new Date(r.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </p>
                      {r.content && r.content !== 'Student has requested a financial ledger.' && (
                        <p className="text-xs text-gray-600 mt-2 italic">"{r.content}"</p>
                      )}
                    </div>
                    <button onClick={() => { setActive(r); setTab('requests') }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs"
                      style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
                      <Send size={12} /> Respond
                    </button>
                  </div>

                  {/* Inline response form */}
                  {active?.id === r.id && (
                    <form onSubmit={handleRespond} className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Report Title</label>
                        <input ref={titleRef} type="text" required
                          defaultValue={`Financial Ledger — ${r.students?.name}`}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Ledger / Report Content
                        </label>
                        <textarea ref={contentRef} required rows={8}
                          placeholder={`Financial Ledger for ${r.students?.name}\nReg No: ${r.students?.reg_no}\n\nTuition Fee: USD 495\nRegistration Fee: USD 20\nTotal Invoiced: USD 515\n\nPayments Made:\n- [Date]: USD [Amount] via [Method]\n\nBalance Due: USD [Amount]\n\nIssued by: Finance Office\nDate: ${new Date().toLocaleDateString('en-GB')}`}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none resize-none bg-white font-mono" />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={loading}
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg,#0e9f6e,#059669)' }}>
                          <Send size={13} /> {loading ? 'Sending…' : 'Share with Student'}
                        </button>
                        <button type="button" onClick={() => setActive(null)}
                          className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                ✅ Completed ({completed.length})
              </h3>
              {completed.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 mb-2 flex items-center gap-3">
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{r.students?.name}</p>
                    <p className="text-xs text-gray-400">{r.title}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(r.created_at).toLocaleDateString('en-GB')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New report tab */}
      {tab === 'new' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">Share Report / Ledger with Student</h3>
            </div>
            <div className="px-5 py-5">
              <form onSubmit={handleNew} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Student</label>
                  <select ref={studentRef} required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">— Select student —</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} {s.reg_no ? `(${s.reg_no})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
                    <select ref={typeRef}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white">
                      <option value="ledger">Financial Ledger</option>
                      <option value="report">Academic Report</option>
                      <option value="clearance">Clearance Letter</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title</label>
                    <input ref={titleRef} type="text" required placeholder="e.g. Financial Ledger AUG 2025"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Content</label>
                  <textarea ref={contentRef} required rows={10}
                    placeholder="Enter the full report or ledger content here..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none resize-none bg-white font-mono" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
                  <Send size={14} /> {loading ? 'Sharing…' : 'Share with Student & Notify'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
