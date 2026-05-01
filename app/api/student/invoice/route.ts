import { NextResponse } from 'next/server'
import { getSession, generateInvoiceNo, createNotification } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: invoices } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('student_id', session.id)
    .order('created_at', { ascending: false })

  const { data: student } = await supabaseAdmin
    .from('students')
    .select('name, reg_no, programme, faculty, shift, semester_in_program, current_term, current_year')
    .eq('id', session.id)
    .single()

  return NextResponse.json({ invoices: invoices || [], student })
}

// POST — generate invoice (called after documents approved)
export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: student } = await supabaseAdmin
    .from('students')
    .select('*')
    .eq('id', session.id)
    .single()

  if (!student) return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
  if (student.reg_status !== 'documents_approved')
    return NextResponse.json({ error: 'Documents must be approved before invoice generation.' }, { status: 400 })

  // Check if invoice already exists for this term/year
  const { data: existing } = await supabaseAdmin
    .from('invoices')
    .select('id')
    .eq('student_id', session.id)
    .eq('term', student.current_term)
    .eq('year', student.current_year)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Invoice already exists for this term.' }, { status: 409 })
  }

  const tuition = 495
  const regFee  = 20
  const total   = tuition + regFee
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30)

  const { data: invoice, error } = await supabaseAdmin.from('invoices').insert({
    invoice_no: generateInvoiceNo(),
    student_id: session.id,
    term: student.current_term,
    year: student.current_year,
    semester: student.semester_in_program,
    tuition,
    registration_fee: regFee,
    other_fees: 0,
    total,
    currency: 'USD',
    due_date: dueDate.toISOString().split('T')[0],
    status: 'unpaid',
  }).select().single()

  if (error) return NextResponse.json({ error: 'Failed to generate invoice.' }, { status: 500 })

  await supabaseAdmin.from('students').update({ reg_status: 'invoiced' }).eq('id', session.id)

  await createNotification({
    userId: session.id,
    userRole: 'student',
    title: 'Invoice Generated',
    message: `Your invoice ${invoice.invoice_no} for ${student.current_term} ${student.current_year} has been generated. Total: USD ${total}.`,
    type: 'info',
    link: '/finance/invoice',
  })

  return NextResponse.json({ success: true, invoice })
}
