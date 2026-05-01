import { NextRequest, NextResponse } from 'next/server'
import { getSession, autoGrade } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('results')
    .select('*')
    .eq('student_id', session.id)
    .order('semester')
    .order('subject')

  if (error) return NextResponse.json({ error: 'Failed to fetch results.' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subject, marks, grade, semester } = await req.json()
  if (!subject || marks === undefined || marks < 0 || marks > 100) {
    return NextResponse.json({ error: 'Valid subject and marks (0-100) are required.' }, { status: 400 })
  }

  const finalGrade = grade || autoGrade(parseInt(marks))

  const { error } = await supabaseAdmin.from('results').insert({
    student_id: session.id,
    subject: subject.trim(),
    marks: parseInt(marks),
    grade: finalGrade.toUpperCase(),
    semester: semester || 'Semester 1',
  })

  if (error) return NextResponse.json({ error: 'Failed to add result.' }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  const { error } = await supabaseAdmin
    .from('results')
    .delete()
    .eq('id', id)
    .eq('student_id', session.id)

  if (error) return NextResponse.json({ error: 'Delete failed.' }, { status: 500 })
  return NextResponse.json({ success: true })
}
