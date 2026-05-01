-- ============================================================
-- CUU Student Portal — Full University Schema v2
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── STUDENTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username            TEXT UNIQUE NOT NULL,
  password            TEXT NOT NULL,
  name                TEXT NOT NULL,
  reg_no              TEXT UNIQUE,
  email               TEXT DEFAULT '',
  phone               TEXT DEFAULT '',
  date_of_birth       DATE,
  gender              TEXT DEFAULT '',
  nationality         TEXT DEFAULT '',
  address             TEXT DEFAULT '',
  next_of_kin_name    TEXT DEFAULT '',
  next_of_kin_phone   TEXT DEFAULT '',
  -- Registration workflow status
  reg_status          TEXT DEFAULT 'pending'
                      CHECK (reg_status IN ('pending','course_selected','modules_registered',
                                            'documents_uploaded','documents_approved',
                                            'invoiced','paid','active')),
  -- Academic info
  programme           TEXT DEFAULT '',
  faculty             TEXT DEFAULT '',
  shift               TEXT DEFAULT 'Day',
  semester_in_program INTEGER DEFAULT 1,
  current_term        TEXT DEFAULT '',
  current_year        TEXT DEFAULT '',
  -- Role
  role                TEXT DEFAULT 'student' CHECK (role IN ('student','admin')),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROGRAMMES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS programmes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  code       TEXT UNIQUE NOT NULL,
  faculty    TEXT NOT NULL,
  duration   INTEGER DEFAULT 3,  -- years
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MODULES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id UUID REFERENCES programmes(id) ON DELETE CASCADE,
  code         TEXT NOT NULL,
  name         TEXT NOT NULL,
  credits      INTEGER DEFAULT 3,
  year         INTEGER DEFAULT 1,
  semester     INTEGER DEFAULT 1,
  description  TEXT DEFAULT '',
  lecturer     TEXT DEFAULT '',
  lecturer_email TEXT DEFAULT '',
  schedule     TEXT DEFAULT '',  -- e.g. "Mon/Wed 08:00-10:00, Room LT1"
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── STUDENT MODULE REGISTRATIONS ──────────────────────────
CREATE TABLE IF NOT EXISTS student_modules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_id  UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  term       TEXT DEFAULT '',
  year       TEXT DEFAULT '',
  status     TEXT DEFAULT 'registered' CHECK (status IN ('registered','completed','failed','withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, module_id, term, year)
);

-- ── DOCUMENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  doc_type    TEXT NOT NULL,  -- 'national_id','o_level','a_level','degree','passport_photo', etc.
  file_url    TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_note  TEXT DEFAULT '',
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── INVOICES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no      TEXT UNIQUE NOT NULL,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term            TEXT NOT NULL,
  year            TEXT NOT NULL,
  semester        INTEGER DEFAULT 1,
  tuition         NUMERIC(12,2) DEFAULT 0,
  registration_fee NUMERIC(12,2) DEFAULT 20,
  other_fees      NUMERIC(12,2) DEFAULT 0,
  total           NUMERIC(12,2) DEFAULT 0,
  currency        TEXT DEFAULT 'USD',
  due_date        DATE,
  status          TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid','partial','paid')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── PAYMENTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  invoice_id     UUID REFERENCES invoices(id),
  amount         NUMERIC(12,2) NOT NULL,
  currency       TEXT DEFAULT 'USD',
  method         TEXT DEFAULT 'Mobile Money'
                 CHECK (method IN ('Mobile Money','Bank Transfer','Cash','Card')),
  reference      TEXT DEFAULT '',
  description    TEXT DEFAULT 'Tuition Fee',
  status         TEXT DEFAULT 'completed' CHECK (status IN ('pending','completed','failed')),
  payment_date   TIMESTAMPTZ DEFAULT NOW()
);

-- ── RESULTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS results (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_id  UUID REFERENCES modules(id),
  subject    TEXT NOT NULL,
  marks      NUMERIC(5,2) NOT NULL CHECK (marks >= 0 AND marks <= 100),
  grade      TEXT NOT NULL,
  semester   TEXT DEFAULT 'Semester 1',
  term       TEXT DEFAULT '',
  year       TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── NOTIFICATIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,   -- student or admin id
  user_role  TEXT DEFAULT 'student' CHECK (user_role IN ('student','admin')),
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT DEFAULT 'info'
             CHECK (type IN ('info','success','warning','error','approval','payment')),
  is_read    BOOLEAN DEFAULT FALSE,
  link       TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ADMIN USERS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username   TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  name       TEXT NOT NULL,
  email      TEXT DEFAULT '',
  role       TEXT DEFAULT 'admin' CHECK (role IN ('admin','super_admin','registrar','finance')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payments_student      ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_results_student       ON results(student_id);
CREATE INDEX IF NOT EXISTS idx_documents_student     ON documents(student_id);
CREATE INDEX IF NOT EXISTS idx_documents_status      ON documents(status);
CREATE INDEX IF NOT EXISTS idx_invoices_student      ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_student_modules_sid   ON student_modules(student_id);
CREATE INDEX IF NOT EXISTS idx_modules_programme     ON modules(programme_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON notifications(user_id, is_read);

-- ── DISABLE RLS (service role handles auth) ───────────────
ALTER TABLE students        DISABLE ROW LEVEL SECURITY;
ALTER TABLE programmes      DISABLE ROW LEVEL SECURITY;
ALTER TABLE modules         DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents       DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices        DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments        DISABLE ROW LEVEL SECURITY;
ALTER TABLE results         DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins          DISABLE ROW LEVEL SECURITY;

-- ── SEED: Default programmes ──────────────────────────────
INSERT INTO programmes (name, code, faculty, duration) VALUES
  ('Bachelor of Science in Software Engineering',    'BSSE',  'Science & Technology', 3),
  ('Bachelor of Science in Computer Science',        'BSCS',  'Science & Technology', 3),
  ('Bachelor of Information Technology',             'BIT',   'Science & Technology', 3),
  ('Bachelor of Business Administration',            'BBA',   'Business',             3),
  ('Bachelor of Commerce',                           'BCOM',  'Business',             3),
  ('Bachelor of Education',                          'BED',   'Education',            3),
  ('Bachelor of Laws',                               'LLB',   'Law',                  4),
  ('Bachelor of Science in Nursing',                 'BSN',   'Health Sciences',      4),
  ('Diploma in Computer Science',                    'DCS',   'Science & Technology', 2),
  ('Diploma in Business Studies',                    'DBS',   'Business',             2),
  ('Certificate in Information Technology',          'CIT',   'Science & Technology', 1)
ON CONFLICT (code) DO NOTHING;

-- ── SEED: Default admin ───────────────────────────────────
-- Password: admin123 (bcrypt hash)
INSERT INTO admins (username, password, name, email, role) VALUES
  ('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'CUU Administrator', 'admin@cavendish.ac.ug', 'super_admin')
ON CONFLICT (username) DO NOTHING;
