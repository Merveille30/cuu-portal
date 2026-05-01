'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, CheckCircle, XCircle, Clock, FileText } from 'lucide-react'

const REQUIRED_DOCS = [
  { type: 'national_id',    label: 'National ID / Passport',       required: true },
  { type: 'passport_photo', label: 'Passport Photo',               required: true },
  { type: 'o_level',        label: 'O-Level Certificate (UCE)',    required: true },
  { type: 'a_level',        label: 'A-Level Certificate (UACE)',   required: false },
  { type: 'degree',         label: 'Degree / Diploma Certificate', required: false },
  { type: 'other',          label: 'Other Supporting Document',    required: false },
]

interface Doc { id: string; doc_type: string; file_name: string; status: string; admin_note: string }

export default function DocumentsPage() {
  const router = useRouter()
  const [docs, setDocs]         = useState<Doc[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const load = () => fetch('/api/student/documents').then(r => r.json()).then(setDocs)
  useEffect(() => { load() }, [])

  const docMap = Object.fromEntries(docs.map(d => [d.doc_type, d]))

  async function handleUpload(docType: string, file: File) {
    setUploading(docType); setError(''); setSuccess('')
    try {
      // Convert to base64 for simple storage (in production use Supabase Storage)
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        const res = await fetch('/api/student/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doc_type: docType,
            file_url: base64,
            file_name: file.name,
          }),
        })
        if (res.ok) { setSuccess(`${file.name} uploaded successfully!`); load() }
        else { const d = await res.json(); setError(d.error) }
        setUploading(null)
      }
      reader.readAsDataURL(file)
    } catch { setError('Upload failed.'); setUploading(null) }
  }

  const allRequiredUploaded = REQUIRED_DOCS
    .filter(d => d.required)
    .every(d => docMap[d.type])

  const allApproved = docs.length > 0 && docs.every(d => d.status === 'approved')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-white py-6 px-6 text-center" style={{ background: 'linear-gradient(135deg,#0f172a,#1a56db)' }}>
        <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-3 border-3 border-white/20 bg-white">
          <Image src="/cuu-logo.svg" alt="CUU" width={56} height={56} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-xl font-extrabold">Step 3 of 4 — Upload Documents</h1>
        <p className="text-white/60 text-sm mt-1">Upload your academic certificates and identification</p>
        <StepBar step={3} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {error   && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-5">⚠️ {error}</div>}
        {success && <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-sm mb-5">✅ {success}</div>}

        {allApproved && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl px-5 py-4 mb-6 text-center">
            <CheckCircle size={28} className="text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-emerald-700">All documents approved!</p>
            <p className="text-sm text-emerald-600 mt-1">You can now proceed to generate your invoice.</p>
            <button onClick={() => router.push('/register/invoice')}
              className="mt-3 px-6 py-2.5 rounded-xl text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#0e9f6e,#059669)' }}>
              Continue to Invoice →
            </button>
          </div>
        )}

        <div className="space-y-4">
          {REQUIRED_DOCS.map(({ type, label, required }) => {
            const existing = docMap[type]
            const isUploading = uploading === type
            return (
              <div key={type} className={`bg-white rounded-xl border-2 p-5 transition-all
                ${existing?.status === 'approved' ? 'border-emerald-300'
                  : existing?.status === 'rejected' ? 'border-red-300'
                  : existing ? 'border-amber-300'
                  : 'border-gray-200'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className={
                      existing?.status === 'approved' ? 'text-emerald-500'
                      : existing?.status === 'rejected' ? 'text-red-500'
                      : existing ? 'text-amber-500'
                      : 'text-gray-400'} />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      {existing && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{existing.file_name}</p>
                      )}
                      {existing?.admin_note && (
                        <p className="text-xs text-red-600 mt-0.5">Note: {existing.admin_note}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {existing?.status === 'approved' && <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold"><CheckCircle size={14}/>Approved</span>}
                    {existing?.status === 'rejected' && <span className="flex items-center gap-1 text-xs text-red-600 font-semibold"><XCircle size={14}/>Rejected</span>}
                    {existing?.status === 'pending'  && <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold"><Clock size={14}/>Pending</span>}
                    {existing?.status !== 'approved' && (
                      <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all
                        ${isUploading ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}>
                        <Upload size={12} />
                        {isUploading ? 'Uploading…' : existing ? 'Re-upload' : 'Upload'}
                        <input type="file" className="hidden" disabled={isUploading}
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(type, f) }} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700">
          ℹ️ Your documents will be reviewed by the admissions team. You will receive a notification once approved.
          Required documents are marked with <span className="text-red-500">*</span>
        </div>

        {allRequiredUploaded && !allApproved && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 text-center">
            <Clock size={16} className="inline mr-1" />
            Documents submitted. Waiting for admin review…
          </div>
        )}
      </div>
    </div>
  )
}

function StepBar({ step }: { step: number }) {
  const steps = ['Programme', 'Modules', 'Documents', 'Invoice']
  return (
    <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
            ${i+1===step?'bg-white text-blue-700':i+1<step?'bg-white/20 text-white':'bg-white/10 text-white/50'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
              ${i+1===step?'bg-blue-600 text-white':i+1<step?'bg-emerald-500 text-white':'bg-white/20 text-white/50'}`}>
              {i+1<step?'✓':i+1}
            </span>
            {s}
          </div>
          {i<steps.length-1&&<div className="w-4 h-px bg-white/30"/>}
        </div>
      ))}
    </div>
  )
}
