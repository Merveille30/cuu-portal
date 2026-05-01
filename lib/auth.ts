import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from './supabase'

const JWT_SECRET  = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
const STUDENT_COOKIE = 'cuu_session'
const ADMIN_COOKIE   = 'cuu_admin_session'

// ── Session types ──────────────────────────────────────────
export interface SessionUser {
  id: string
  username: string
  name: string
  reg_no: string
  role: 'student'
}

export interface AdminSession {
  id: string
  username: string
  name: string
  role: 'admin' | 'super_admin' | 'registrar' | 'finance'
}

// ── Student session ────────────────────────────────────────
export async function createSession(user: SessionUser) {
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
  const cookieStore = await cookies()
  cookieStore.set(STUDENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(STUDENT_COOKIE)?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as SessionUser
  } catch { return null }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(STUDENT_COOKIE)
}

// ── Admin session ──────────────────────────────────────────
export async function createAdminSession(admin: AdminSession) {
  const token = jwt.sign(admin, JWT_SECRET, { expiresIn: '8h' })
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_COOKIE)?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as AdminSession
  } catch { return null }
}

export async function destroyAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
}

// ── Data helpers ───────────────────────────────────────────
export async function getStudentById(id: string) {
  const { data } = await supabaseAdmin
    .from('students')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function getAdminById(id: string) {
  const { data } = await supabaseAdmin
    .from('admins')
    .select('id, username, name, email, role, created_at')
    .eq('id', id)
    .single()
  return data
}

// ── Notification helper ────────────────────────────────────
export async function createNotification({
  userId, userRole, title, message, type = 'info', link = ''
}: {
  userId: string
  userRole: 'student' | 'admin'
  title: string
  message: string
  type?: string
  link?: string
}) {
  await supabaseAdmin.from('notifications').insert({
    user_id: userId, user_role: userRole, title, message, type, link
  })
}

// ── Notify all admins ──────────────────────────────────────
export async function notifyAllAdmins(title: string, message: string, type = 'info', link = '') {
  const { data: admins } = await supabaseAdmin.from('admins').select('id')
  if (!admins) return
  const rows = admins.map(a => ({
    user_id: a.id, user_role: 'admin', title, message, type, link
  }))
  await supabaseAdmin.from('notifications').insert(rows)
}

// ── Invoice number generator ───────────────────────────────
export function generateInvoiceNo(): string {
  const now = new Date()
  const yy  = String(now.getFullYear()).slice(2)
  const mm  = String(now.getMonth() + 1).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 9000) + 1000)
  return `INV-${yy}${mm}-${rand}`
}

// ── Grade helper ───────────────────────────────────────────
export function autoGrade(marks: number): string {
  if (marks >= 80) return 'A'
  if (marks >= 70) return 'B'
  if (marks >= 60) return 'C'
  if (marks >= 50) return 'D'
  return 'F'
}
