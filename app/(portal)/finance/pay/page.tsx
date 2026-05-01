'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import { CreditCard, Smartphone, Building2, CheckCircle } from 'lucide-react'

interface Invoice { id: string; invoice_no: string; total: number; status: string; currency: string; term: string; year: string }

const METHODS = [
  { id: 'Mobile Money', label: 'Mobile Money', icon: Smartphone, desc: 'MTN MoMo / Airtel Money', color: 'text-yellow-600 bg-yellow-50' },
  { id: 'Bank Transfer', label: 'Bank Transfer', icon: Building2, desc: 'Stanbic / DFCU / DTB / UBA', color: 'text-blue-600 bg-blue-50' },
  { id: 'Card', label: 'Debit / Credit Card', icon: CreditCard, desc: 'Visa / Mastercard', color: 'text-purple-600 bg-purple-50' },
]

const BANK_DETAILS = [
  { bank: 'Stanbic Bank (USD)', account: '9030010055864', swift: 'SBICUGKXXXX', branch: 'Metro Branch' },
  { bank: 'DFCU Bank (USD)',    account: '02983501001237', swift: 'DFCUUGKA',   branch: 'Kireka Branch' },
  { bank: 'Stanbic Bank (UGX)', account: '9030009908853', swift: 'SBICUGKXXXX', branch: 'Metro Branch' },
  { bank: 'Diamond Trust (UGX)',account: '0400001001',    swift: 'DTKEUGKAXXX', branch: 'Wandegeya Branch' },
]

export default function PayPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [student, setStudent]   = useState<Record<string, string> | null>(null)
  const [method, setMethod]     = useState('Mobile Money')
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const amountRef    = useRef<HTMLInputElement>(null)
  const referenceRef = useRef<HTMLInputElement>(null)
  const invoiceRef   = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    fetch('/api/student/invoice').then(r => r.json()).then(d => {
      setInvoices((d.invoices || []).filter((i: Invoice) => i.status !== 'paid'))
      setStudent(d.student)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount    = parseFloat(amountRef.current?.value || '0')
    const reference = referenceRef.current?.value || ''
    const invoiceId = invoiceRef.current?.value || ''
    if (!amount || amount <= 0) { setError('Enter a valid amount.'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/student/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id: invoiceId || null, amount, method, reference, description: 'Tuition Fee' }),
    })
    const d = await res.json()
    if (res.ok) setSuccess(true)
    else setError(d.error)
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Payment Recorded!</h2>
        <p className="text-sm text-gray-500 mb-6">Your payment has been successfully recorded. You will receive a confirmation notification.</p>
        <button onClick={() => router.push('/finance')}
          className="w-full py-3 rounded-xl text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
          Back to Finance
        </button>
      </div>
    </div>
  )

  return (
    <>
      <TopBar title="Make Payment" subtitle="Pay your tuition and fees" regNo={student?.reg_no} />
      <main className="pt-28 lg:pt-16 px-4 lg:px-7 pb-8">
        <div className="mb-5 mt-2">
          <h2 className="text-xl font-extrabold text-gray-900">Fee Payment</h2>
          <p className="text-sm text-gray-400 mt-0.5">Select your payment method and enter details</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-5">⚠️ {error}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Payment form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">💳 Payment Details</h3>
            </div>
            <div className="px-5 py-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Invoice selector */}
                {invoices.length > 0 && (
                  <div>
                    <label htmlFor="pay-inv" className="block text-xs font-semibold text-gray-600 mb-1.5">Invoice</label>
                    <select id="pay-inv" ref={invoiceRef}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white">
                      <option value="">Select invoice (optional)</option>
                      {invoices.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoice_no} — {inv.currency} {Number(inv.total).toLocaleString()} ({inv.term} {inv.year})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Payment method */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Payment Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {METHODS.map(m => (
                      <div key={m.id} onClick={() => setMethod(m.id)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all text-center
                          ${method === m.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.color}`}>
                          <m.icon size={16} />
                        </div>
                        <p className="text-xs font-bold text-gray-900">{m.label}</p>
                        <p className="text-[10px] text-gray-400">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label htmlFor="pay-amt" className="block text-xs font-semibold text-gray-600 mb-1.5">Amount (USD)</label>
                  <input id="pay-amt" ref={amountRef} type="number" required min="1" step="0.01" placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white" />
                </div>

                {/* Reference */}
                <div>
                  <label htmlFor="pay-ref" className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Transaction Reference / Receipt No.
                  </label>
                  <input id="pay-ref" ref={referenceRef} type="text" placeholder="e.g. MTN-123456789"
                    autoComplete="off"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white" />
                </div>

                {method === 'Mobile Money' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-xs text-yellow-700">
                    📱 Send payment to: <strong>MTN MoMo: 0772 000 000</strong> or <strong>Airtel: 0752 000 000</strong><br />
                    Name: Cavendish University Uganda. Then enter your transaction ID above.
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg,#0e9f6e,#059669)' }}>
                  {loading ? 'Processing…' : 'Submit Payment'}
                </button>
              </form>
            </div>
          </div>

          {/* Bank details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">🏦 Bank Details</h3>
            </div>
            <div className="px-5 py-5">
              <p className="text-xs font-bold text-red-600 mb-4 uppercase tracking-wide">
                Payment should only be made in the currency you have been invoiced in
              </p>
              <div className="space-y-3">
                {BANK_DETAILS.map(b => (
                  <div key={b.bank} className="border border-gray-200 rounded-xl p-4">
                    <p className="font-bold text-sm text-gray-900 mb-2">{b.bank}</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>SWIFT: <span className="font-mono font-semibold">{b.swift}</span></p>
                      <p>Branch: {b.branch}</p>
                      <p>Beneficiary: <strong>Cavendish University Uganda</strong></p>
                      <p>Account: <span className="font-mono font-bold text-gray-900">{b.account}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
