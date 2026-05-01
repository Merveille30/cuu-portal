'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, BarChart2, CreditCard, FileText } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  // Use refs so inputs are uncontrolled — no re-render on every keystroke
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const username = usernameRef.current?.value.trim() || ''
    const password = passwordRef.current?.value || ''
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: '#0f172a' }}>

      {/* ── Left / Top panel ── */}
      <div className="lg:flex-1 flex flex-col justify-center items-center px-8 py-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1a56db 100%)' }}>

        {/* Decorative blobs */}
        <div className="absolute w-72 h-72 rounded-full top-[-60px] right-[-60px] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle,#6366f1,transparent)' }} />
        <div className="absolute w-60 h-60 rounded-full bottom-[-40px] left-[-40px] opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle,#1a56db,transparent)' }} />

        <div className="relative z-10 text-center w-full max-w-sm mx-auto">
          {/* Logo — large, centred, visible on all screens */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden mx-auto mb-5
                          shadow-2xl border-4 border-white/25 bg-white">
            <Image
              src="/cuu-logo.svg"
              alt="Cavendish University Uganda"
              width={160} height={160}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* University name below logo */}
          <p className="text-white/80 text-xs font-semibold tracking-widest uppercase mb-1">
            Cavendish University Uganda
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
            Student Portal
          </h1>
          <p className="text-white/55 text-sm leading-relaxed mb-8 hidden sm:block">
            Your complete academic management system — courses, results, payments and more.
          </p>

          {/* Feature list — hidden on very small screens */}
          <div className="space-y-2.5 text-left hidden sm:block">
            {[
              { icon: BookOpen,   text: 'Course Registration & Enrollment' },
              { icon: BarChart2,  text: 'Academic Results & Transcripts' },
              { icon: CreditCard, text: 'Fee Payment Tracking' },
              { icon: FileText,   text: 'Comprehensive Report Generation' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/75 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-blue-300" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right / Bottom panel ── */}
      <div className="w-full lg:w-[460px] bg-white flex flex-col justify-center
                      px-6 sm:px-10 py-10 overflow-y-auto">

        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome back</h2>
        <p className="text-sm text-gray-400 mb-7">Sign in to your student account to continue</p>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200
                          rounded-xl px-4 py-3 text-sm font-medium mb-5">
            ⚠️ {error}
          </div>
        )}

        {/* ── FORM — uncontrolled inputs fix keyboard disappearing ── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-username" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Username
            </label>
            <input
              id="login-username"
              ref={usernameRef}
              type="text"
              autoComplete="username"
              required
              placeholder="Enter your username"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100
                         transition-all bg-white"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Password
            </label>
            <input
              id="login-password"
              ref={passwordRef}
              type="password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100
                         transition-all bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm mt-1
                       disabled:opacity-60 active:scale-95 transition-all shadow-lg"
            style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)',
                     boxShadow: '0 4px 14px rgba(26,86,219,0.35)' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            Register as a new student
          </Link>
        </p>
      </div>
    </div>
  )
}
