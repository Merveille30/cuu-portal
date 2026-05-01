-- ============================================================
-- CUU Student Portal — FINAL COMPLETE SETUP SQL
-- 
-- HOW TO USE:
-- 1. Go to Supabase Dashboard → SQL Editor → New Query
-- 2. Paste this ENTIRE file and click RUN
-- ============================================================

-- ── Drop old tables cleanly ────────────────────────────────
DROP TABLE IF EXISTS student_modules CASCADE;
DROP TABLE IF EXISTS student_reports  CASCADE;
DROP TABLE IF EXISTS documents        CASCADE;
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
  reg_no               TEXT UNIQUE,
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

-- ── STUDENT REPORTS / LEDGERS ────────────────────────────
CREATE TABLE student_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type         TEXT NOT NULL DEFAULT 'report',
  title        TEXT NOT NULL,
  content      TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'pending',
  requested_by TEXT NOT NULL DEFAULT 'student',
  shared_by    TEXT NOT NULL DEFAULT '',
  shared_at    TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_reports_student ON student_reports(student_id);
ALTER TABLE student_reports DISABLE ROW LEVEL SECURITY;

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

-- ── SEED: 4 modules per programme ─────────────────────────
DO $$
DECLARE
  p_bsse UUID; p_bscs UUID; p_bit  UUID;
  p_bba  UUID; p_bcom UUID; p_bed  UUID;
  p_llb  UUID; p_bsn  UUID; p_dcs  UUID;
  p_dbs  UUID; p_cit  UUID;
