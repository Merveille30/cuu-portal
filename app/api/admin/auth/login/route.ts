import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { createAdminSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  if (!username || !password)
    return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 })

  const { data: admin } = await supabaseAdmin
    .from('admins')
    .select('id, username, name, password, role')
    .eq('username', username.trim())
    .single()

  if (!admin)
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })

  const valid = await bcrypt.compare(password, admin.password)
  if (!valid)
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })

  await createAdminSession({
    id: admin.id,
    username: admin.username,
    name: admin.name,
    role: admin.role,
  })

  return NextResponse.json({ success: true })
}
