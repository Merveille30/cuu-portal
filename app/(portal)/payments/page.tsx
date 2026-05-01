'use client'
import { useEffect, useState } from 'react'
import TopBar from '@/components/TopBar'
import Alert from '@/components/Alert'
import StatCard from '@/components/StatCard'
import { DollarSign, Receipt, Calendar, Trash2 } from 'lucide-react'

const PAYMENT_TYPES = ['Tuition Fee','Registration Fee','Examination Fee','Library Fee','Medical Fee','Sports Fee','Accommodation Fee','Other']

interface Payment { id: string; description: string; amount: number; payment_date: string }

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [student, setStudent] = useState<Record<string, string> | null>(null)
  const [form, setForm] = useState({ amount: '', description: 'Tuition Fee' })
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    fetch('/api/student/payments').then(r => r.json()).then(setPayments)
    fetch('/api/student/profile').then(r => r.json()).then(setStudent)
  }
  useEffect(load, [])

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0)
  const lastDate = payments[0] ? new Date(payments[0].payment_date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/student/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(form.amount), description: form.description }),
    })
    const data = await res.json()
    if (res.ok) { setAlert({ type: 'success', message: `Payment of UGX ${Number(form.amount).toLocaleString()} recorded!` }); setForm(f => ({ ...f, amount: '' })); load() }
    else setAlert({ type: 'error', message: data.error })
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this payment record?')) return
    const res = await fetch('/api/student/payments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) { setAlert({ type: 'success', message: 'Payment deleted.' }); load() }
  }

  // Summary by type
  const byType: Record<string, number> = {}
  payments.forEach(p => { byType[p.description] = (byType[p.description] || 0) + Number(p.amount) })

  return (
    <>
      <TopBar title="Fee Payments" subtitle="Track and manage your fee payments" regNo={student?.reg_no} />
      <main className="pt-16 p-7">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">Payment Management</h2>
          <p className="text-sm text-gray-400 mt-0.5">Record and view your fee payment history</p>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <div className="grid grid-cols-3 gap-5 mb-6">
          <StatCard icon={DollarSign} value={`UGX ${totalPaid.toLocaleString()}`} label="Total Amount Paid" color="green" />
          <StatCard icon={Receipt}    value={String(payments.length)} label="Payment Transactions" color="blue" />
          <StatCard icon={Calendar}   value={lastDate} label="Last Payment Date" color="yellow" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">➕ Record New Payment</h3>
            </div>
            <div className="px-6 py-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Type</label>
                  <select value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white">
                    {PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount (UGX)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">UGX</span>
                    <input type="number" required min="1" step="1000" placeholder="0"
                      className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none"
                      value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700">
                  ℹ️ This records a payment in the system. Keep your official receipts for verification.
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#0e9f6e,#059669)' }}>
                  {loading ? 'Recording…' : '✓ Record Payment'}
                </button>
              </form>
            </div>
          </div>

          {/* Summary by type */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">📊 Payment Summary</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              {Object.keys(byType).length > 0 ? Object.entries(byType).sort((a,b) => b[1]-a[1]).map(([type, amt]) => {
                const pct = totalPaid > 0 ? Math.round((amt / totalPaid) * 100) : 0
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-gray-700">{type}</span>
                      <span className="font-bold text-gray-900">UGX {amt.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#1a56db,#6366f1)' }} />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">{pct}% of total</p>
                  </div>
                )
              }) : <p className="text-sm text-gray-400 text-center py-8">No payment data yet.</p>}
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">🕐 Payment History</h3>
            <span className="text-xs text-gray-400">{payments.length} records</span>
          </div>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50">
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">#</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Description</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Amount</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Date</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Action</th>
                </tr></thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-5 py-3 font-medium">{p.description}</td>
                      <td className="px-5 py-3 font-bold text-emerald-600">UGX {Number(p.amount).toLocaleString()}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{new Date(p.payment_date).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="bg-gray-50 border-t border-gray-200">
                  <td colSpan={2} className="px-5 py-3 font-bold text-sm">Total</td>
                  <td className="px-5 py-3 font-extrabold text-emerald-600 text-sm">UGX {totalPaid.toLocaleString()}</td>
                  <td colSpan={2} />
                </tr></tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">No payment records found.</div>
          )}
        </div>
      </main>
    </>
  )
}
