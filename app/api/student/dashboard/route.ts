import { NextResponse } from 'next/server'
import { getSession, getStudentById } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const student = await getStudentById(session.id)

  const [paymentsRes, resultsRes] = await Promise.all([
    supabaseAdmin.from('payments').select('*').eq('student_id', session.id).order('payment_date', { ascending: false }),
    supabaseAdmin.from('results').select('*').eq('student_id', session.id).order('created_at', { ascending: false }),
  ])

  const payments = paymentsRes.data || []
  const results = resultsRes.data || []

  const totalPaid = payments.reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0)
  const avgMarks = results.length
    ? Math.round(results.reduce((sum: number, r: { marks: number }) => sum + r.marks, 0) / results.length * 10) / 10
    : 0

  return NextResponse.json({
    student,
    totalPaid,
    avgMarks,
    resultCount: results.length,
    recentPayments: payments.slice(0, 5),
    recentResults: results.slice(0, 5),
  })
}
