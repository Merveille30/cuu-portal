'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { User, Hash, Mail, Phone, BookOpen, AtSign, Lock } from 'lucide-react'

const PROGRAMMES = [
  'Bachelor of Computer Science',
  'Bachelor of Information Technology',
  'Bachelor of Business Administration',
  'Bachelor of Education',
  'Bachelor of Commerce',
  'Bachelor of Science in Nursing',
  'Bachelor of Laws (LLB)',
  'Diploma in Computer Science',
  'Diploma in Business Studies',
  'Certificate in Information Technology',
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', reg_no: '', email: '', phone: '', course: '',
    username: '', password: '', confirm: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess('Account created! Redirecting to login…')
      setTimeout(() => router.push('/login'), 1500)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, name, type = 'text', placeholder, icon: Icon, required = false }:
    { label: string; name: string; type?: string; placeholder: string; icon: React.ElementType; required?: boolean }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <Icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type={type} placeholder={placeholder} required={required}
          className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          value={(form as Record<string, string>)[name]}
          onChange={set(name)} />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4"
      style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1a56db 100%)' }}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-10 py-8 text-center"
          style={{ background: 'linear-gradient(135deg,#0f172a,#1a56db)' }}>
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-3 border-white/20 shadow-xl">
            <Image src="/cuu-logo.svg" alt="CUU Logo" width={64} height={64} className="w-full h-full object-cover" priority />
          </div>
          <h2 className="text-xl font-extrabold text-white">Student Registration</h2>
          <p className="text-white/55 text-sm mt-1">Create your CUU student account</p>
        </div>

        {/* Body */}
        <div className="px-10 py-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium mb-5">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-sm font-medium mb-5">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-2">
              Personal Information
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name" name="name" placeholder="e.g. John Doe" icon={User} required />
              <Field label="Registration Number" name="reg_no" placeholder="e.g. CUU/2024/001" icon={Hash} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email Address" name="email" type="email" placeholder="student@cuu.ac.ug" icon={Mail} />
              <Field label="Phone Number" name="phone" placeholder="+256 700 000000" icon={Phone} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Programme / Course</label>
              <div className="relative">
                <BookOpen size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <select className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-white"
                  value={form.course} onChange={set('course')}>
                  <option value="">-- Select Programme --</option>
                  {PROGRAMMES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-2 pt-2">
              Account Credentials
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Username" name="username" placeholder="Choose a username" icon={AtSign} required />
              <Field label="Password" name="password" type="password" placeholder="Min. 6 characters" icon={Lock} required />
            </div>
            <Field label="Confirm Password" name="confirm" type="password" placeholder="Re-enter your password" icon={Lock} required />

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60 shadow-lg hover:-translate-y-0.5 transition-all mt-2"
              style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)', boxShadow: '0 4px 14px rgba(26,86,219,0.35)' }}>
              {loading ? 'Creating account…' : '🎓  Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
