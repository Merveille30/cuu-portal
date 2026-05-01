import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    if (!username || !password)
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 })

    const { data: student, error } = await supabaseAdmin
      .from('students')
      .select('id, username, name, reg_no, password, reg_status')
      .eq('username', username.trim())
      .maybeSingle()

    if (error) {
      // reg_status column may not exist yet — retry without it
      if (error.message?.includes('reg_status') || error.code === '42703') {
        const { data: s2 } = await supabaseAdmin
          .from('students')
          .select('id, username, name, reg_no, password')
          .eq('username', username.trim())
          .maybeSingle()

        if (!s2)
          return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })

        const valid = await bcrypt.compare(password, s2.password)
        if (!valid)
          return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })

        await createSession({ id: s2.id, username: s2.username, name: s2.name, reg_no: s2.reg_no || '', role: 'student' })
        return NextResponse.json({ success: true, regStatus: 'active' })
      }
      return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 })
    }

    if (!student)
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })

    const valid = await bcrypt.compare(password, student.password)
    if (!valid)
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })

    await createSession({
      id: student.id, username: student.username,
      name: student.name, reg_no: student.reg_no || '', role: 'student',
    })

    return NextResponse.json({ success: true, regStatus: student.reg_status || 'active' })

  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
