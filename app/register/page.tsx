'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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

  // Uncontrolled refs — no re-render on keystroke, keyboard stays open
  const nameRef     = useRef<HTMLInputElement>(null)
  const regNoRef    = useRef<HTMLInputElement>(null)
  const emailRef    = useRef<HTMLInputElement>(null)
  const phoneRef    = useRef<HTMLInputElement>(null)
  const courseRef   = useRef<HTMLSelectElement>(null)
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef  = useRef<HTMLInputElement>(null)

  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')

    const password = passwordRef.current?.value || ''
    const confirm  = confirmRef.current?.value  || ''

    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     nameRef.current?.value.trim(),
          reg_no:   regNoRef.current?.value.trim(),
          email:    emailRef.current?.value.trim(),
          phone:    phoneRef.current?.value.trim(),
          course:   courseRef.current?.value,
          username: usernameRef.current?.value.trim(),
          password,
        }),
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4"
      style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1a56db 100%)' }}>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header with logo centred ── */}
        <div className="px-8 py-8 text-center"
          style={{ background: 'linear-gradient(135deg,#0f172a,#1a3a6b)' }}>

          {/* Logo — large, centred, circle */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mx-auto mb-4
                          border-4 border-white/25 shadow-2xl bg-white">
            <Image
              src="/cuu-logo.svg"
              alt="Cavendish University Uganda"
              width={112} height={112}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* University name below logo */}
          <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1">
            Cavendish University Uganda
          </p>
          <h2 className="text-xl font-extrabold text-white">Student Registration</h2>
          <p className="text-white/50 text-sm mt-1">Create your CUU student account</p>
        </div>

        {/* ── Form body ── */}
        <div className="px-6 sm:px-10 py-8">

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200
                            rounded-xl px-4 py-3 text-sm font-medium mb-5">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200
                            rounded-xl px-4 py-3 text-sm font-medium mb-5">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Section label */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400
                          border-b border-gray-200 pb-2">
              Personal Information
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input id="reg-name" ref={nameRef} type="text" required
                  autoComplete="name" placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white" />
              </div>
              <div>
                <label htmlFor="reg-regno" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <input id="reg-regno" ref={regNoRef} type="text" required
                  autoComplete="off" placeholder="e.g. CUU/2024/001"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Email Address
                </label>
                <input id="reg-email" ref={emailRef} type="email"
                  autoComplete="email" placeholder="student@cuu.ac.ug"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white" />
              </div>
              <div>
                <label htmlFor="reg-phone" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Phone Number
                </label>
                <input id="reg-phone" ref={phoneRef} type="tel"
                  autoComplete="tel" placeholder="+256 700 000000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white" />
              </div>
            </div>

            <div>
              <label htmlFor="reg-course" className="block text-xs font-semibold text-gray-600 mb-1.5">
                Programme / Course
              </label>
              <select id="reg-course" ref={courseRef}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white">
                <option value="">-- Select Programme --</option>
                {PROGRAMMES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Credentials section */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400
                          border-b border-gray-200 pb-2 pt-2">
              Account Credentials
            </p>

            <div>
              <label htmlFor="reg-username" className="block text-xs font-semibold text-gray-600 mb-1.5">
                Username <span className="text-red-500">*</span>
              </label>
              <input id="reg-username" ref={usernameRef} type="text" required
                autoComplete="username" placeholder="Choose a username"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input id="reg-password" ref={passwordRef} type="password" required
                  autoComplete="new-password" placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white" />
              </div>
              <div>
                <label htmlFor="reg-confirm" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input id="reg-confirm" ref={confirmRef} type="password" required
                  autoComplete="new-password" placeholder="Re-enter password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm mt-2
                         disabled:opacity-50 active:scale-95 transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)',
                       boxShadow: '0 4px 14px rgba(26,86,219,0.35)' }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
