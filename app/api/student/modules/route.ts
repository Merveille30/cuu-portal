import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET modules for student's programme
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: student } = await supabaseAdmin
    .from('students').select('programme').eq('id', session.id).single()

  const { data: prog } = await supabaseAdmin
    .from('programmes').select('id').eq('name', student?.programme || '').single()

  if (!prog) return NextResponse.json([])

  const { data: modules } = await supabaseAdmin
    .from('modules')
    .select('*')
    .eq('programme_id', prog.id)
    .order('year').order('semester').order('name')

  // Get already registered modules
  const { data: registered } = await supabaseAdmin
    .from('student_modules')
    .select('module_id')
    .eq('student_id', session.id)

  const registeredIds = new Set((registered || []).map(r => r.module_id))

  return NextResponse.json({
    modules: modules || [],
    registeredIds: [...registeredIds],
  })
}

// POST — register modules
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { module_ids, term, year } = await req.json()
  if (!module_ids?.length)
    return NextResponse.json({ error: 'Select at least one module.' }, { status: 400 })

  const rows = module_ids.map((mid: string) => ({
    student_id: session.id,
    module_id: mid,
    term: term || '',
    year: year || '',
    status: 'registered',
  }))

  await supabaseAdmin.from('student_modules').upsert(rows, {
    onConflict: 'student_id,module_id,term,year',
    ignoreDuplicates: true,
  })

  await supabaseAdmin.from('students').update({
    reg_status: 'modules_registered',
    current_term: term || '',
    current_year: year || '',
  }).eq('id', session.id)

  return NextResponse.json({ success: true })
}
