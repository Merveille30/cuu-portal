import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: students } = await supabaseAdmin
    .from('students')
    .select('id, name, reg_no, course, email, created_at')
    .order('name')

  if (!students) return NextResponse.json([])

  const report = await Promise.all(
    students.map(async (s) => {
      const [paymentsRes, resultsRes] = await Promise.all([
        supabaseAdmin.from('payments').select('amount').eq('student_id', s.id),
        supabaseAdmin.from('results').select('marks, grade, subject, semester').eq('student_id', s.id),
      ])
      const payments = paymentsRes.data || []
      const results = resultsRes.data || []
      const totalPaid = payments.reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0)
      const avgMarks = results.length
        ? Math.round(results.reduce((sum: number, r: { marks: number }) => sum + r.marks, 0) / results.length * 10) / 10
        : 0
      return { student: s, totalPaid, results, avgMarks }
    })
  )

  return NextResponse.json(report)
}
