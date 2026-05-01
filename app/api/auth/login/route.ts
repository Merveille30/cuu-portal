import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  if (!username || !password)
    return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 })

  const { data: student } = await supabaseAdmin
    .from('students')
    .select('id, username, name, reg_no, password, reg_status')
    .eq('username', username.trim())
    .single()

  if (!student)
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })

  const valid = await bcrypt.compare(password, student.password)
  if (!valid)
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })

  await createSession({
    id: student.id,
    username: student.username,
    name: student.name,
    reg_no: student.reg_no || '',
    role: 'student',
  })

  return NextResponse.json({ success: true, regStatus: student.reg_status })
}
