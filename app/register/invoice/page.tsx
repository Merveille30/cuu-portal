'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FileText, Printer } from 'lucide-react'

interface Invoice {
  id: string; invoice_no: string; term: string; year: string; semester: number
  tuition: number; registration_fee: number; other_fees: number; total: number
  currency: string; due_date: string; status: string; created_at: string
}
interface Student {
  name: string; reg_no: string; programme: string; faculty: string
  shift: string; semester_in_program: number; current_term: string; current_year: string
}

export default function InvoicePage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [student, setStudent]   = useState<Student | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError]       = useState('')

  const load = () => {
    fetch('/api/student/invoice').then(r => r.json()).then(d => {
      setInvoices(d.invoices || [])
      setStudent(d.student)
    })
  }
  useEffect(() => { load() }, [])

  async function generateInvoice() {
    setGenerating(true); setError('')
    const res = await fetch('/api/student/invoice', { method: 'POST' })
    const d = await res.json()
    if (res.ok) load()
    else setError(d.error)
    setGenerating(false)
  }

  const latest = invoices[0]

  // Payment options
  const options = latest ? [
    { label: 'Option A', desc: 'Register and pay 100% by due date', total: latest.total, discount: Math.round(latest.total * 0.13), pct: '13%', minFirst: null },
    { label: 'Option B', desc: 'Register by 25th; pay 50% by due date', total: latest.total + 15, discount: 15, pct: '3%', minFirst: Math.round((latest.total + 15) * 0.5) },
    { label: 'Option C', desc: 'Register by 1st; pay 50% by due date', total: latest.total + 10, discount: 10, pct: '2%', minFirst: Math.round((latest.total + 10) * 0.5) },
    { label: 'Option D', desc: 'Register and pay 50% by due date', total: latest.total, discount: 0, pct: '0%', minFirst: Math.round(latest.total * 0.5) },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-white py-6 px-6 text-center" style={{ background: 'linear-gradient(135deg,#0f172a,#1a56db)' }}>
        <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-3 border-3 border-white/20 bg-white">
          <Image src="/cuu-logo.svg" alt="CUU" width={56} height={56} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-xl font-extrabold">Step 4 of 4 — Your Invoice</h1>
        <p className="text-white/60 text-sm mt-1">Review your proforma invoice and proceed to payment</p>
        <StepBar step={4} />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-5">⚠️ {error}</div>}

        {!latest ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <FileText size={40} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 font-semibold mb-2">No invoice generated yet</p>
            <p className="text-sm text-gray-400 mb-6">Click below to generate your proforma invoice</p>
            <button onClick={generateInvoice} disabled={generating}
              className="px-8 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
              {generating ? 'Generating…' : 'Generate Invoice'}
            </button>
          </div>
        ) : (
          <>
            {/* Invoice document */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6" id="invoice-print">
              {/* Invoice header */}
              <div className="px-6 py-5 border-b border-gray-200 flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0 bg-white">
                  <Image src="/cuu-logo.svg" alt="CUU" width={64} height={64} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Cavendish University Uganda</h2>
                  <p className="text-sm text-gray-500">Plot 1469 Ggaba Road, Nsambya, Kampala, UGANDA</p>
                  <p className="text-sm text-gray-500">+256 414 531 700 | www.cavendish.ac.ug</p>
                </div>
                <button onClick={() => window.print()} className="ml-auto flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 no-print">
                  <Printer size={13} /> Print
                </button>
              </div>

              <div className="px-6 py-5">
                <h3 className="font-bold text-gray-900 mb-4 text-base">Student Proforma Invoice</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-6">
                  {[
                    ['Invoice #', latest.invoice_no],
                    ['Date', new Date(latest.created_at).toLocaleDateString('en-GB')],
                    ['Name', student?.name || ''],
                    ['Student ID', student?.reg_no || '—'],
                    ['Term | Year', `${latest.term} | ${latest.year}`],
                    ['Semester in Program', String(latest.semester)],
                    ['Program', student?.programme || ''],
                    ['Faculty | Shift', `${student?.faculty || ''} | ${student?.shift || 'Day'}`],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <p className="text-xs text-gray-400 font-semibold">{l}</p>
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm">{v}</p>
                    </div>
                  ))}
                </div>

                {/* Gross amount */}
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-5">
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                    <h4 className="font-bold text-sm text-gray-900">Gross Proforma Invoice Amount ({latest.currency})</h4>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 text-gray-600">Tuition</td>
                        <td className="px-4 py-3 text-right font-semibold">{latest.tuition.toLocaleString()}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 text-gray-600">Registration Fee</td>
                        <td className="px-4 py-3 text-right font-semibold">{latest.registration_fee.toLocaleString()}</td>
                      </tr>
                      {latest.other_fees > 0 && (
                        <tr className="border-b border-gray-100">
                          <td className="px-4 py-3 text-gray-600">Other Fees</td>
                          <td className="px-4 py-3 text-right font-semibold">{latest.other_fees.toLocaleString()}</td>
                        </tr>
                      )}
                      <tr className="bg-gray-50">
                        <td className="px-4 py-3 font-extrabold text-gray-900">Total</td>
                        <td className="px-4 py-3 text-right font-extrabold text-gray-900">
                          {latest.currency} {latest.total.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Payment options */}
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-5">
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                    <h4 className="font-bold text-sm text-gray-900">Payment Options & Discounts ({latest.currency})</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500">Option</th>
                          <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500">Total Balance</th>
                          <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500">Min. First Payment</th>
                          <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500">Savings</th>
                          <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {options.map(opt => (
                          <tr key={opt.label} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <p className="font-bold text-gray-900 text-xs">{opt.label}</p>
                              <p className="text-[11px] text-gray-400">{opt.desc}</p>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold">{(opt.total - opt.discount).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">{opt.minFirst ? opt.minFirst.toLocaleString() : (opt.total - opt.discount).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-emerald-600 font-semibold">{opt.discount > 0 ? opt.discount.toLocaleString() : 'none'}</td>
                            <td className="px-4 py-3 text-right text-emerald-600 font-semibold">{opt.pct}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="text-xs text-gray-500 italic mb-4">
                  Note: To &apos;Register&apos; means to register with the Enrollment Department and pay at least 20% of your total Invoiced Amount.
                </p>

                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold
                  ${latest.status === 'paid' ? 'bg-emerald-100 text-emerald-700'
                    : latest.status === 'partial' ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'}`}>
                  Status: {latest.status.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Proceed to payment */}
            {latest.status !== 'paid' && (
              <button onClick={() => router.push('/finance/pay')}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg,#0e9f6e,#059669)' }}>
                Proceed to Payment →
              </button>
            )}
            {latest.status === 'paid' && (
              <button onClick={() => router.push('/dashboard')}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
                Go to Student Portal →
              </button>
            )}
          </>
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
