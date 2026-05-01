import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('student_id', session.id)
    .order('payment_date', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch payments.' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount, description } = await req.json()
  if (!amount || amount <= 0) return NextResponse.json({ error: 'Valid amount is required.' }, { status: 400 })

  const { error } = await supabaseAdmin.from('payments').insert({
    student_id: session.id,
    amount: parseFloat(amount),
    description: description || 'Tuition Fee',
  })

  if (error) return NextResponse.json({ error: 'Payment recording failed.' }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  const { error } = await supabaseAdmin
    .from('payments')
    .delete()
    .eq('id', id)
    .eq('student_id', session.id)

  if (error) return NextResponse.json({ error: 'Delete failed.' }, { status: 500 })
  return NextResponse.json({ success: true })
}
