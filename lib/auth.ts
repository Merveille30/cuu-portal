import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from './supabase'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
const COOKIE_NAME = 'cuu_session'

export interface SessionUser {
  id: string
  username: string
  name: string
  reg_no: string
}

export async function createSession(user: SessionUser) {
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    const payload = jwt.verify(token, JWT_SECRET) as SessionUser
    return payload
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getStudentById(id: string) {
  const { data } = await supabaseAdmin
    .from('students')
    .select('id, username, name, reg_no, course, email, phone, created_at')
    .eq('id', id)
    .single()
  return data
}

export function autoGrade(marks: number): string {
  if (marks >= 80) return 'A'
  if (marks >= 70) return 'B'
  if (marks >= 60) return 'C'
  if (marks >= 50) return 'D'
  return 'F'
}
