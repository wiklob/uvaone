-- Enable UUID extension (Supabase uses gen_random_uuid() by default)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE TABLES
-- =============================================

-- Programme
CREATE TABLE programme (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course
CREATE TABLE course (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ects INT NOT NULL,
  period INT CHECK (period >= 1 AND period <= 5),
  language TEXT,
  max_students INT,
  registration_start TIMESTAMP WITH TIME ZONE,
  registration_end TIMESTAMP WITH TIME ZONE,
  objectives TEXT,
  teaching_methods TEXT,
  contact_hours INT,
  academic_year TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programme Courses (junction)
CREATE TABLE programme_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id UUID NOT NULL REFERENCES programme(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  required BOOLEAN DEFAULT true,
  semester INT,
  UNIQUE(programme_id, course_id)
);

-- College
CREATE TABLE college (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  email TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Faculty
CREATE TABLE faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  college_id UUID REFERENCES college(id) ON DELETE SET NULL,
  dean_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course Colleges (junction)
CREATE TABLE course_colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES college(id) ON DELETE CASCADE,
  UNIQUE(course_id, college_id)
);

-- College Faculties (junction)
CREATE TABLE college_faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES college(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  UNIQUE(college_id, faculty_id)
);

-- =============================================
-- USER TABLES
-- =============================================

-- User
CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  student_number TEXT UNIQUE,
  date_of_birth DATE,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'graduated', 'alumni')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Auth
CREATE TABLE user_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  auth_provider TEXT DEFAULT 'email' CHECK (auth_provider IN ('email', 'google', 'microsoft', 'saml')),
  last_login TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  reset_token TEXT,
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  logged_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logged_out_at TIMESTAMP WITH TIME ZONE,
  session_token TEXT UNIQUE
);

-- Course Enrollments (junction)
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'lecturer', 'tutor', 'coordinator')),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed', 'waitlist')),
  final_grade DECIMAL,
  grade_letter TEXT,
  UNIQUE(course_id, user_id, role)
);

-- College Members (junction)
CREATE TABLE college_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES college(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'tutor', 'lead', 'coordinator')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(college_id, user_id, role)
);

-- =============================================
-- COURSE ORGANIZATION
-- =============================================

-- Course Groups
CREATE TABLE course_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('lecture', 'tutorial', 'lab', 'seminar')),
  max_students INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course Group Members (junction)
CREATE TABLE course_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_group_id UUID NOT NULL REFERENCES course_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_group_id, user_id)
);

-- Prerequisites
CREATE TABLE prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('course', 'programme', 'year', 'skill')),
  required_course_id UUID REFERENCES course(id) ON DELETE CASCADE,
  required_programme_id UUID REFERENCES programme(id) ON DELETE CASCADE,
  minimum_year INT,
  description TEXT
);

-- =============================================
-- MATERIALS & TAGS
-- =============================================

-- Material
CREATE TABLE material (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('book', 'video', 'article', 'research_paper', 'slides', 'dataset', 'software')),
  description TEXT,
  url TEXT,
  availability TEXT CHECK (availability IN ('library', 'open_access', 'paywall', 'university_license')),
  isbn TEXT,
  authors TEXT,
  publication_year INT,
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course Materials (junction)
CREATE TABLE course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES material(id) ON DELETE CASCADE,
  required BOOLEAN,
  "order" INT,
  UNIQUE(course_id, material_id)
);

-- Objective Tag
CREATE TABLE objective_tag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('skill', 'knowledge', 'competency'))
);

-- Course Objectives (junction)
CREATE TABLE course_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  objective_tag_id UUID NOT NULL REFERENCES objective_tag(id) ON DELETE CASCADE,
  UNIQUE(course_id, objective_tag_id)
);

-- Teaching Method Tag
CREATE TABLE teaching_method_tag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

-- Course Teaching Methods (junction)
CREATE TABLE course_teaching_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  teaching_method_tag_id UUID NOT NULL REFERENCES teaching_method_tag(id) ON DELETE CASCADE,
  UNIQUE(course_id, teaching_method_tag_id)
);

-- =============================================
-- FACILITIES & ROOMS
-- =============================================

-- Facility
CREATE TABLE facility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  opening_hours TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room
CREATE TABLE room (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  facility_id UUID NOT NULL REFERENCES facility(id) ON DELETE CASCADE,
  capacity INT NOT NULL,
  type TEXT CHECK (type IN ('lecture_hall', 'classroom', 'study_space', 'lab', 'exam_hall')),
  floor INT,
  equipment TEXT,
  accessibility TEXT,
  bookable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- LESSONS & EVENTS
-- =============================================

-- Lesson
CREATE TABLE lesson (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  course_group_id UUID REFERENCES course_groups(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('lecture', 'seminar', 'exam', 'tutorial', 'lab', 'workshop')),
  description TEXT,
  room_id UUID REFERENCES room(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event
CREATE TABLE event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT CHECK (recurrence_rule IN ('DAILY', 'WEEKLY', 'MONTHLY')),
  recurrence_end_date DATE,
  location_override TEXT,
  is_online BOOLEAN DEFAULT false,
  online_link TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'rescheduled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'excused', 'late')),
  checked_in_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(event_id, user_id)
);

-- =============================================
-- ASSIGNMENTS & SUBMISSIONS
-- =============================================

-- Assignment
CREATE TABLE assignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('homework', 'essay', 'project', 'exam', 'quiz', 'presentation')),
  max_points DECIMAL,
  weight DECIMAL CHECK (weight >= 0 AND weight <= 1),
  due_date TIMESTAMP WITH TIME ZONE,
  submission_type TEXT CHECK (submission_type IN ('file_upload', 'text', 'url', 'no_submission')),
  allows_late BOOLEAN DEFAULT false,
  late_penalty DECIMAL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submission
CREATE TABLE submission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignment(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content TEXT,
  file_url TEXT,
  external_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'graded', 'returned')),
  grade DECIMAL,
  feedback TEXT,
  graded_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
  graded_at TIMESTAMP WITH TIME ZONE,
  is_late BOOLEAN DEFAULT false,
  UNIQUE(assignment_id, user_id)
);

-- =============================================
-- ANNOUNCEMENTS
-- =============================================

-- Announcement
CREATE TABLE announcement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES course(id) ON DELETE CASCADE,
  college_id UUID REFERENCES college(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (course_id IS NOT NULL OR college_id IS NOT NULL)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_course_code ON course(code);
CREATE INDEX idx_course_status ON course(status);
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_student_number ON "user"(student_number);
CREATE INDEX idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_event_start_time ON event(start_time);
CREATE INDEX idx_event_lesson ON event(lesson_id);
CREATE INDEX idx_assignment_course ON assignment(course_id);
CREATE INDEX idx_submission_assignment ON submission(assignment_id);
CREATE INDEX idx_submission_user ON submission(user_id);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_programme_updated_at BEFORE UPDATE ON programme
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_updated_at BEFORE UPDATE ON course
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_updated_at BEFORE UPDATE ON event
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_updated_at BEFORE UPDATE ON assignment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcement_updated_at BEFORE UPDATE ON announcement
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key for faculty.dean_user_id (deferred because user table is created later)
ALTER TABLE faculty ADD CONSTRAINT fk_faculty_dean
  FOREIGN KEY (dean_user_id) REFERENCES "user"(id) ON DELETE SET NULL;
