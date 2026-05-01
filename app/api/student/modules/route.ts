import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET modules for student's programme
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: student } = await supabaseAdmin
    .from('students')
    .select('programme, reg_status')
    .eq('id', session.id)
    .single()

  if (!student?.programme) {
    return NextResponse.json({
      modules: [],
      registeredIds: [],
      error: 'no_programme',
      message: 'Please select your programme first before registering modules.',
    })
  }

  // Find programme by exact name match
  const { data: prog } = await supabaseAdmin
    .from('programmes')
    .select('id, name, code')
    .eq('name', student.programme)
    .maybeSingle()

  if (!prog) {
    // Try partial match
    const { data: progs } = await supabaseAdmin
      .from('programmes')
      .select('id, name, code')
      .ilike('name', `%${student.programme.split(' ').slice(-2).join(' ')}%`)
      .limit(1)

    const matchedProg = progs?.[0]
    if (!matchedProg) {
      return NextResponse.json({
        modules: [],
        registeredIds: [],
        error: 'no_modules',
        message: `No modules found for "${student.programme}". Please run FINAL_SETUP.sql in Supabase.`,
      })
    }

    return fetchModules(session.id, matchedProg.id)
  }

  return fetchModules(session.id, prog.id)
}

async function fetchModules(studentId: string, progId: string) {
  const { data: modules } = await supabaseAdmin
    .from('modules')
    .select('*')
    .eq('programme_id', progId)
    .order('year')
    .order('semester')
    .order('name')

  const { data: registered } = await supabaseAdmin
    .from('student_modules')
    .select('module_id')
    .eq('student_id', studentId)

  const registeredIds = new Set((registered || []).map((r: { module_id: string }) => r.module_id))

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
    module_id:  mid,
    term:       term || '',
    year:       year || '',
    status:     'registered',
  }))

  const { error } = await supabaseAdmin
    .from('student_modules')
    .upsert(rows, { onConflict: 'student_id,module_id,term,year', ignoreDuplicates: true })

  if (error) {
    console.error('Module registration error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabaseAdmin.from('students').update({
    reg_status:   'modules_registered',
    current_term: term || '',
    current_year: year || '',
  }).eq('id', session.id)

  return NextResponse.json({ success: true })
}
