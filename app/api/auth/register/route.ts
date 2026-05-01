import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, date_of_birth, gender, nationality, address,
            next_of_kin_name, next_of_kin_phone, username, password } = body

    if (!name || !username || !password)
      return NextResponse.json({ error: 'Name, username and password are required.' }, { status: 400 })

    if (password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })

    // Check duplicate username
    const { data: existing } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('username', username.trim())
      .maybeSingle()

    if (existing)
      return NextResponse.json({ error: 'Username already taken.' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 12)

    // Build insert object — only include extra fields if they have values
    // This makes the API work even if migration hasn't run yet
    const insertData: Record<string, unknown> = {
      name:       name.trim(),
      username:   username.trim(),
      password:   hashed,
      email:      email?.trim()    || '',
      phone:      phone?.trim()    || '',
      reg_status: 'pending',
    }

    // Add extended fields (only present after migration)
    if (date_of_birth)    insertData.date_of_birth     = date_of_birth
    if (gender)           insertData.gender             = gender
    if (nationality)      insertData.nationality        = nationality?.trim()
    if (address)          insertData.address            = address?.trim()
    if (next_of_kin_name) insertData.next_of_kin_name  = next_of_kin_name?.trim()
    if (next_of_kin_phone)insertData.next_of_kin_phone = next_of_kin_phone?.trim()

    const { data: student, error } = await supabaseAdmin
      .from('students')
      .insert(insertData)
      .select('id, name')
      .single()

    if (error) {
      console.error('Register error:', error)

      // If it's a column-not-found error, retry with minimal fields only
      if (error.message?.includes('column') || error.code === '42703') {
        const minimalData = {
          name:     name.trim(),
          username: username.trim(),
          password: hashed,
          email:    email?.trim() || '',
          phone:    phone?.trim() || '',
        }
        const { data: s2, error: e2 } = await supabaseAdmin
          .from('students')
          .insert(minimalData)
          .select('id, name')
          .single()

        if (e2) {
          console.error('Minimal register error:', e2)
          return NextResponse.json({ error: 'Registration failed: ' + e2.message }, { status: 500 })
        }

        // Try to notify admins (may fail if admins table doesn't exist yet)
        try {
          const { data: admins } = await supabaseAdmin.from('admins').select('id')
          if (admins?.length) {
            await supabaseAdmin.from('notifications').insert(
              admins.map(a => ({
                user_id: a.id, user_role: 'admin',
                title: 'New Student Registration',
                message: `${s2!.name} has started the registration process.`,
                type: 'info', link: '/admin/students',
              }))
            )
          }
        } catch { /* notifications table may not exist yet */ }

        return NextResponse.json({ success: true, studentId: s2!.id })
      }

      return NextResponse.json({ error: 'Registration failed: ' + error.message }, { status: 500 })
    }

    // Notify admins (safe — won't crash if table missing)
    try {
      const { data: admins } = await supabaseAdmin.from('admins').select('id')
      if (admins?.length) {
        await supabaseAdmin.from('notifications').insert(
          admins.map(a => ({
            user_id: a.id, user_role: 'admin',
            title: 'New Student Registration',
            message: `${student.name} has started the registration process.`,
            type: 'info', link: '/admin/students',
          }))
        )
      }
    } catch { /* safe to ignore */ }

    return NextResponse.json({ success: true, studentId: student.id })

  } catch (err) {
    console.error('Unexpected register error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
