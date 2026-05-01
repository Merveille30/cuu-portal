-- ============================================================
-- CUU Portal — Migration v2
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- This ADDS new columns to existing tables WITHOUT losing data
-- ============================================================

-- ── Add new columns to students ───────────────────────────
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS date_of_birth    DATE,
  ADD COLUMN IF NOT EXISTS gender           TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS nationality      TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS address          TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS next_of_kin_name  TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS next_of_kin_phone TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS reg_status       TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS programme        TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS faculty          TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS shift            TEXT DEFAULT 'Day',
  ADD COLUMN IF NOT EXISTS semester_in_program INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS current_term     TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS current_year     TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS role             TEXT DEFAULT 'student';

-- Migrate existing 'course' column data to 'programme' if course exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='course') THEN
    UPDATE students SET programme = course WHERE programme = '' AND course IS NOT NULL AND course != '';
  END IF;
END $$;

-- ── Create new tables ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS programmes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  code       TEXT UNIQUE NOT NULL,
  faculty    TEXT NOT NULL,
  duration   INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modules (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id   UUID REFERENCES programmes(id) ON DELETE CASCADE,
  code           TEXT NOT NULL,
  name           TEXT NOT NULL,
  credits        INTEGER DEFAULT 3,
  year           INTEGER DEFAULT 1,
  semester       INTEGER DEFAULT 1,
  description    TEXT DEFAULT '',
  lecturer       TEXT DEFAULT '',
  lecturer_email TEXT DEFAULT '',
  schedule       TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_modules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_id  UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  term       TEXT DEFAULT '',
  year       TEXT DEFAULT '',
  status     TEXT DEFAULT 'registered',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, module_id, term, year)
);

CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  doc_type    TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  status      TEXT DEFAULT 'pending',
  admin_note  TEXT DEFAULT '',
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no       TEXT UNIQUE NOT NULL,
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term             TEXT NOT NULL,
  year             TEXT NOT NULL,
  semester         INTEGER DEFAULT 1,
  tuition          NUMERIC(12,2) DEFAULT 0,
  registration_fee NUMERIC(12,2) DEFAULT 20,
  other_fees       NUMERIC(12,2) DEFAULT 0,
  total            NUMERIC(12,2) DEFAULT 0,
  currency         TEXT DEFAULT 'USD',
  due_date         DATE,
  status           TEXT DEFAULT 'unpaid',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Keep old payments table but add new columns
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id),
  ADD COLUMN IF NOT EXISTS currency   TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS method     TEXT DEFAULT 'Mobile Money',
  ADD COLUMN IF NOT EXISTS reference  TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS status     TEXT DEFAULT 'completed';

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  user_role  TEXT DEFAULT 'student',
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT DEFAULT 'info',
  is_read    BOOLEAN DEFAULT FALSE,
  link       TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username   TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  name       TEXT NOT NULL,
  email      TEXT DEFAULT '',
  role       TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_documents_student     ON documents(student_id);
CREATE INDEX IF NOT EXISTS idx_documents_status      ON documents(status);
CREATE INDEX IF NOT EXISTS idx_invoices_student      ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_student_modules_sid   ON student_modules(student_id);
CREATE INDEX IF NOT EXISTS idx_modules_programme     ON modules(programme_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id);

-- ── Disable RLS on all tables ──────────────────────────────
ALTER TABLE students        DISABLE ROW LEVEL SECURITY;
ALTER TABLE programmes      DISABLE ROW LEVEL SECURITY;
ALTER TABLE modules         DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents       DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices        DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments        DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins          DISABLE ROW LEVEL SECURITY;

-- ── Seed programmes ────────────────────────────────────────
INSERT INTO programmes (name, code, faculty, duration) VALUES
  ('Bachelor of Science in Software Engineering',  'BSSE', 'Science & Technology', 3),
  ('Bachelor of Science in Computer Science',      'BSCS', 'Science & Technology', 3),
  ('Bachelor of Information Technology',           'BIT',  'Science & Technology', 3),
  ('Bachelor of Business Administration',          'BBA',  'Business',             3),
  ('Bachelor of Commerce',                         'BCOM', 'Business',             3),
  ('Bachelor of Education',                        'BED',  'Education',            3),
  ('Bachelor of Laws',                             'LLB',  'Law',                  4),
  ('Bachelor of Science in Nursing',               'BSN',  'Health Sciences',      4),
  ('Diploma in Computer Science',                  'DCS',  'Science & Technology', 2),
  ('Diploma in Business Studies',                  'DBS',  'Business',             2),
  ('Certificate in Information Technology',        'CIT',  'Science & Technology', 1)
ON CONFLICT (code) DO NOTHING;

-- ── Seed sample modules for BSSE ──────────────────────────
DO $$
DECLARE prog_id UUID;
BEGIN
  SELECT id INTO prog_id FROM programmes WHERE code = 'BSSE';
  IF prog_id IS NOT NULL THEN
    INSERT INTO modules (programme_id, code, name, credits, year, semester, description, lecturer, schedule) VALUES
      (prog_id, 'CSC1101', 'Introduction to Programming',     3, 1, 1, 'Fundamentals of programming using Python', 'Dr. Okello James', 'Mon/Wed 08:00-10:00, LT1'),
      (prog_id, 'CSC1102', 'Mathematics for Computing',       3, 1, 1, 'Discrete mathematics and logic', 'Mr. Ssemakula Paul', 'Tue/Thu 10:00-12:00, LT2'),
      (prog_id, 'CSC1103', 'Computer Organisation',           3, 1, 1, 'Hardware fundamentals and architecture', 'Dr. Nakato Sarah', 'Mon/Fri 14:00-16:00, LT3'),
      (prog_id, 'CSC1201', 'Data Structures & Algorithms',    3, 1, 2, 'Arrays, linked lists, trees, sorting', 'Dr. Okello James', 'Mon/Wed 08:00-10:00, LT1'),
      (prog_id, 'CSC1202', 'Database Systems',                3, 1, 2, 'Relational databases and SQL', 'Ms. Namukasa Rita', 'Tue/Thu 10:00-12:00, LT2'),
      (prog_id, 'CSC2101', 'Software Engineering',            3, 2, 1, 'SDLC, agile, design patterns', 'Dr. Mugisha Robert', 'Mon/Wed 10:00-12:00, LT4'),
      (prog_id, 'CSC2102', 'Web Development',                 3, 2, 1, 'HTML, CSS, JavaScript, React', 'Mr. Kato Brian', 'Tue/Thu 14:00-16:00, Lab1'),
      (prog_id, 'CSC2201', 'Mobile Application Development',  3, 2, 2, 'Android and iOS development', 'Mr. Kato Brian', 'Mon/Wed 14:00-16:00, Lab1'),
      (prog_id, 'CSC2202', 'Computer Networks',               3, 2, 2, 'TCP/IP, routing, network security', 'Dr. Nakato Sarah', 'Tue/Thu 08:00-10:00, LT3'),
      (prog_id, 'CSC3101', 'Final Year Project I',            6, 3, 1, 'Research proposal and literature review', 'Dr. Mugisha Robert', 'By appointment'),
      (prog_id, 'CSC3201', 'Final Year Project II',           6, 3, 2, 'Implementation and defence', 'Dr. Mugisha Robert', 'By appointment')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ── Seed default admin ─────────────────────────────────────
-- Password: admin123
INSERT INTO admins (username, password, name, email, role) VALUES
  ('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'CUU Administrator', 'admin@cavendish.ac.ug', 'super_admin')
ON CONFLICT (username) DO NOTHING;
