import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, autoGrade, createNotification } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET — fetch modules for a specific student (for the dropdown)
export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get('student_id')

  if (!studentId) return NextResponse.json([])

  // Get student's registered modules
  const { data: studentModules } = await supabaseAdmin
    .from('student_modules')
    .select('module_id, modules(id, name, code, semester, year)')
    .eq('student_id', studentId)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modules = (studentModules || []).map((sm: any) => sm.modules).filter(Boolean)

  return NextResponse.json(modules)
}

// POST — add result for a student
export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { student_id, module_id, subject, marks, semester, term, year } = await req.json()

  if (!student_id || (!subject && !module_id) || marks === undefined)
    return NextResponse.json({ error: 'Student, module/subject and marks are required.' }, { status: 400 })

  const grade = autoGrade(parseFloat(marks))

  // Get subject name from module if module_id provided
  let subjectName = subject
  if (module_id && !subject) {
    const { data: mod } = await supabaseAdmin
      .from('modules').select('name').eq('id', module_id).single()
    subjectName = mod?.name || 'Unknown Module'
  }

  const { error } = await supabaseAdmin.from('results').insert({
    student_id,
    module_id:  module_id || null,
    subject:    subjectName,
    marks:      parseFloat(marks),
    grade,
    semester:   semester || 'Semester 1',
    term:       term || '',
    year:       year || '',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify the student
  await createNotification({
    userId:   student_id,
    userRole: 'student',
    title:    '📊 New Result Posted',
    message:  `Your result for ${subjectName} has been posted: ${marks}/100 — Grade ${grade}.`,
    type:     'success',
    link:     '/results',
  })

  return NextResponse.json({ success: true })
}
