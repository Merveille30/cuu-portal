'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react'

interface StudentDetail {
  student: Record<string, string>
  documents: { id: string; doc_type: string; file_name: string; file_url: string; status: string; admin_note: string; created_at: string }[]
  invoices:  { id: string; invoice_no: string; total: number; status: string; term: string; year: string; currency: string }[]
  payments:  { id: string; amount: number; method: string; payment_date: string; description: string }[]
  results:   { id: string; subject: string; marks: number; grade: string; semester: string }[]
  modules:   { id: string; status: string; modules: { name: string; code: string } }[]
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData]   = useState<StudentDetail | null>(null)
  const [note, setNote]   = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [tab, setTab]     = useState('overview')

  const load = () => {
    fetch(`/api/admin/students/${id}`).then(r => r.json()).then(setData)
  }
  useEffect(() => { load() }, [id])

  async function handleDoc(docId: string, action: 'approve' | 'reject') {
    setLoading(docId)
    await fetch(`/api/admin/documents/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, admin_note: note }),
    })
    setLoading(null); setNote(''); load()
  }

  if (!data) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>

  const s = data.student
  const totalPaid = data.payments.reduce((sum, p) => sum + Number(p.amount), 0)

  const TABS = ['overview','documents','modules','results','finance']

  return (
    <main className="pt-14 lg:pt-0 px-4 lg:px-7 py-8">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/admin/students" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft size={16}/> Back
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">{s.name}</h1>
          <p className="text-sm text-gray-400">{s.reg_no || 'No reg no'} · {s.programme || 'No programme'}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold
          ${s.reg_status==='active'?'bg-green-100 text-green-700':s.reg_status==='documents_uploaded'?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-700'}`}>
          {s.reg_status?.replace(/_/g,' ')}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all capitalize
              ${tab===t?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-sm text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-2.5 text-sm">
              {[['Name',s.name],['Email',s.email||'—'],['Phone',s.phone||'—'],['Gender',s.gender||'—'],
                ['Nationality',s.nationality||'—'],['Date of Birth',s.date_of_birth||'—'],
                ['Address',s.address||'—'],['Next of Kin',s.next_of_kin_name||'—'],
                ['NOK Phone',s.next_of_kin_phone||'—']].map(([l,v])=>(
                <div key={l} className="flex gap-2 flex-wrap">
                  <span className="w-28 text-gray-400 font-semibold text-xs flex-shrink-0">{l}</span>
                  <span className="text-gray-800 text-xs">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-sm text-gray-900 mb-4">Academic & Finance Summary</h3>
            <div className="space-y-2.5 text-sm">
              {[['Programme',s.programme||'—'],['Faculty',s.faculty||'—'],['Shift',s.shift||'Day'],
                ['Semester',s.semester_in_program||'1'],['Term',s.current_term||'—'],['Year',s.current_year||'—'],
                ['Modules',String(data.modules.length)],['Results',String(data.results.length)],
                ['Total Paid',`USD ${totalPaid.toLocaleString()}`]].map(([l,v])=>(
                <div key={l} className="flex gap-2 flex-wrap">
                  <span className="w-28 text-gray-400 font-semibold text-xs flex-shrink-0">{l}</span>
                  <span className="text-gray-800 text-xs font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Documents */}
      {tab === 'documents' && (
        <div className="space-y-4">
          {data.documents.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">No documents submitted.</div>
          ) : data.documents.map(doc => (
            <div key={doc.id} className={`bg-white rounded-xl border-2 p-5
              ${doc.status==='approved'?'border-emerald-300':doc.status==='rejected'?'border-red-300':'border-amber-300'}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-bold text-sm capitalize">{doc.doc_type.replace(/_/g,' ')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{doc.file_name}</p>
                  {doc.admin_note && <p className="text-xs text-gray-500 mt-0.5 italic">Note: {doc.admin_note}</p>}
                </div>
                <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full
                  ${doc.status==='approved'?'bg-emerald-100 text-emerald-700':doc.status==='rejected'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>
                  {doc.status==='approved'?<CheckCircle size={11}/>:doc.status==='rejected'?<XCircle size={11}/>:<Clock size={11}/>}
                  {doc.status}
                </span>
              </div>
              {doc.file_url?.startsWith('data:image') && (
                <img src={doc.file_url} alt="doc" className="mt-3 w-full max-h-40 object-contain rounded-xl border border-gray-200" />
              )}
              {doc.status === 'pending' && (
                <div className="mt-4 space-y-2">
                  <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Admin note (optional)"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-xs focus:border-blue-500 focus:outline-none resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => handleDoc(doc.id, 'approve')} disabled={loading===doc.id}
                      className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#0e9f6e,#059669)' }}>
                      ✓ Approve
                    </button>
                    <button onClick={() => handleDoc(doc.id, 'reject')} disabled={loading===doc.id}
                      className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#e02424,#dc2626)' }}>
                      ✗ Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modules */}
      {tab === 'modules' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Module</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Code</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Status</th>
            </tr></thead>
            <tbody>
              {data.modules.map(m => (
                <tr key={m.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-xs">{m.modules?.name || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.modules?.code || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                      ${m.status==='completed'?'bg-emerald-100 text-emerald-700':m.status==='failed'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.modules.length === 0 && <tr><td colSpan={3} className="px-4 py-10 text-center text-gray-400 text-sm">No modules registered.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Results */}
      {tab === 'results' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Subject</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Marks</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Grade</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Semester</th>
            </tr></thead>
            <tbody>
              {data.results.map(r => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-xs">{r.subject}</td>
                  <td className="px-4 py-3 font-bold text-xs">{r.marks}%</td>
                  <td className="px-4 py-3"><span className={`font-bold text-sm ${r.grade==='A'?'text-emerald-600':r.grade==='B'?'text-blue-600':r.grade==='C'?'text-amber-600':'text-red-500'}`}>{r.grade}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.semester}</td>
                </tr>
              ))}
              {data.results.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400 text-sm">No results recorded.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Finance */}
      {tab === 'finance' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-sm">Invoices</h3></div>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Invoice #</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Term</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Total</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Status</th>
              </tr></thead>
              <tbody>
                {data.invoices.map(inv => (
                  <tr key={inv.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">{inv.invoice_no}</td>
                    <td className="px-4 py-3 text-xs">{inv.term} {inv.year}</td>
                    <td className="px-4 py-3 font-bold text-xs">{inv.currency} {Number(inv.total).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${inv.status==='paid'?'bg-emerald-100 text-emerald-700':inv.status==='partial'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>{inv.status}</span></td>
                  </tr>
                ))}
                {data.invoices.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">No invoices.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm">Payments</h3>
              <span className="font-bold text-emerald-600 text-sm">Total: USD {totalPaid.toLocaleString()}</span>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Amount</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Method</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Date</th>
              </tr></thead>
              <tbody>
                {data.payments.map(p => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-bold text-emerald-600 text-xs">USD {Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs">{p.method}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(p.payment_date).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
                {data.payments.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">No payments.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}
