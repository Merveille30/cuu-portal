import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { name, reg_no, email, phone, course, username, password } = await req.json()

  if (!name || !reg_no || !username || !password) {
    return NextResponse.json({ error: 'Name, reg number, username and password are required.' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
  }

  // Check for duplicates
  const { data: existing } = await supabaseAdmin
    .from('students')
    .select('id')
    .or(`username.eq.${username.trim()},reg_no.eq.${reg_no.trim()}`)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Username or Registration Number already exists.' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)

  const { error } = await supabaseAdmin.from('students').insert({
    name: name.trim(),
    reg_no: reg_no.trim(),
    email: email?.trim() || '',
    phone: phone?.trim() || '',
    course: course?.trim() || '',
    username: username.trim(),
    password: hashed,
  })

  if (error) {
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
