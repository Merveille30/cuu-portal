import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, email, phone, date_of_birth, gender,
      nationality, address, next_of_kin_name, next_of_kin_phone,
      username, password,
    } = body

    // Validate required fields
    if (!name?.trim())     return NextResponse.json({ error: 'Full name is required.' },     { status: 400 })
    if (!username?.trim()) return NextResponse.json({ error: 'Username is required.' },      { status: 400 })
    if (!password)         return NextResponse.json({ error: 'Password is required.' },      { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })

    // Check duplicate username
    const { data: existing } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('username', username.trim())
      .maybeSingle()

    if (existing)
      return NextResponse.json({ error: 'Username already taken. Please choose another.' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 12)

    // Insert — reg_no is intentionally omitted (nullable, assigned by admin later)
    const { data: student, error } = await supabaseAdmin
      .from('students')
      .insert({
        name:              name.trim(),
        username:          username.trim(),
        password:          hashed,
        email:             email?.trim()          || '',
        phone:             phone?.trim()           || '',
        date_of_birth:     date_of_birth           || null,
        gender:            gender                  || '',
        nationality:       nationality?.trim()     || '',
        address:           address?.trim()         || '',
        next_of_kin_name:  next_of_kin_name?.trim()  || '',
        next_of_kin_phone: next_of_kin_phone?.trim() || '',
        reg_status:        'pending',
        programme:         '',
        faculty:           '',
        shift:             'Day',
        semester_in_program: 1,
        current_term:      '',
        current_year:      '',
        role:              'student',
      })
      .select('id, name')
      .single()

    if (error) {
      console.error('Register DB error:', JSON.stringify(error))
      return NextResponse.json(
        { error: `Registration failed: ${error.message}` },
        { status: 500 }
      )
    }

    // Notify admins — safe, won't crash if table missing
    try {
      const { data: admins } = await supabaseAdmin.from('admins').select('id')
      if (admins?.length) {
        await supabaseAdmin.from('notifications').insert(
          admins.map(a => ({
            user_id:   a.id,
            user_role: 'admin',
            title:     'New Student Registration',
            message:   `${student.name} has started the registration process.`,
            type:      'info',
            link:      '/admin/students',
          }))
        )
      }
    } catch { /* safe to ignore */ }

    return NextResponse.json({ success: true, studentId: student.id })

  } catch (err) {
    console.error('Unexpected register error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
