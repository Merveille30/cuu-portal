import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET all programmes
export async function GET() {
  const { data } = await supabaseAdmin
    .from('programmes')
    .select('*')
    .order('name')
  return NextResponse.json(data || [])
}

// POST — student selects their programme
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { programme_id } = await req.json()
  if (!programme_id) return NextResponse.json({ error: 'Programme required.' }, { status: 400 })

  const { data: prog } = await supabaseAdmin
    .from('programmes').select('name, faculty').eq('id', programme_id).single()
  if (!prog) return NextResponse.json({ error: 'Programme not found.' }, { status: 404 })

  await supabaseAdmin.from('students').update({
    programme: prog.name,
    faculty: prog.faculty,
    reg_status: 'course_selected',
  }).eq('id', session.id)

  return NextResponse.json({ success: true })
}
