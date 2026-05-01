'use client'
import { useEffect, useRef, useState } from 'react'
import TopBar from '@/components/TopBar'
import Alert from '@/components/Alert'
import { User, Mail, Phone, Lock, Key, Save } from 'lucide-react'

export default function ProfilePage() {
  const [student, setStudent] = useState<Record<string, string> | null>(null)
  const [alert, setAlert]     = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPw, setLoadingPw]           = useState(false)

  // Uncontrolled refs — keyboard stays open on mobile
  const nameRef    = useRef<HTMLInputElement>(null)
  const emailRef   = useRef<HTMLInputElement>(null)
  const phoneRef   = useRef<HTMLInputElement>(null)
  const curPwRef   = useRef<HTMLInputElement>(null)
  const newPwRef   = useRef<HTMLInputElement>(null)
  const confPwRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/student/profile').then(r => r.json()).then(d => {
      setStudent(d)
      // Pre-fill uncontrolled inputs after load
      setTimeout(() => {
        if (nameRef.current)  nameRef.current.value  = d.name  || ''
        if (emailRef.current) emailRef.current.value = d.email || ''
        if (phoneRef.current) phoneRef.current.value = d.phone || ''
      }, 0)
    })
  }, [])

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoadingProfile(true)
    const name  = nameRef.current?.value.trim()  || ''
    const email = emailRef.current?.value.trim() || ''
    const phone = phoneRef.current?.value.trim() || ''
    const res = await fetch('/api/student/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_profile', name, email, phone }),
    })
    const data = await res.json()
    if (res.ok) {
      setAlert({ type: 'success', message: 'Profile updated successfully!' })
      setStudent(s => s ? { ...s, name, email, phone } : s)
    } else {
      setAlert({ type: 'error', message: data.error })
    }
    setLoadingProfile(false)
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    const current_password = curPwRef.current?.value  || ''
    const new_password     = newPwRef.current?.value  || ''
    const confirm          = confPwRef.current?.value || ''
    if (new_password !== confirm) { setAlert({ type: 'error', message: 'New passwords do not match.' }); return }
    if (new_password.length < 6)  { setAlert({ type: 'error', message: 'New password must be at least 6 characters.' }); return }
    setLoadingPw(true)
    const res = await fetch('/api/student/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'change_password', current_password, new_password }),
    })
    const data = await res.json()
    if (res.ok) {
      setAlert({ type: 'success', message: 'Password changed successfully!' })
      if (curPwRef.current)  curPwRef.current.value  = ''
      if (newPwRef.current)  newPwRef.current.value  = ''
      if (confPwRef.current) confPwRef.current.value = ''
    } else {
      setAlert({ type: 'error', message: data.error })
    }
    setLoadingPw(false)
  }

  const initials = student?.name?.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <>
      <TopBar title="My Profile" subtitle="Manage your personal information" regNo={student?.reg_no} />
      <main className="pt-28 lg:pt-16 px-4 lg:px-7 pb-8">
        <div className="mb-5 mt-2">
          <h2 className="text-xl font-extrabold text-gray-900">Account Settings</h2>
          <p className="text-sm text-gray-400 mt-0.5">Update your profile and security settings</p>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* Profile Banner */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5 flex flex-wrap items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-gray-900 truncate">{student?.name}</p>
            <p className="text-sm text-gray-400 mt-0.5">{student?.reg_no} · {student?.username}</p>
            {student?.course && (
              <span className="inline-block mt-1.5 px-3 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold truncate max-w-xs">
                {student.course}
              </span>
            )}
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <p className="text-xs text-gray-400">Member since</p>
            <p className="text-sm font-semibold text-gray-700">
              {student?.created_at ? new Date(student.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Update Profile */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <User size={14} className="text-blue-600" /> Update Profile
              </h3>
            </div>
            <div className="px-5 py-5">
              <form onSubmit={handleProfile} className="space-y-4">
                {[
                  { label: 'Full Name',     id: 'prof-name',  ref: nameRef,  type: 'text',  icon: User,  placeholder: 'Your full name',      required: true,  autoComplete: 'name' },
                  { label: 'Email Address', id: 'prof-email', ref: emailRef, type: 'email', icon: Mail,  placeholder: 'student@cuu.ac.ug',   required: false, autoComplete: 'email' },
                  { label: 'Phone Number',  id: 'prof-phone', ref: phoneRef, type: 'tel',   icon: Phone, placeholder: '+256 700 000000',     required: false, autoComplete: 'tel' },
                ].map(({ label, id, ref, type, icon: Icon, placeholder, required, autoComplete }) => (
                  <div key={id}>
                    <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1.5">
                      {label}
                    </label>
                    <div className="relative">
                      <Icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        id={id}
                        ref={ref as React.RefObject<HTMLInputElement>}
                        type={type}
                        required={required}
                        placeholder={placeholder}
                        autoComplete={autoComplete}
                        className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Registration Number</label>
                  <input type="text" disabled value={student?.reg_no || ''}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                  <p className="text-[11px] text-gray-400 mt-1">Contact the registrar to change your reg. number.</p>
                </div>
                <button type="submit" disabled={loadingProfile}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50
                             flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
                  <Save size={14} /> {loadingProfile ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Lock size={14} className="text-blue-600" /> Change Password
              </h3>
            </div>
            <div className="px-5 py-5">
              <form onSubmit={handlePassword} className="space-y-4">
                {[
                  { label: 'Current Password',     id: 'pw-cur',  ref: curPwRef,  placeholder: 'Enter current password',  autoComplete: 'current-password' },
                  { label: 'New Password',          id: 'pw-new',  ref: newPwRef,  placeholder: 'Min. 6 characters',       autoComplete: 'new-password' },
                  { label: 'Confirm New Password',  id: 'pw-conf', ref: confPwRef, placeholder: 'Re-enter new password',   autoComplete: 'new-password' },
                ].map(({ label, id, ref, placeholder, autoComplete }) => (
                  <div key={id}>
                    <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                    <div className="relative">
                      <Key size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        id={id}
                        ref={ref as React.RefObject<HTMLInputElement>}
                        type="password"
                        required
                        placeholder={placeholder}
                        autoComplete={autoComplete}
                        className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                      />
                    </div>
                  </div>
                ))}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                  🔒 Use a strong password with letters, numbers, and symbols.
                </div>
                <button type="submit" disabled={loadingPw}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50
                             flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg,#0e9f6e,#059669)' }}>
                  <Lock size={14} /> {loadingPw ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
