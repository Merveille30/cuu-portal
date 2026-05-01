-- ============================================================
-- CUU Student Portal — FINAL COMPLETE SETUP SQL
-- 
-- HOW TO USE:
-- 1. Go to Supabase Dashboard → SQL Editor → New Query
-- 2. Paste this ENTIRE file
-- 3. Click RUN
-- 4. Done — all tables, data and admin account created
-- ============================================================

-- ── Drop old tables cleanly (preserves nothing — fresh start) ──
DROP TABLE IF EXISTS student_modules CASCADE;
DROP TABLE IF EXISTS documents       CASCADE;
DROP TABLE IF EXISTS invoices        CASCADE;
DROP TABLE IF EXISTS payments        CASCADE;
DROP TABLE IF EXISTS results         CASCADE;
DROP TABLE IF EXISTS notifications   CASCADE;
DROP TABLE IF EXISTS modules         CASCADE;
DROP TABLE IF EXISTS programmes      CASCADE;
DROP TABLE IF EXISTS admins          CASCADE;
DROP TABLE IF EXISTS students        CASCADE;

-- ── STUDENTS ──────────────────────────────────────────────
CREATE TABLE students (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username             TEXT UNIQUE NOT NULL,
  password             TEXT NOT NULL,
  name                 TEXT NOT NULL,
  reg_no               TEXT UNIQUE,          -- nullable: assigned by admin later
  email                TEXT NOT NULL DEFAULT '',
  phone                TEXT NOT NULL DEFAULT '',
  date_of_birth        DATE,
  gender               TEXT NOT NULL DEFAULT '',
  nationality          TEXT NOT NULL DEFAULT '',
  address              TEXT NOT NULL DEFAULT '',
  next_of_kin_name     TEXT NOT NULL DEFAULT '',
  next_of_kin_phone    TEXT NOT NULL DEFAULT '',
  reg_status           TEXT NOT NULL DEFAULT 'pending',
  programme            TEXT NOT NULL DEFAULT '',
  faculty              TEXT NOT NULL DEFAULT '',
  shift                TEXT NOT NULL DEFAULT 'Day',
  semester_in_program  INTEGER NOT NULL DEFAULT 1,
  current_term         TEXT NOT NULL DEFAULT '',
  current_year         TEXT NOT NULL DEFAULT '',
  role                 TEXT NOT NULL DEFAULT 'student',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PROGRAMMES ────────────────────────────────────────────
CREATE TABLE programmes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  code       TEXT UNIQUE NOT NULL,
  faculty    TEXT NOT NULL,
  duration   INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── MODULES ───────────────────────────────────────────────
CREATE TABLE modules (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id   UUID REFERENCES programmes(id) ON DELETE CASCADE,
  code           TEXT NOT NULL,
  name           TEXT NOT NULL,
  credits        INTEGER NOT NULL DEFAULT 3,
  year           INTEGER NOT NULL DEFAULT 1,
  semester       INTEGER NOT NULL DEFAULT 1,
  description    TEXT NOT NULL DEFAULT '',
  lecturer       TEXT NOT NULL DEFAULT '',
  lecturer_email TEXT NOT NULL DEFAULT '',
  schedule       TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── STUDENT MODULE REGISTRATIONS ──────────────────────────
CREATE TABLE student_modules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_id  UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  term       TEXT NOT NULL DEFAULT '',
  year       TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'registered',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, module_id, term, year)
);

-- ── DOCUMENTS ─────────────────────────────────────────────
CREATE TABLE documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  doc_type    TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',
  admin_note  TEXT NOT NULL DEFAULT '',
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── INVOICES ──────────────────────────────────────────────
CREATE TABLE invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no       TEXT UNIQUE NOT NULL,
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term             TEXT NOT NULL,
  year             TEXT NOT NULL,
  semester         INTEGER NOT NULL DEFAULT 1,
  tuition          NUMERIC(12,2) NOT NULL DEFAULT 0,
  registration_fee NUMERIC(12,2) NOT NULL DEFAULT 20,
  other_fees       NUMERIC(12,2) NOT NULL DEFAULT 0,
  total            NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency         TEXT NOT NULL DEFAULT 'USD',
  due_date         DATE,
  status           TEXT NOT NULL DEFAULT 'unpaid',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PAYMENTS ──────────────────────────────────────────────
