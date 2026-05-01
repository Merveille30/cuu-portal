'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, User, Lock, BookOpen, BarChart2, CreditCard, FileText } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
    <div className="min-h-screen flex" style={{ background: '#0f172a' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center px-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1a56db 100%)' }}>
        <div className="absolute w-96 h-96 rounded-full top-[-80px] right-[-80px] opacity-20"
          style={{ background: 'radial-gradient(circle,#6366f1,transparent)' }} />
        <div className="absolute w-80 h-80 rounded-full bottom-[-60px] left-[-60px] opacity-15"
          style={{ background: 'radial-gradient(circle,#1a56db,transparent)' }} />
        <div className="relative z-10 text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-7 shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
            <GraduationCap size={38} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white leading-tight mb-3">
            CUU Student<br />Management Portal
          </h1>
          <p className="text-white/60 text-sm leading-relaxed mb-10">
            Your complete academic management system — courses, results, payments and more.
          </p>
          <div className="space-y-3 text-left">
            {[
              { icon: BookOpen,  text: 'Course Registration & Enrollment' },
              { icon: BarChart2, text: 'Academic Results & Transcripts' },
              { icon: CreditCard,text: 'Fee Payment Tracking' },
              { icon: FileText,  text: 'Comprehensive Report Generation' },
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

      {/* Right panel */}
      <div className="w-full lg:w-[460px] bg-white flex flex-col justify-center px-10 py-12 overflow-y-auto">
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">CUU Portal</span>
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome back</h2>
        <p className="text-sm text-gray-400 mb-8">Sign in to your student account to continue</p>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium mb-5">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Username</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" required placeholder="Enter your username"
                className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" required placeholder="Enter your password"
                className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-white font-bold text-sm mt-2 disabled:opacity-60 shadow-lg hover:-translate-y-0.5 transition-all"
            style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)', boxShadow: '0 4px 14px rgba(26,86,219,0.35)' }}>
            {loading ? 'Signing in…' : '🔐  Sign In'}
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
