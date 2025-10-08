-- =============================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- =============================================

-- Core Tables
ALTER TABLE programme ENABLE ROW LEVEL SECURITY;
ALTER TABLE course ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE college ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_faculties ENABLE ROW LEVEL SECURITY;

-- User Tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_members ENABLE ROW LEVEL SECURITY;

-- Course Organization
ALTER TABLE course_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE prerequisites ENABLE ROW LEVEL SECURITY;

-- Materials & Tags
ALTER TABLE material ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_method_tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_teaching_methods ENABLE ROW LEVEL SECURITY;

-- Facilities & Rooms
ALTER TABLE facility ENABLE ROW LEVEL SECURITY;
ALTER TABLE room ENABLE ROW LEVEL SECURITY;

-- Lessons & Events
ALTER TABLE lesson ENABLE ROW LEVEL SECURITY;
ALTER TABLE event ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Assignments & Submissions
ALTER TABLE assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission ENABLE ROW LEVEL SECURITY;

-- Announcements
ALTER TABLE announcement ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE READ-ONLY POLICIES FOR ALL TABLES
-- =============================================

-- Core Tables
CREATE POLICY "Allow public read access on programme" ON programme FOR SELECT USING (true);
CREATE POLICY "Allow public read access on course" ON course FOR SELECT USING (true);
CREATE POLICY "Allow public read access on programme_courses" ON programme_courses FOR SELECT USING (true);
CREATE POLICY "Allow public read access on college" ON college FOR SELECT USING (true);
CREATE POLICY "Allow public read access on faculty" ON faculty FOR SELECT USING (true);
CREATE POLICY "Allow public read access on course_colleges" ON course_colleges FOR SELECT USING (true);
CREATE POLICY "Allow public read access on college_faculties" ON college_faculties FOR SELECT USING (true);

-- User Tables
CREATE POLICY "Allow public read access on user" ON "user" FOR SELECT USING (true);
CREATE POLICY "Allow public read access on user_auth" ON user_auth FOR SELECT USING (true);
CREATE POLICY "Allow public read access on user_sessions" ON user_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public read access on course_enrollments" ON course_enrollments FOR SELECT USING (true);
CREATE POLICY "Allow public read access on college_members" ON college_members FOR SELECT USING (true);

-- Course Organization
CREATE POLICY "Allow public read access on course_groups" ON course_groups FOR SELECT USING (true);
CREATE POLICY "Allow public read access on course_group_members" ON course_group_members FOR SELECT USING (true);
CREATE POLICY "Allow public read access on prerequisites" ON prerequisites FOR SELECT USING (true);

-- Materials & Tags
CREATE POLICY "Allow public read access on material" ON material FOR SELECT USING (true);
CREATE POLICY "Allow public read access on course_materials" ON course_materials FOR SELECT USING (true);
CREATE POLICY "Allow public read access on objective_tag" ON objective_tag FOR SELECT USING (true);
CREATE POLICY "Allow public read access on course_objectives" ON course_objectives FOR SELECT USING (true);
CREATE POLICY "Allow public read access on teaching_method_tag" ON teaching_method_tag FOR SELECT USING (true);
CREATE POLICY "Allow public read access on course_teaching_methods" ON course_teaching_methods FOR SELECT USING (true);

-- Facilities & Rooms
CREATE POLICY "Allow public read access on facility" ON facility FOR SELECT USING (true);
CREATE POLICY "Allow public read access on room" ON room FOR SELECT USING (true);

-- Lessons & Events
CREATE POLICY "Allow public read access on lesson" ON lesson FOR SELECT USING (true);
CREATE POLICY "Allow public read access on event" ON event FOR SELECT USING (true);
CREATE POLICY "Allow public read access on attendance" ON attendance FOR SELECT USING (true);

-- Assignments & Submissions
CREATE POLICY "Allow public read access on assignment" ON assignment FOR SELECT USING (true);
CREATE POLICY "Allow public read access on submission" ON submission FOR SELECT USING (true);

-- Announcements
CREATE POLICY "Allow public read access on announcement" ON announcement FOR SELECT USING (true);
