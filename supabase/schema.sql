-- ============================================================
-- CUU Student Portal — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username   TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  name       TEXT NOT NULL,
  reg_no     TEXT UNIQUE NOT NULL,
  course     TEXT DEFAULT '',
  email      TEXT DEFAULT '',
  phone      TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount       NUMERIC(12,2) NOT NULL,
  description  TEXT DEFAULT 'Tuition Fee',
  payment_date TIMESTAMPTZ DEFAULT NOW()
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject    TEXT NOT NULL,
  marks      INTEGER NOT NULL CHECK (marks >= 0 AND marks <= 100),
  grade      TEXT NOT NULL,
  semester   TEXT DEFAULT 'Semester 1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_results_student  ON results(student_id);

-- Row Level Security (RLS) — disable for service role access via API
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE results  DISABLE ROW LEVEL SECURITY;
