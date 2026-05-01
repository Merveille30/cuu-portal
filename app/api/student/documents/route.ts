import { NextRequest, NextResponse } from 'next/server'
import { getSession, notifyAllAdmins } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET student's documents
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('student_id', session.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}

// POST — upload document (store URL from Supabase Storage)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { doc_type, file_url, file_name } = await req.json()
  if (!doc_type || !file_url || !file_name)
    return NextResponse.json({ error: 'Document type, URL and filename required.' }, { status: 400 })

  // Upsert — replace existing doc of same type
  const { data: existing } = await supabaseAdmin
    .from('documents')
    .select('id')
    .eq('student_id', session.id)
    .eq('doc_type', doc_type)
    .single()

  if (existing) {
    await supabaseAdmin.from('documents').update({
      file_url, file_name, status: 'pending', admin_note: '', reviewed_at: null
    }).eq('id', existing.id)
  } else {
    await supabaseAdmin.from('documents').insert({
      student_id: session.id, doc_type, file_url, file_name, status: 'pending'
    })
  }

  // Update reg status
  const { data: student } = await supabaseAdmin
    .from('students').select('name, reg_status').eq('id', session.id).single()

  if (student?.reg_status === 'modules_registered') {
    await supabaseAdmin.from('students').update({ reg_status: 'documents_uploaded' }).eq('id', session.id)
  }

  // Notify admins
  await notifyAllAdmins(
    'Document Submitted',
    `${student?.name} submitted a ${doc_type.replace(/_/g, ' ')} for review.`,
    'info',
    `/admin/students/${session.id}`
  )

  return NextResponse.json({ success: true })
}
