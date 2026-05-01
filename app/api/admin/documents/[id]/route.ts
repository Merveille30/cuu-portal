import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, createNotification } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { action, admin_note } = await req.json()

  if (!['approve', 'reject'].includes(action))
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })

  const status = action === 'approve' ? 'approved' : 'rejected'

  await supabaseAdmin.from('documents').update({
    status,
    admin_note: admin_note || '',
    reviewed_at: new Date().toISOString(),
    reviewed_by: session.name,
  }).eq('id', id)

  // Get document + student info
  const { data: doc } = await supabaseAdmin
    .from('documents')
    .select('student_id, doc_type')
    .eq('id', id)
    .single()

  if (doc) {
    // Check if ALL documents are approved
    const { data: allDocs } = await supabaseAdmin
      .from('documents')
      .select('status')
      .eq('student_id', doc.student_id)

    const allApproved = allDocs?.every(d => d.status === 'approved')
    const anyRejected = allDocs?.some(d => d.status === 'rejected')

    if (allApproved) {
      await supabaseAdmin.from('students')
        .update({ reg_status: 'documents_approved' })
        .eq('id', doc.student_id)

      await createNotification({
        userId: doc.student_id, userRole: 'student',
        title: '✅ All Documents Approved!',
        message: 'All your documents have been reviewed and approved. You can now proceed to generate your invoice.',
        type: 'approval', link: '/register/invoice',
      })
    } else if (anyRejected) {
      await createNotification({
        userId: doc.student_id, userRole: 'student',
        title: '⚠️ Document Rejected',
        message: `Your ${doc.doc_type.replace(/_/g, ' ')} was rejected. ${admin_note ? 'Reason: ' + admin_note : 'Please re-upload.'}`,
        type: 'error', link: '/register/documents',
      })
    } else {
      await createNotification({
        userId: doc.student_id, userRole: 'student',
        title: 'Document Reviewed',
        message: `Your ${doc.doc_type.replace(/_/g, ' ')} has been ${status}.`,
        type: status === 'approved' ? 'success' : 'error',
        link: '/register/documents',
      })
    }
  }

  return NextResponse.json({ success: true })
}
