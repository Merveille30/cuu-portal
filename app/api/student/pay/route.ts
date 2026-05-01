import { NextRequest, NextResponse } from 'next/server'
import { getSession, createNotification, notifyAllAdmins } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { invoice_id, amount, method, reference, description } = await req.json()
  if (!amount || amount <= 0)
    return NextResponse.json({ error: 'Valid amount required.' }, { status: 400 })

  // Record payment
  const { data: payment, error } = await supabaseAdmin.from('payments').insert({
    student_id: session.id,
    invoice_id: invoice_id || null,
    amount: parseFloat(amount),
    currency: 'USD',
    method: method || 'Mobile Money',
    reference: reference || '',
    description: description || 'Tuition Fee',
    status: 'completed',
  }).select().single()

  if (error) return NextResponse.json({ error: 'Payment recording failed.' }, { status: 500 })

  // Update invoice status
  if (invoice_id) {
    const { data: inv } = await supabaseAdmin
      .from('invoices').select('total').eq('id', invoice_id).single()

    const { data: paidRows } = await supabaseAdmin
      .from('payments').select('amount').eq('invoice_id', invoice_id).eq('status', 'completed')

    const totalPaid = (paidRows || []).reduce((s: number, p: { amount: number }) => s + Number(p.amount), 0)
    const invTotal  = Number(inv?.total || 0)

    const invStatus = totalPaid >= invTotal ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid'
    await supabaseAdmin.from('invoices').update({ status: invStatus }).eq('id', invoice_id)

    // If fully paid, activate student
    if (invStatus === 'paid') {
      await supabaseAdmin.from('students').update({ reg_status: 'active' }).eq('id', session.id)
      await createNotification({
        userId: session.id, userRole: 'student',
        title: 'Payment Complete — Registration Active!',
        message: `Your payment of USD ${amount} has been received. Your registration is now active.`,
        type: 'success', link: '/dashboard',
      })
    } else {
      await supabaseAdmin.from('students').update({ reg_status: 'paid' }).eq('id', session.id)
      await createNotification({
        userId: session.id, userRole: 'student',
        title: 'Payment Received',
        message: `Payment of USD ${amount} recorded. Balance remaining: USD ${(invTotal - totalPaid).toFixed(2)}.`,
        type: 'payment', link: '/finance',
      })
    }
  }

  // Notify admins
  await notifyAllAdmins(
    'Payment Received',
    `${session.name} made a payment of USD ${amount} via ${method || 'Mobile Money'}.`,
    'payment',
    `/admin/students/${session.id}`
  )

  return NextResponse.json({ success: true, payment })
}

// GET payment history
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('student_id', session.id)
    .order('payment_date', { ascending: false })

  return NextResponse.json(data || [])
}
