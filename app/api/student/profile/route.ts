import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession, getStudentById } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const student = await getStudentById(session.id)
  return NextResponse.json(student)
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action } = body

  if (action === 'update_profile') {
    const { name, email, phone } = body
    if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('students')
      .update({ name: name.trim(), email: email?.trim() || '', phone: phone?.trim() || '' })
      .eq('id', session.id)

    if (error) return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'change_password') {
    const { current_password, new_password } = body
    const { data: student } = await supabaseAdmin
      .from('students').select('password').eq('id', session.id).single()

    if (!student) return NextResponse.json({ error: 'Student not found.' }, { status: 404 })

    const valid = await bcrypt.compare(current_password, student.password)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
    if (new_password.length < 6) return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 })

    const hashed = await bcrypt.hash(new_password, 12)
    await supabaseAdmin.from('students').update({ password: hashed }).eq('id', session.id)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
}
