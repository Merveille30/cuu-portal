'use client'
import { useEffect, useState } from 'react'
import TopBar from '@/components/TopBar'
import Alert from '@/components/Alert'
import { User, Mail, Phone, Lock, Key, Save } from 'lucide-react'

export default function ProfilePage() {
  const [student, setStudent] = useState<Record<string, string> | null>(null)
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' })
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPw, setLoadingPw] = useState(false)

  useEffect(() => {
    fetch('/api/student/profile').then(r => r.json()).then(d => {
      setStudent(d)
      setProfileForm({ name: d.name || '', email: d.email || '', phone: d.phone || '' })
    })
  }, [])

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoadingProfile(true)
    const res = await fetch('/api/student/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_profile', ...profileForm }),
    })
    const data = await res.json()
    if (res.ok) { setAlert({ type: 'success', message: 'Profile updated successfully!' }); setStudent(s => s ? { ...s, ...profileForm } : s) }
    else setAlert({ type: 'error', message: data.error })
    setLoadingProfile(false)
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) { setAlert({ type: 'error', message: 'New passwords do not match.' }); return }
    if (pwForm.new_password.length < 6) { setAlert({ type: 'error', message: 'New password must be at least 6 characters.' }); return }
    setLoadingPw(true)
    const res = await fetch('/api/student/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'change_password', current_password: pwForm.current_password, new_password: pwForm.new_password }),
    })
    const data = await res.json()
    if (res.ok) { setAlert({ type: 'success', message: 'Password changed successfully!' }); setPwForm({ current_password: '', new_password: '', confirm: '' }) }
    else setAlert({ type: 'error', message: data.error })
    setLoadingPw(false)
  }

  const initials = student?.name?.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <>
      <TopBar title="My Profile" subtitle="Manage your personal information" regNo={student?.reg_no} />
      <main className="pt-16 p-7">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">Account Settings</h2>
          <p className="text-sm text-gray-400 mt-0.5">Update your profile and security settings</p>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* Profile Banner */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
            {initials}
          </div>
          <div>
            <p className="text-xl font-extrabold text-gray-900">{student?.name}</p>
            <p className="text-sm text-gray-400 mt-0.5">{student?.reg_no} · {student?.username}</p>
            {student?.course && (
              <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{student.course}</span>
            )}
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-400">Member since</p>
            <p className="text-sm font-semibold text-gray-700">
              {student?.created_at ? new Date(student.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Update Profile */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <User size={14} className="text-blue-600" /> Update Profile
              </h3>
            </div>
            <div className="px-6 py-5">
              <form onSubmit={handleProfile} className="space-y-4">
                {[
                  { label: 'Full Name', key: 'name', icon: User, type: 'text', placeholder: 'Your full name', required: true },
                  { label: 'Email Address', key: 'email', icon: Mail, type: 'email', placeholder: 'student@cuu.ac.ug', required: false },
                  { label: 'Phone Number', key: 'phone', icon: Phone, type: 'text', placeholder: '+256 700 000000', required: false },
                ].map(({ label, key, icon: Icon, type, placeholder, required }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                    <div className="relative">
                      <Icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={type} required={required} placeholder={placeholder}
                        className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none"
                        value={(profileForm as Record<string, string>)[key]}
                        onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))} />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Registration Number</label>
                  <input type="text" disabled value={student?.reg_no || ''} className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                  <p className="text-[11px] text-gray-400 mt-1">Contact the registrar to change your reg. number.</p>
                </div>
                <button type="submit" disabled={loadingProfile}
                  className="w-full py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
                  style={{ background: 'linear-gradient(135deg,#1a56db,#6366f1)' }}>
                  <Save size={14} /> {loadingProfile ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Lock size={14} className="text-blue-600" /> Change Password
              </h3>
            </div>
            <div className="px-6 py-5">
              <form onSubmit={handlePassword} className="space-y-4">
                {[
                  { label: 'Current Password', key: 'current_password', placeholder: 'Enter current password' },
                  { label: 'New Password', key: 'new_password', placeholder: 'Min. 6 characters' },
                  { label: 'Confirm New Password', key: 'confirm', placeholder: 'Re-enter new password' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                    <div className="relative">
                      <Key size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="password" required placeholder={placeholder}
                        className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none"
                        value={(pwForm as Record<string, string>)[key]}
                        onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} />
                    </div>
                  </div>
                ))}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                  🔒 Use a strong password with letters, numbers, and symbols.
                </div>
                <button type="submit" disabled={loadingPw}
                  className="w-full py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
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
