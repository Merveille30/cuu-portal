'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Personal info refs
  const nameRef     = useRef<HTMLInputElement>(null)
  const emailRef    = useRef<HTMLInputElement>(null)
  const phoneRef    = useRef<HTMLInputElement>(null)
  const dobRef      = useRef<HTMLInputElement>(null)
  const genderRef   = useRef<HTMLSelectElement>(null)
  const natRef      = useRef<HTMLInputElement>(null)
  const addressRef  = useRef<HTMLTextAreaElement>(null)
  const nokNameRef  = useRef<HTMLInputElement>(null)
  const nokPhoneRef = useRef<HTMLInputElement>(null)
  // Account refs
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef  = useRef<HTMLInputElement>(null)

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
          name:             nameRef.current?.value.trim(),
          email:            emailRef.current?.value.trim(),
          phone:            phoneRef.current?.value.trim(),
          date_of_birth:    dobRef.current?.value || null,
          gender:           genderRef.current?.value,
          nationality:      natRef.current?.value.trim(),
          address:          addressRef.current?.value.trim(),
          next_of_kin_name: nokNameRef.current?.value.trim(),
          next_of_kin_phone:nokPhoneRef.current?.value.trim(),
          username:         usernameRef.current?.value.trim(),
          password,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess('Account created! Redirecting to login…')
      setTimeout(() => router.push('/login'), 1500)
    } catch { setError('Something went wrong.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4"
      style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1a56db 100%)' }}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-8 py-7 text-center" style={{ background: 'linear-gradient(135deg,#0f172a,#1a3a6b)' }}>
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-4 border-white/25 shadow-xl bg-white">
            <Image src="/cuu-logo.svg" alt="CUU" width={80} height={80} className="w-full h-full object-cover" priority />
          </div>
          <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1">Cavendish University Uganda</p>
          <h2 className="text-xl font-extrabold text-white">New Student Registration</h2>
          <p className="text-white/50 text-sm mt-1">Create your account to begin the enrollment process</p>
        </div>

        <div className="px-6 sm:px-10 py-8">
          {error   && <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-5">⚠️ {error}</div>}
          {success && <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-sm mb-5">✅ {success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">

            <SectionLabel>Personal Information</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="r-name"  ref={nameRef}  label="Full Name *"       type="text"  placeholder="e.g. John Doe"         autoComplete="name"  required />
              <Field id="r-email" ref={emailRef} label="Email Address *"   type="email" placeholder="you@email.com"          autoComplete="email" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="r-phone" ref={phoneRef} label="Phone Number *"    type="tel"   placeholder="+256 700 000000"        autoComplete="tel"   required />
              <Field id="r-dob"   ref={dobRef}   label="Date of Birth"     type="date"  placeholder=""                       autoComplete="bday" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="r-gender" className="block text-xs font-semibold text-gray-600 mb-1.5">Gender</label>
                <select id="r-gender" ref={genderRef}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white">
                  <option value="">Select gender</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <Field id="r-nat" ref={natRef} label="Nationality" type="text" placeholder="e.g. Ugandan" autoComplete="country-name" />
            </div>
            <div>
              <label htmlFor="r-addr" className="block text-xs font-semibold text-gray-600 mb-1.5">Address</label>
              <textarea id="r-addr" ref={addressRef} rows={2} placeholder="Your home address"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-white resize-none" />
            </div>

            <SectionLabel>Next of Kin</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="r-nok-name"  ref={nokNameRef}  label="Next of Kin Name"  type="text" placeholder="Full name"     autoComplete="off" />
              <Field id="r-nok-phone" ref={nokPhoneRef} label="Next of Kin Phone" type="tel"  placeholder="+256 700 000000" autoComplete="off" />
            </div>

            <SectionLabel>Account Credentials</SectionLabel>
            <Field id="r-user" ref={usernameRef} label="Username *" type="text" placeholder="Choose a username" autoComplete="username" required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="r-pw"   ref={passwordRef} label="Password *"         type="password" placeholder="Min. 6 characters" autoComplete="new-password" required />
              <Field id="r-cpw"  ref={confirmRef}  label="Confirm Password *" type="password" placeholder="Re-enter password" autoComplete="new-password" required />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 active:scale-95 transition-all mt-2"
              style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)', boxShadow: '0 4px 14px rgba(26,86,219,0.35)' }}>
              {loading ? 'Creating account…' : 'Create Account & Start Enrollment'}
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-2 pt-1">
      {children}
    </p>
  )
}

import React from 'react'
const Field = React.forwardRef<HTMLInputElement, {
  id: string; label: string; type: string; placeholder: string; autoComplete?: string; required?: boolean
}>(({ id, label, type, placeholder, autoComplete, required }, ref) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
    <input id={id} ref={ref} type={type} placeholder={placeholder}
      autoComplete={autoComplete} required={required}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white" />
  </div>
))
Field.displayName = 'Field'
