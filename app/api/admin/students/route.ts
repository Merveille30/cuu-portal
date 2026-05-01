import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: students } = await supabaseAdmin
    .from('students')
    .select('id, name, reg_no, email, phone, programme, faculty, reg_status, created_at')
    .order('created_at', { ascending: false })

  return NextResponse.json(students || [])
}
