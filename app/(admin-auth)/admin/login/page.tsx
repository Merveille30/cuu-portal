'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameRef.current?.value.trim(),
          password: passwordRef.current?.value,
        }),
      })
      const d = await res.json()
      if (res.ok) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        setError(d.error || 'Login failed.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-8 py-8 text-center"
          style={{ background: 'linear-gradient(135deg,#0f172a,#1a3a6b)' }}>
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white/25 bg-white shadow-2xl">
            <Image src="/cuu-logo.svg" alt="CUU" width={96} height={96}
              className="w-full h-full object-cover" priority />
          </div>
          <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1">
            Cavendish University Uganda
          </p>
          <h2 className="text-xl font-extrabold text-white">Admin Portal</h2>
          <p className="text-white/50 text-sm mt-1">Staff &amp; Administration access only</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="a-user" className="block text-xs font-semibold text-gray-600 mb-1.5">
                Username
              </label>
              <input
                id="a-user"
                ref={usernameRef}
                type="text"
                required
                autoComplete="username"
                placeholder="Enter admin username"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
              />
            </div>
            <div>
              <label htmlFor="a-pw" className="block text-xs font-semibold text-gray-600 mb-1.5">
                Password
              </label>
              <input
                id="a-pw"
                ref={passwordRef}
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm
                         disabled:opacity-50 active:scale-95 transition-all mt-2"
              style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)',
                       boxShadow: '0 4px 14px rgba(26,86,219,0.35)' }}
            >
              {loading ? 'Signing in…' : '🔐  Sign In to Admin Portal'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 font-semibold mb-1">Default credentials:</p>
            <p className="text-xs text-gray-600">Username: <span className="font-mono font-bold">admin</span></p>
            <p className="text-xs text-gray-600">Password: <span className="font-mono font-bold">admin123</span></p>
            <p className="text-xs text-gray-400 mt-2">⚠️ Run migration_v2.sql in Supabase first</p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Student portal? <a href="/login" className="text-blue-600 font-semibold hover:underline">Login here</a>
          </p>
        </div>
      </div>
    </div>
  )
}
