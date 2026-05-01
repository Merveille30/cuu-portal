import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, createNotification } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET — all student report requests
export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('student_reports')
    .select('*, students(name, reg_no, programme)')
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}

// POST — admin shares a report/ledger with a student
export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { student_id, type, title, content, report_id } = await req.json()

  if (!student_id || !title || !content)
    return NextResponse.json({ error: 'Student, title and content are required.' }, { status: 400 })

  // If responding to a request, update its status
  if (report_id) {
    await supabaseAdmin.from('student_reports')
      .update({ status: 'completed', content, title, shared_by: session.name, shared_at: new Date().toISOString() })
      .eq('id', report_id)
  } else {
    // Create new report/ledger
    await supabaseAdmin.from('student_reports').insert({
      student_id,
      type:       type || 'report',
      title,
      content,
      status:     'shared',
      shared_by:  session.name,
      shared_at:  new Date().toISOString(),
      requested_by: 'admin',
    })
  }

  // Notify the student
  await createNotification({
    userId:   student_id,
    userRole: 'student',
    title:    `📄 ${title}`,
    message:  `The admin has shared a ${type || 'report'} with you. Check your Reports section.`,
    type:     'info',
    link:     '/report',
  })

  return NextResponse.json({ success: true })
}
