import { NextRequest, NextResponse } from 'next/server'
import { getSession, createNotification, notifyAllAdmins } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET — student's reports and ledgers shared by admin
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('student_reports')
    .select('*')
    .eq('student_id', session.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}

// POST — student requests a ledger from admin
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message } = await req.json()

  // Create a ledger request record
  const { data: student } = await supabaseAdmin
    .from('students').select('name, reg_no').eq('id', session.id).single()

  const { error } = await supabaseAdmin.from('student_reports').insert({
    student_id:  session.id,
    type:        'ledger_request',
    title:       'Ledger Request',
    content:     message || 'Student has requested a financial ledger.',
    status:      'pending',
    requested_by: 'student',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify all admins
  await notifyAllAdmins(
    '📋 Ledger Request',
    `${student?.name} (${student?.reg_no || 'no reg'}) has requested a financial ledger.`,
    'info',
    '/admin/reports'
  )

  // Confirm to student
  await createNotification({
    userId:   session.id,
    userRole: 'student',
    title:    'Ledger Request Submitted',
    message:  'Your ledger request has been sent to the finance office. You will be notified when it is ready.',
    type:     'info',
    link:     '/report',
  })

  return NextResponse.json({ success: true })
}
