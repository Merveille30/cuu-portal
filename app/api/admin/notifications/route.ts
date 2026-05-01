import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch notifications for this specific admin OR any admin-role broadcast
  const { data } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_role', 'admin')
    .order('created_at', { ascending: false })
    .limit(100)

  return NextResponse.json(data || [])
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { markAllRead, id } = await req.json()

  if (markAllRead) {
    await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_role', 'admin')
  } else if (id) {
    await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
  }

  return NextResponse.json({ success: true })
}
