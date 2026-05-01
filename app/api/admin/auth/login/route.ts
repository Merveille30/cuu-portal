import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { createAdminSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password)
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 })

    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('id, username, name, password, role')
      .eq('username', username.trim())
      .maybeSingle()

    if (error) {
      console.error('Admin login DB error:', error)
      // Table doesn't exist yet — migration hasn't been run
      if (error.code === '42P01' || error.message?.includes('admins')) {
        return NextResponse.json({
          error: 'Admin table not found. Please run migration_v2.sql in Supabase SQL Editor first.'
        }, { status: 503 })
      }
      return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 })
    }

    if (!admin)
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })

    const valid = await bcrypt.compare(password, admin.password)
    if (!valid)
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })

    await createAdminSession({
      id:       admin.id,
      username: admin.username,
      name:     admin.name,
      role:     admin.role,
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Admin login error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
