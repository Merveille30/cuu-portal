'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: usernameRef.current?.value.trim(),
        password: passwordRef.current?.value,
      }),
    })
    const d = await res.json()
    if (res.ok) router.push('/admin/dashboard')
    else setError(d.error)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-8 py-8 text-center" style={{ background: 'linear-gradient(135deg,#0f172a,#1a3a6b)' }}>
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-4 border-white/25 bg-white">
            <Image src="/cuu-logo.svg" alt="CUU" width={80} height={80} className="w-full h-full object-cover" priority />
          </div>
          <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1">Cavendish University Uganda</p>
          <h2 className="text-xl font-extrabold text-white">Admin Portal</h2>
          <p className="text-white/50 text-sm mt-1">Staff access only</p>
        </div>
        <div className="px-8 py-8">
          {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-5">⚠️ {error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="a-user" className="block text-xs font-semibold text-gray-600 mb-1.5">Username</label>
              <input id="a-user" ref={usernameRef} type="text" required autoComplete="username" placeholder="Admin username"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white" />
            </div>
            <div>
              <label htmlFor="a-pw" className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <input id="a-pw" ref={passwordRef} type="password" required autoComplete="current-password" placeholder="Password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
              {loading ? 'Signing in…' : 'Sign In to Admin Portal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
