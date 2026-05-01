'use client'
import { useEffect, useRef, useState } from 'react'
import TopBar from '@/components/TopBar'
import Alert from '@/components/Alert'
import { FileText, Printer, Send, Clock, CheckCircle } from 'lucide-react'

interface StudentReport {
  id: string; type: string; title: string; content: string
  status: string; shared_by: string; shared_at: string
  created_at: string; requested_by: string
}

interface MyData {
  name: string; reg_no: string; programme: string; faculty: string
  email: string; phone: string
}

interface Result { subject: string; marks: number; grade: string; semester: string }
interface Payment { amount: number; description: string; payment_date: string }
interface Invoice { invoice_no: string; total: number; status: string; term: string; year: string; currency: string }

export default function ReportPage() {
  const [reports, setReports]   = useState<StudentReport[]>([])
  const [student, setStudent]   = useState<MyData | null>(null)
  const [results, setResults]   = useState<Result[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [alert, setAlert]       = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [requesting, setRequesting] = useState(false)
  const [activeTab, setActiveTab]   = useState<'transcript' | 'ledger' | 'reports'>('transcript')

  const messageRef = useRef<HTMLTextAreaElement>(null)

  const load = () => {
    fetch('/api/student/reports').then(r => r.json()).then(setReports)
    fetch('/api/student/profile').then(r => r.json()).then(setStudent)
    fetch('/api/student/results').then(r => r.json()).then(setResults)
    fetch('/api/student/pay').then(r => r.json()).then(setPayments)
    fetch('/api/student/invoice').then(r => r.json()).then(d => setInvoices(d.invoices || []))
  }
  useEffect(load, [])

  const totalPaid    = payments.reduce((s, p) => s + Number(p.amount), 0)
  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.total), 0)
  const balance      = totalInvoiced - totalPaid
  const avgMarks     = results.length
    ? Math.round(results.reduce((s, r) => s + Number(r.marks), 0) / results.length * 10) / 10
    : 0

  async function requestLedger(e: React.FormEvent) {
    e.preventDefault()
    setRequesting(true)
    const res = await fetch('/api/student/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: messageRef.current?.value || '' }),
    })
    const d = await res.json()
    if (res.ok) {
      setAlert({ type: 'success', message: 'Ledger request sent to the finance office!' })
      if (messageRef.current) messageRef.current.value = ''
      load()
    } else {
      setAlert({ type: 'error', message: d.error })
    }
    setRequesting(false)
  }

  const sharedReports = reports.filter(r => r.status === 'shared' || r.status === 'completed')
  const pendingRequests = reports.filter(r => r.status === 'pending')

  return (
    <>
      <TopBar title="Reports & Ledger" subtitle="Your academic transcript and financial reports" regNo={student?.reg_no} />
      <main className="pt-28 lg:pt-16 px-4 lg:px-7 pb-8">
        <div className="mb-5 mt-2 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Reports & Ledger</h2>
            <p className="text-sm text-gray-400 mt-0.5">Academic transcript, financial ledger and admin reports</p>
          </div>
          <button onClick={() => window.print()}
            className="no-print flex items-center gap-2 px-4 py-2 border-2 border-gray-200
                       rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
            <Printer size={14} /> Print
          </button>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {[
            { id: 'transcript', label: '🎓 Academic Transcript' },
            { id: 'ledger',     label: '💳 Financial Ledger' },
            { id: 'reports',    label: `📄 Admin Reports ${sharedReports.length > 0 ? `(${sharedReports.length})` : ''}` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all
                ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── ACADEMIC TRANSCRIPT ── */}
        {activeTab === 'transcript' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 flex items-start gap-4 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg,#0f172a,#1a56db)' }}>
              <div>
                <h3 className="font-extrabold text-white text-base">Academic Transcript</h3>
                <p className="text-white/60 text-xs mt-0.5">
                  Generated: {new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}
                </p>
              </div>
            </div>

            <div className="p-5">
              {/* Student info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-5 mb-5 border-b border-gray-100">
                {[
                  ['Full Name',    student?.name || '—'],
                  ['Reg. Number',  student?.reg_no || '—'],
                  ['Programme',    student?.programme || '—'],
                  ['Average Score', `${avgMarks}%`],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{l}</p>
                    <p className="font-bold text-gray-900 text-sm">{v}</p>
                  </div>
                ))}
              </div>

              {results.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No results posted yet. Results will appear here once posted by the registrar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50">
                      <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase text-gray-400">Subject</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase text-gray-400">Marks</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase text-gray-400">Grade</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase text-gray-400 hidden sm:table-cell">Semester</th>
                    </tr></thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-4 py-2.5 font-medium text-xs sm:text-sm">{r.subject}</td>
                          <td className="px-4 py-2.5 font-bold text-xs sm:text-sm">{r.marks}%</td>
                          <td className="px-4 py-2.5">
                            <span className={`font-bold text-sm
                              ${r.grade==='A'?'text-emerald-600':r.grade==='B'?'text-blue-600':r.grade==='C'?'text-amber-600':'text-red-500'}`}>
                              {r.grade}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-400 hidden sm:table-cell">{r.semester}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr className="bg-gray-50 border-t border-gray-200">
                      <td className="px-4 py-2.5 font-bold text-sm">Average</td>
                      <td className="px-4 py-2.5 font-extrabold text-blue-600 text-sm">{avgMarks}%</td>
                      <td colSpan={2} />
                    </tr></tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FINANCIAL LEDGER ── */}
        {activeTab === 'ledger' && (
          <div className="space-y-5">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Invoiced', value: `USD ${totalInvoiced.toLocaleString()}`, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { label: 'Total Paid',     value: `USD ${totalPaid.toLocaleString()}`,     color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { label: 'Balance Due',    value: `USD ${balance.toLocaleString()}`,        color: balance > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              ].map(c => (
                <div key={c.label} className={`rounded-xl border p-4 ${c.color}`}>
                  <p className="text-xs font-bold uppercase tracking-wide opacity-70">{c.label}</p>
                  <p className="text-xl font-extrabold mt-1">{c.value}</p>
                </div>
              ))}
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-900">📄 Invoices</h3>
              </div>
              {invoices.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No invoices yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Invoice #</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Term</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Total</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Status</th>
                    </tr></thead>
                    <tbody>
                      {invoices.map(inv => (
                        <tr key={inv.invoice_no} className="border-t border-gray-100">
                          <td className="px-4 py-3 font-mono text-xs text-blue-600">{inv.invoice_no}</td>
                          <td className="px-4 py-3 text-xs">{inv.term} {inv.year}</td>
                          <td className="px-4 py-3 font-bold text-xs">{inv.currency} {Number(inv.total).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                              ${inv.status==='paid'?'bg-emerald-100 text-emerald-700':inv.status==='partial'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>
                              {inv.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Payment history */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-900">💳 Payment History</h3>
              </div>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No payments recorded.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Description</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Amount</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400 hidden sm:table-cell">Date</th>
                    </tr></thead>
                    <tbody>
                      {payments.map((p, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-4 py-3 text-xs font-medium">{p.description}</td>
                          <td className="px-4 py-3 font-bold text-emerald-600 text-xs">USD {Number(p.amount).toLocaleString()}</td>
                          <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">
                            {new Date(p.payment_date).toLocaleDateString('en-GB')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr className="bg-gray-50 border-t border-gray-200">
                      <td className="px-4 py-3 font-bold text-sm">Total Paid</td>
                      <td className="px-4 py-3 font-extrabold text-emerald-600 text-sm">USD {totalPaid.toLocaleString()}</td>
                      <td className="hidden sm:table-cell" />
                    </tr></tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Request ledger */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-900">📋 Request Official Ledger</h3>
              </div>
              <div className="px-5 py-5">
                {pendingRequests.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 mb-4 flex items-center gap-2">
                    <Clock size={15} />
                    You have a pending ledger request. The finance office will respond shortly.
                  </div>
                )}
                <form onSubmit={requestLedger} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Message to Finance Office (optional)
                    </label>
                    <textarea
                      ref={messageRef}
                      rows={3}
                      placeholder="e.g. Please provide my financial ledger for AUG 2025 semester..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                                 focus:border-blue-500 focus:outline-none resize-none bg-white"
                    />
                  </div>
                  <button type="submit" disabled={requesting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm
                               disabled:opacity-50 active:scale-95 transition-all"
                    style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
                    <Send size={14} />
                    {requesting ? 'Sending…' : 'Request Ledger from Finance Office'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── ADMIN REPORTS ── */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {sharedReports.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                <FileText size={40} className="mx-auto mb-4 opacity-30" />
                <p className="font-semibold">No reports shared yet</p>
                <p className="text-sm mt-1">
                  Reports and ledgers shared by the admin will appear here.
                  Use the Financial Ledger tab to request one.
                </p>
              </div>
            ) : (
              sharedReports.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                      <h3 className="font-bold text-sm text-gray-900">{r.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                        ${r.type === 'ledger_request' || r.type === 'ledger'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'}`}>
                        {r.type === 'ledger_request' || r.type === 'ledger' ? 'Ledger' : 'Report'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        Shared by {r.shared_by || 'Admin'}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {r.shared_at ? new Date(r.shared_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : ''}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 py-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {r.content}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </>
  )
}