BEGIN
  SELECT id INTO p_bsse FROM programmes WHERE code='BSSE';
  SELECT id INTO p_bscs FROM programmes WHERE code='BSCS';
  SELECT id INTO p_bit  FROM programmes WHERE code='BIT';
  SELECT id INTO p_bba  FROM programmes WHERE code='BBA';
  SELECT id INTO p_bcom FROM programmes WHERE code='BCOM';
  SELECT id INTO p_bed  FROM programmes WHERE code='BED';
  SELECT id INTO p_llb  FROM programmes WHERE code='LLB';
  SELECT id INTO p_bsn  FROM programmes WHERE code='BSN';
  SELECT id INTO p_dcs  FROM programmes WHERE code='DCS';
  SELECT id INTO p_dbs  FROM programmes WHERE code='DBS';
  SELECT id INTO p_cit  FROM programmes WHERE code='CIT';

  -- BSSE modules
  INSERT INTO modules (programme_id,code,name,credits,year,semester,description,lecturer,schedule) VALUES
    (p_bsse,'BSSE1101','Introduction to Programming',   3,1,1,'Python fundamentals and problem solving',       'Dr. Okello James',   'Mon/Wed 08:00-10:00, LT1'),
    (p_bsse,'BSSE1102','Mathematics for Computing',     3,1,1,'Discrete maths, logic and set theory',          'Mr. Ssemakula Paul', 'Tue/Thu 10:00-12:00, LT2'),
    (p_bsse,'BSSE1201','Data Structures & Algorithms',  3,1,2,'Arrays, trees, sorting and searching',          'Dr. Okello James',   'Mon/Wed 08:00-10:00, LT1'),
    (p_bsse,'BSSE2101','Software Engineering',          3,2,1,'SDLC, agile methods and design patterns',       'Dr. Mugisha Robert', 'Mon/Wed 10:00-12:00, LT4');

  -- BSCS modules
  INSERT INTO modules (programme_id,code,name,credits,year,semester,description,lecturer,schedule) VALUES
    (p_bscs,'BSCS1101','Computer Science Fundamentals', 3,1,1,'Core CS concepts and computational thinking',  'Dr. Nakato Sarah',   'Mon/Wed 08:00-10:00, LT2'),
    (p_bscs,'BSCS1102','Programming in C++',            3,1,1,'Object-oriented programming with C++',         'Mr. Kato Brian',     'Tue/Thu 08:00-10:00, Lab1'),
    (p_bscs,'BSCS1201','Database Systems',              3,1,2,'Relational databases, SQL and design',         'Ms. Namukasa Rita',  'Tue/Thu 10:00-12:00, LT3'),
    (p_bscs,'BSCS2101','Operating Systems',             3,2,1,'Process management, memory and file systems',  'Dr. Nakato Sarah',   'Mon/Wed 10:00-12:00, LT2');

  -- BIT modules
  INSERT INTO modules (programme_id,code,name,credits,year,semester,description,lecturer,schedule) VALUES
    (p_bit,'BIT1101','IT Fundamentals',                 3,1,1,'Introduction to information technology',       'Mr. Kato Brian',     'Mon/Wed 08:00-10:00, LT3'),
    (p_bit,'BIT1102','Web Technologies',                3,1,1,'HTML, CSS and JavaScript basics',              'Ms. Namukasa Rita',  'Tue/Thu 08:00-10:00, Lab1'),
    (p_bit,'BIT1201','Networking Fundamentals',         3,1,2,'TCP/IP, LAN/WAN and network protocols',        'Dr. Nakato Sarah',   'Mon/Wed 10:00-12:00, LT3'),
    (p_bit,'BIT2101','Systems Analysis & Design',       3,2,1,'Requirements gathering and system modelling',  'Dr. Mugisha Robert', 'Tue/Thu 10:00-12:00, LT4');

  -- BBA modules
  INSERT INTO modules (programme_id,code,name,credits,year,semester,description,lecturer,schedule) VALUES
    (p_bba,'BBA1101','Principles of Management',        3,1,1,'Management theories and organisational behaviour','Mr. Tumwine Alex', 'Mon/Wed 08:00-10:00, LT5'),
    (p_bba,'BBA1102','Business Mathematics',            3,1,1,'Quantitative methods for business decisions',  'Ms. Akello Grace',   'Tue/Thu 08:00-10:00, LT5'),
    (p_bba,'BBA1201','Financial Accounting',            3,1,2,'Bookkeeping, ledgers and financial statements', 'Mr. Tumwine Alex',  'Mon/Wed 10:00-12:00, LT5'),
    (p_bba,'BBA2101','Marketing Management',            3,2,1,'Market research, strategy and consumer behaviour','Ms. Akello Grace', 'Tue/Thu 10:00-12:00, LT5');

  -- BCOM modules
  INSERT INTO modules (programme_id,code,name,credits,year,semester,description,lecturer,schedule) VALUES
    (p_bcom,'BCOM1101','Introduction to Commerce',      3,1,1,'Trade, commerce and business environment',     'Mr. Tumwine Alex',   'Mon/Wed 08:00-10:00, LT6'),
    (p_bcom,'BCOM1102','Business Communication',        3,1,1,'Professional writing and presentation skills', 'Ms. Akello Grace',   'Tue/Thu 08:00-10:00, LT6'),
    (p_bcom,'BCOM1201','Microeconomics',                3,1,2,'Supply, demand and market structures',         'Mr. Tumwine Alex',   'Mon/Wed 10:00-12:00, LT6'),
    (p_bcom,'BCOM2101','Corporate Finance',             3,2,1,'Capital structure, investment and valuation',  'Ms. Akello Grace',   'Tue/Thu 10:00-12:00, LT6');

  -- BED modules
  INSERT INTO modules (programme_id,code,name,credits,year,semester,description,lecturer,schedule) VALUES
    (p_bed,'BED1101','Introduction to Education',       3,1,1,'Philosophy and history of education',          'Dr. Namutebi Joan',  'Mon/Wed 08:00-10:00, LT7'),
    (p_bed,'BED1102','Child Psychology',                3,1,1,'Cognitive and emotional development in children','Dr. Namutebi Joan', 'Tue/Thu 08:00-10:00, LT7'),
    (p_bed,'BED1201','Curriculum Development',          3,1,2,'Designing and evaluating educational curricula','Mr. Byaruhanga Sam','Mon/Wed 10:00-12:00, LT7'),
    (p_bed,'BED2101','Teaching Methods',                3,2,1,'Pedagogy, lesson planning and classroom management','Mr. Byaruhanga Sam','Tue/Thu 10:00-12:00, LT7');

  -- LLB modules
  INSERT INTO modules (programme_id,code,name,credits,year,semester,description,lecturer,schedule) VALUES
    (p_llb,'LLB1101','Introduction to Law',             3,1,1,'Legal systems, sources of law and jurisprudence','Adv. Ssali Peter',  'Mon/Wed 08:00-10:00, LT8'),
    (p_llb,'LLB1102','Constitutional Law',              3,1,1,'Uganda constitution and fundamental rights',   'Adv. Ssali Peter',   'Tue/Thu 08:00-10:00, LT8'),
    (p_llb,'LLB1201','Contract Law',                    3,1,2,'Formation, terms and breach of contracts',     'Adv. Nakimuli Rose', 'Mon/Wed 10:00-12:00, LT8'),
    (p_llb,'LLB2101','Criminal Law',                    3,2,1,'Offences, defences and criminal procedure',   'Adv. Nakimuli Rose', 'Tue/Thu 10:00-12:00, LT8');

  -- BSN modules
  INSERT INTO modules (programme_id,code,name,credits,year,semester,description,lecturer,schedule) VALUES
    (p_bsn,'BSN1101','Anatomy & Physiology',            3,1,1,'Human body systems and functions',             'Dr. Nanteza Lydia',  'Mon/Wed 08:00-10:00, LT9'),
    (p_bsn,'BSN1102','Fundamentals of Nursing',         3,1,1,'Basic nursing care and patient safety',        'Dr. Nanteza Lydia',  'Tue/Thu 08:00-10:00, Lab2'),
    (p_bsn,'BSN1201','Microbiology & Infection Control',3,1,2,'Pathogens, immunity and infection prevention', 'Dr. Opio Charles',   'Mon/Wed 10:00-12:00, LT9'),
    (p_bsn,'BSN2101','Medical-Surgical Nursing',        3,2,1,'Care of adult patients with medical conditions','Dr. Opio Charles',  'Tue/Thu 10:00-12:00, Lab2');

  -- DCS modules
  INSERT INTO modules (programme_id,code,name,credits,year,semester,description,lecturer,schedule) VALUES
    (p_dcs,'DCS1101','Computer Basics',                 3,1,1,'Hardware, software and operating systems',     'Mr. Kato Brian',     'Mon/Wed 08:00-10:00, Lab1'),
    (p_dcs,'DCS1102','Introduction to Programming',     3,1,1,'Programming logic using Python',               'Ms. Namukasa Rita',  'Tue/Thu 08:00-10:00, Lab1'),
    (p_dcs,'DCS1201','Web Design',                      3,1,2,'HTML, CSS and responsive design',              'Mr. Kato Brian',     'Mon/Wed 10:00-12:00, Lab1'),
    (p_dcs,'DCS2101','Database Fundamentals',           3,2,1,'Introduction to databases and SQL',            'Ms. Namukasa Rita',  'Tue/Thu 10:00-12:00, Lab1');

  -- DBS modules
  INSERT INTO modules (programme_id,code,name,credits,year,semester,description,lecturer,schedule) VALUES
    (p_dbs,'DBS1101','Business Principles',             3,1,1,'Introduction to business and entrepreneurship','Mr. Tumwine Alex',   'Mon/Wed 08:00-10:00, LT6'),
    (p_dbs,'DBS1102','Accounting Basics',               3,1,1,'Basic bookkeeping and financial records',      'Ms. Akello Grace',   'Tue/Thu 08:00-10:00, LT6'),
    (p_dbs,'DBS1201','Business Law',                    3,1,2,'Legal framework for business operations',      'Adv. Ssali Peter',   'Mon/Wed 10:00-12:00, LT6'),
    (p_dbs,'DBS2101','Human Resource Management',       3,2,1,'Recruitment, training and employee relations', 'Mr. Tumwine Alex',   'Tue/Thu 10:00-12:00, LT6');

  -- CIT modules
  INSERT INTO modules (programme_id,code,name,credits,year,semester,description,lecturer,schedule) VALUES
    (p_cit,'CIT1101','Computer Applications',           3,1,1,'MS Office, email and internet skills',         'Mr. Kato Brian',     'Mon/Wed 08:00-10:00, Lab1'),
    (p_cit,'CIT1102','IT Support Basics',               3,1,1,'Hardware troubleshooting and maintenance',     'Ms. Namukasa Rita',  'Tue/Thu 08:00-10:00, Lab1'),
    (p_cit,'CIT1201','Networking Essentials',           3,1,2,'Basic networking and internet connectivity',   'Mr. Kato Brian',     'Mon/Wed 10:00-12:00, Lab1'),
    (p_cit,'CIT1202','Cybersecurity Awareness',         3,1,2,'Online safety, passwords and data protection', 'Ms. Namukasa Rita',  'Tue/Thu 10:00-12:00, Lab1');

END $$;

-- ── SEED: Admin account ───────────────────────────────────
-- Username: cuuadmin  |  Password: Admin@CUU2025
INSERT INTO admins (username, password, name, email, role) VALUES (
  'cuuadmin',
  '$2b$12$EcwQzFWYiuLTpqUnaDH8ceKTs9RLr1FJIn1dYUNgOkj/WBCSXnPXa',
  'CUU Administrator',
  'admin@cavendish.ac.ug',
  'super_admin'
);