CREATE TABLE payments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  invoice_id   UUID REFERENCES invoices(id),
  amount       NUMERIC(12,2) NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'USD',
  method       TEXT NOT NULL DEFAULT 'Mobile Money',
  reference    TEXT NOT NULL DEFAULT '',
  description  TEXT NOT NULL DEFAULT 'Tuition Fee',
  status       TEXT NOT NULL DEFAULT 'completed',
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── RESULTS ───────────────────────────────────────────────
CREATE TABLE results (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_id  UUID REFERENCES modules(id),
  subject    TEXT NOT NULL,
  marks      NUMERIC(5,2) NOT NULL,
  grade      TEXT NOT NULL,
  semester   TEXT NOT NULL DEFAULT 'Semester 1',
  term       TEXT NOT NULL DEFAULT '',
  year       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── NOTIFICATIONS ─────────────────────────────────────────
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  user_role  TEXT NOT NULL DEFAULT 'student',
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'info',
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  link       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ADMINS ────────────────────────────────────────────────
CREATE TABLE admins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username   TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL DEFAULT '',
  role       TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── INDEXES ───────────────────────────────────────────────
CREATE INDEX idx_payments_student    ON payments(student_id);
CREATE INDEX idx_results_student     ON results(student_id);
CREATE INDEX idx_documents_student   ON documents(student_id);
CREATE INDEX idx_documents_status    ON documents(status);
CREATE INDEX idx_invoices_student    ON invoices(student_id);
CREATE INDEX idx_student_modules_sid ON student_modules(student_id);
CREATE INDEX idx_modules_programme   ON modules(programme_id);
CREATE INDEX idx_notifications_user  ON notifications(user_id);

-- ── DISABLE RLS ───────────────────────────────────────────
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

-- ── SEED: Programmes ──────────────────────────────────────
INSERT INTO programmes (name, code, faculty, duration) VALUES
  ('Bachelor of Science in Software Engineering', 'BSSE', 'Science & Technology', 3),
  ('Bachelor of Science in Computer Science',     'BSCS', 'Science & Technology', 3),
  ('Bachelor of Information Technology',          'BIT',  'Science & Technology', 3),
  ('Bachelor of Business Administration',         'BBA',  'Business',             3),
  ('Bachelor of Commerce',                        'BCOM', 'Business',             3),
  ('Bachelor of Education',                       'BED',  'Education',            3),
  ('Bachelor of Laws',                            'LLB',  'Law',                  4),
  ('Bachelor of Science in Nursing',              'BSN',  'Health Sciences',      4),
  ('Diploma in Computer Science',                 'DCS',  'Science & Technology', 2),
  ('Diploma in Business Studies',                 'DBS',  'Business',             2),
  ('Certificate in Information Technology',       'CIT',  'Science & Technology', 1);

-- ── SEED: Sample modules for BSSE ─────────────────────────
DO $$
DECLARE prog_id UUID;
BEGIN
  SELECT id INTO prog_id FROM programmes WHERE code = 'BSSE';
  INSERT INTO modules (programme_id, code, name, credits, year, semester, description, lecturer, schedule) VALUES
    (prog_id,'CSC1101','Introduction to Programming',    3,1,1,'Fundamentals of programming using Python','Dr. Okello James',   'Mon/Wed 08:00-10:00, LT1'),
    (prog_id,'CSC1102','Mathematics for Computing',      3,1,1,'Discrete mathematics and logic',          'Mr. Ssemakula Paul', 'Tue/Thu 10:00-12:00, LT2'),
    (prog_id,'CSC1103','Computer Organisation',          3,1,1,'Hardware fundamentals and architecture',  'Dr. Nakato Sarah',   'Mon/Fri 14:00-16:00, LT3'),
    (prog_id,'CSC1201','Data Structures & Algorithms',   3,1,2,'Arrays, linked lists, trees, sorting',    'Dr. Okello James',   'Mon/Wed 08:00-10:00, LT1'),
    (prog_id,'CSC1202','Database Systems',               3,1,2,'Relational databases and SQL',            'Ms. Namukasa Rita',  'Tue/Thu 10:00-12:00, LT2'),
    (prog_id,'CSC2101','Software Engineering',           3,2,1,'SDLC, agile, design patterns',            'Dr. Mugisha Robert', 'Mon/Wed 10:00-12:00, LT4'),
    (prog_id,'CSC2102','Web Development',                3,2,1,'HTML, CSS, JavaScript, React',            'Mr. Kato Brian',     'Tue/Thu 14:00-16:00, Lab1'),
    (prog_id,'CSC2201','Mobile Application Development', 3,2,2,'Android and iOS development',             'Mr. Kato Brian',     'Mon/Wed 14:00-16:00, Lab1'),
    (prog_id,'CSC2202','Computer Networks',              3,2,2,'TCP/IP, routing, network security',       'Dr. Nakato Sarah',   'Tue/Thu 08:00-10:00, LT3'),
    (prog_id,'CSC3101','Final Year Project I',           6,3,1,'Research proposal and literature review', 'Dr. Mugisha Robert', 'By appointment'),
    (prog_id,'CSC3201','Final Year Project II',          6,3,2,'Implementation and defence',              'Dr. Mugisha Robert', 'By appointment');
END $$;

-- ── SEED: Admin account ───────────────────────────────────
-- Username: cuuadmin
-- Password: Admin@CUU2025
INSERT INTO admins (username, password, name, email, role) VALUES (
  'cuuadmin',
  '$2b$12$EcwQzFWYiuLTpqUnaDH8ceKTs9RLr1FJIn1dYUNgOkj/WBCSXnPXa',
  'CUU Administrator',
  'admin@cavendish.ac.ug',
  'super_admin'
);
