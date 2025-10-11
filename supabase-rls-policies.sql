-- Disable RLS and add public read policies for development
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/gxquazeakfxqwiwkrixk/sql

-- Option 1: Disable RLS entirely (easiest for development)
ALTER TABLE IF EXISTS course_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lesson DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS room DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS facility DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS announcement DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assignment DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS submission DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS material DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course_material DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS college DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course_group DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

-- Option 2: Enable RLS with public read policies (more secure)
-- Uncomment the lines below if you want to use RLS with policies instead

/*
-- Enable RLS on all tables
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson ENABLE ROW LEVEL SECURITY;
ALTER TABLE course ENABLE ROW LEVEL SECURITY;
ALTER TABLE room ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on course_enrollments"
  ON course_enrollments FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on event"
  ON event FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on lesson"
  ON lesson FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on course"
  ON course FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on room"
  ON room FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on facility"
  ON facility FOR SELECT
  USING (true);
*/
