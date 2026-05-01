import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (uses service role key — never expose to browser)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export type Database = {
  students: {
    id: string
    username: string
    password: string
    name: string
    reg_no: string
    course: string
    email: string
    phone: string
    created_at: string
  }
  payments: {
    id: string
    student_id: string
    amount: number
    description: string
    payment_date: string
  }
  results: {
    id: string
    student_id: string
    subject: string
    marks: number
    grade: string
    semester: string
    created_at: string
  }
}
