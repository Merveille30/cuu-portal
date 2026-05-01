import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { course } = await req.json()
  if (!course) return NextResponse.json({ error: 'Course is required.' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('students')
    .update({ course: course.trim() })
    .eq('id', session.id)

  if (error) return NextResponse.json({ error: 'Enrollment failed.' }, { status: 500 })
  return NextResponse.json({ success: true })
}
