import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, autoGrade } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { student_id, module_id, subject, marks, semester, term, year } = await req.json()
  if (!student_id || !subject || marks === undefined)
    return NextResponse.json({ error: 'Student, subject and marks required.' }, { status: 400 })

  const grade = autoGrade(parseFloat(marks))

  const { error } = await supabaseAdmin.from('results').insert({
    student_id, module_id: module_id || null,
    subject, marks: parseFloat(marks), grade,
    semester: semester || 'Semester 1',
    term: term || '', year: year || '',
  })

  if (error) return NextResponse.json({ error: 'Failed to add result.' }, { status: 500 })
  return NextResponse.json({ success: true })
}
