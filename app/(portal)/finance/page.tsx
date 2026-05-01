'use client'
import { useEffect, useState } from 'react'
import TopBar from '@/components/TopBar'
import StatCard from '@/components/StatCard'
import Link from 'next/link'
import { DollarSign, Receipt, CreditCard, TrendingDown } from 'lucide-react'

interface Invoice { id: string; invoice_no: string; term: string; year: string; total: number; status: string; due_date: string; currency: string }
interface Payment { id: string; amount: number; method: string; payment_date: string; description: string; reference: string }

export default function FinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [student, setStudent]   = useState<Record<string, string> | null>(null)

  useEffect(() => {
    fetch('/api/student/invoice').then(r => r.json()).then(d => { setInvoices(d.invoices || []); setStudent(d.student) })
    fetch('/api/student/pay').then(r => r.json()).then(setPayments)
  }, [])

  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.total), 0)
  const totalPaid     = payments.reduce((s, p) => s + Number(p.amount), 0)
  const balance       = totalInvoiced - totalPaid

  return (
    <>
      <TopBar title="Finance" subtitle="Your financial summary and payment history" regNo={student?.reg_no} />
      <main className="pt-28 lg:pt-16 px-4 lg:px-7 pb-8">
        <div className="mb-5 mt-2 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Finance Overview</h2>
            <p className="text-sm text-gray-400 mt-0.5">Your invoices, payments and balance</p>
          </div>
          <Link href="/finance/pay"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg,#0e9f6e,#059669)' }}>
            <CreditCard size={15} /> Make Payment
          </Link>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-5 mb-6">
          <StatCard icon={Receipt}     value={`USD ${totalInvoiced.toLocaleString()}`} label="Total Invoiced"  color="blue" />
          <StatCard icon={DollarSign}  value={`USD ${totalPaid.toLocaleString()}`}     label="Total Paid"      color="green" />
          <StatCard icon={TrendingDown}value={`USD ${balance.toLocaleString()}`}       label="Balance Due"     color={balance > 0 ? 'red' : 'green'} />
          <StatCard icon={CreditCard}  value={String(payments.length)}                 label="Transactions"    color="purple" />
        </div>

        {/* Invoices */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">📄 Invoices</h3>
            <Link href="/finance/invoice" className="text-xs text-blue-600 font-semibold hover:underline">View Details</Link>
          </div>
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Invoice #</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Term</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Total</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Due Date</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Status</th>
                </tr></thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">{inv.invoice_no}</td>
                      <td className="px-4 py-3 text-xs">{inv.term} {inv.year}</td>
                      <td className="px-4 py-3 font-bold text-xs">{inv.currency} {Number(inv.total).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(inv.due_date).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold
                          ${inv.status==='paid'?'bg-emerald-100 text-emerald-700':inv.status==='partial'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-sm">No invoices yet.</div>
          )}
        </div>

        {/* Payment history */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">💳 Payment History</h3>
          </div>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">#</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Description</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Amount</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Method</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400 hidden sm:table-cell">Date</th>
                </tr></thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 text-xs">{i+1}</td>
                      <td className="px-4 py-3 text-xs font-medium">{p.description}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600 text-xs whitespace-nowrap">USD {Number(p.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs">{p.method}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">{new Date(p.payment_date).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="bg-gray-50 border-t border-gray-200">
                  <td colSpan={2} className="px-4 py-3 font-bold text-sm">Total Paid</td>
                  <td className="px-4 py-3 font-extrabold text-emerald-600 text-sm">USD {totalPaid.toLocaleString()}</td>
                  <td colSpan={2} />
                </tr></tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-sm">No payments recorded yet.</div>
          )}
        </div>
      </main>
    </>
  )
}
