import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { notifyAllAdmins } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { name, email, phone, date_of_birth, gender, nationality, address,
          next_of_kin_name, next_of_kin_phone, username, password } = await req.json()

  if (!name || !username || !password)
    return NextResponse.json({ error: 'Name, username and password are required.' }, { status: 400 })

  if (password.length < 6)
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })

  // Check duplicate username
  const { data: existing } = await supabaseAdmin
    .from('students').select('id').eq('username', username.trim()).single()
  if (existing)
    return NextResponse.json({ error: 'Username already taken.' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 12)

  const { data: student, error } = await supabaseAdmin.from('students').insert({
    name: name.trim(),
    email: email?.trim() || '',
    phone: phone?.trim() || '',
    date_of_birth: date_of_birth || null,
    gender: gender || '',
    nationality: nationality || '',
    address: address || '',
    next_of_kin_name: next_of_kin_name || '',
    next_of_kin_phone: next_of_kin_phone || '',
    username: username.trim(),
    password: hashed,
    reg_status: 'pending',
  }).select('id, name').single()

  if (error)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })

  // Notify admins
  await notifyAllAdmins(
    'New Student Registration',
    `${student.name} has started the registration process.`,
    'info',
    '/admin/students'
  )

  return NextResponse.json({ success: true, studentId: student.id })
}
