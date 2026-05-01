'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

interface DocWithStudent {
  id: string; doc_type: string; file_name: string; file_url: string
  status: string; admin_note: string; created_at: string
  student_id: string; student_name: string; student_reg: string
}

export default function AdminDocumentsPage() {
  const [docs, setDocs]       = useState<DocWithStudent[]>([])
  const [filter, setFilter]   = useState('pending')
  const [preview, setPreview] = useState<DocWithStudent | null>(null)
  const [note, setNote]       = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const load = async () => {
    // Get all students then their docs
    const studentsRes = await fetch('/api/admin/students')
    const students: { id: string; name: string; reg_no: string }[] = await studentsRes.json()

    const allDocs: DocWithStudent[] = []
    await Promise.all(students.map(async s => {
      const r = await fetch(`/api/admin/students/${s.id}`)
      const d = await r.json()
      ;(d.documents || []).forEach((doc: { id: string; doc_type: string; file_name: string; file_url: string; status: string; admin_note: string; created_at: string }) => {
        allDocs.push({ ...doc, student_id: s.id, student_name: s.name, student_reg: s.reg_no })
      })
    }))
    allDocs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setDocs(allDocs)
  }

  useEffect(() => { load() }, [])

  async function handleAction(docId: string, action: 'approve' | 'reject') {
    setLoading(docId)
    await fetch(`/api/admin/documents/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, admin_note: note }),
    })
    setPreview(null); setNote(''); setLoading(null)
    load()
  }

  const filtered = docs.filter(d => filter === 'all' || d.status === filter)

  return (
    <main className="pt-14 lg:pt-0 px-4 lg:px-7 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Document Review</h1>
        <p className="text-sm text-gray-400 mt-0.5">Review and approve student submitted documents</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['pending','approved','rejected','all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize
              ${filter===f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f} {f !== 'all' && `(${docs.filter(d => d.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No {filter} documents.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Student</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Document</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400 hidden sm:table-cell">Submitted</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-400">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(doc => (
                  <tr key={doc.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-xs">{doc.student_name}</p>
                      <p className="text-[11px] text-gray-400">{doc.student_reg}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs capitalize">{doc.doc_type.replace(/_/g, ' ')}</p>
                      <p className="text-[11px] text-gray-400 truncate max-w-[120px]">{doc.file_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-[11px] font-bold w-fit px-2 py-0.5 rounded-full
                        ${doc.status==='approved'?'bg-emerald-100 text-emerald-700':doc.status==='rejected'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>
                        {doc.status==='approved'?<CheckCircle size={10}/>:doc.status==='rejected'?<XCircle size={10}/>:<Clock size={10}/>}
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">
                      {new Date(doc.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setPreview(doc); setNote(doc.admin_note || '') }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all">
                        <Eye size={11}/> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-gray-900">Review Document</h3>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-400 font-semibold">Student</p><p className="font-semibold">{preview.student_name}</p></div>
                <div><p className="text-xs text-gray-400 font-semibold">Document Type</p><p className="font-semibold capitalize">{preview.doc_type.replace(/_/g,' ')}</p></div>
                <div><p className="text-xs text-gray-400 font-semibold">File Name</p><p className="text-xs truncate">{preview.file_name}</p></div>
                <div><p className="text-xs text-gray-400 font-semibold">Current Status</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                    ${preview.status==='approved'?'bg-emerald-100 text-emerald-700':preview.status==='rejected'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>
                    {preview.status}
                  </span>
                </div>
              </div>
              {/* Preview image if base64 */}
              {preview.file_url?.startsWith('data:image') && (
                <img src={preview.file_url} alt="Document" className="w-full rounded-xl border border-gray-200 max-h-48 object-contain" />
              )}
              {preview.file_url?.startsWith('data:application/pdf') && (
                <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
                  📄 PDF document — <a href={preview.file_url} download={preview.file_name} className="text-blue-600 font-semibold">Download to view</a>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Admin Note (optional)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                  placeholder="Add a note for the student (e.g. reason for rejection)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleAction(preview.id, 'approve')} disabled={!!loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#0e9f6e,#059669)' }}>
                <CheckCircle size={15}/> Approve
              </button>
              <button onClick={() => handleAction(preview.id, 'reject')} disabled={!!loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#e02424,#dc2626)' }}>
                <XCircle size={15}/> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
