import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', session.id)
    .eq('user_role', 'student')
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json(data || [])
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, markAllRead } = await req.json()

  if (markAllRead) {
    await supabaseAdmin.from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.id)
      .eq('user_role', 'student')
  } else if (id) {
    await supabaseAdmin.from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', session.id)
  }

  return NextResponse.json({ success: true })
}
