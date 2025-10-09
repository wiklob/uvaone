-- Apply RLS policies for demo app (read-only access)

-- Drop existing policies if they exist
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname
              FROM pg_policies
              WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Enable RLS on all tables
ALTER TABLE IF EXISTS programme ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS programme_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS college ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course_colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS college_faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS college_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS material ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS objective_tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teaching_method_tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course_teaching_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS facility ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS room ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lesson ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS submission ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS announcement ENABLE ROW LEVEL SECURITY;

-- Create read-only policies for all tables
CREATE POLICY "Allow public read access on programme" ON programme FOR SELECT USING (true);
CREATE POLICY "Allow public read access on course" ON course FOR SELECT USING (true);
CREATE POLICY "Allow public read access on programme_courses" ON programme_courses FOR SELECT USING (true);
CREATE POLICY "Allow public read access on college" ON college FOR SELECT USING (true);
CREATE POLICY "Allow public read access on faculty" ON faculty FOR SELECT USING (true);
CREATE POLICY "Allow public read access on course_colleges" ON course_colleges FOR SELECT USING (true);
CREATE POLICY "Allow public read access on college_faculties" ON college_faculties FOR SELECT USING (true);
CREATE POLICY "Allow public read access on user" ON "user" FOR SELECT USING (true);
CREATE POLICY "Allow public read access on user_auth" ON user_auth FOR SELECT USING (true);
CREATE POLICY "Allow public read access on user_sessions" ON user_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public read access on course_enrollments" ON course_enrollments FOR SELECT USING (true);
CREATE POLICY "Allow public read access on college_members" ON college_members FOR SELECT USING (true);
CREATE POLICY "Allow public read access on course_groups" ON course_groups FOR SELECT USING (true);
CREATE POLICY "Allow public read access on course_group_members" ON course_group_members FOR SELECT USING (true);
CREATE POLICY "Allow public read access on prerequisites" ON prerequisites FOR SELECT USING (true);
CREATE POLICY "Allow public read access on material" ON material FOR SELECT USING (true);
CREATE POLICY "Allow public read access on course_materials" ON course_materials FOR SELECT USING (true);
CREATE POLICY "Allow public read access on objective_tag" ON objective_tag FOR SELECT USING (true);
CREATE POLICY "Allow public read access on course_objectives" ON course_objectives FOR SELECT USING (true);
CREATE POLICY "Allow public read access on teaching_method_tag" ON teaching_method_tag FOR SELECT USING (true);
CREATE POLICY "Allow public read access on course_teaching_methods" ON course_teaching_methods FOR SELECT USING (true);
CREATE POLICY "Allow public read access on facility" ON facility FOR SELECT USING (true);
CREATE POLICY "Allow public read access on room" ON room FOR SELECT USING (true);
CREATE POLICY "Allow public read access on lesson" ON lesson FOR SELECT USING (true);
CREATE POLICY "Allow public read access on event" ON event FOR SELECT USING (true);
CREATE POLICY "Allow public read access on attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "Allow public read access on assignment" ON assignment FOR SELECT USING (true);
CREATE POLICY "Allow public read access on submission" ON submission FOR SELECT USING (true);
CREATE POLICY "Allow public read access on announcement" ON announcement FOR SELECT USING (true);
