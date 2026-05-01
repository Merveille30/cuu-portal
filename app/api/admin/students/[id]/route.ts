import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [studentRes, docsRes, invoicesRes, paymentsRes, resultsRes, modulesRes] = await Promise.all([
    supabaseAdmin.from('students').select('*').eq('id', id).single(),
    supabaseAdmin.from('documents').select('*').eq('student_id', id).order('created_at', { ascending: false }),
    supabaseAdmin.from('invoices').select('*').eq('student_id', id).order('created_at', { ascending: false }),
    supabaseAdmin.from('payments').select('*').eq('student_id', id).order('payment_date', { ascending: false }),
    supabaseAdmin.from('results').select('*').eq('student_id', id).order('created_at', { ascending: false }),
    supabaseAdmin.from('student_modules').select('*, modules(*)').eq('student_id', id),
  ])

  return NextResponse.json({
    student:  studentRes.data,
    documents: docsRes.data || [],
    invoices:  invoicesRes.data || [],
    payments:  paymentsRes.data || [],
    results:   resultsRes.data || [],
    modules:   modulesRes.data || [],
  })
}
