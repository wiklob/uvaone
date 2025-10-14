-- =============================================
-- ADD MORE ANNOUNCEMENTS FOR ALL COURSES
-- Migration to populate additional course announcements
-- =============================================

-- Programming Course Announcements
INSERT INTO announcement (course_id, college_id, author_id, title, content, priority, published, published_at) VALUES
('a0000001-0001-0001-0001-000000000001', NULL, '71111111-1111-1111-1111-111111111111', 'Midterm Exam Schedule', 'The midterm exam will take place on November 12th at 9:00 AM in the main lecture hall. The exam covers all material from weeks 1-6. Please review the practice problems posted on the course page.', 'urgent', true, '2025-10-15 10:00:00+02'),
('a0000001-0001-0001-0001-000000000001', NULL, '71111111-1111-1111-1111-111111111111', 'Office Hours This Week', 'I will be holding extra office hours this Thursday from 2-4 PM to help with assignment questions. Room SP A1.10.', 'normal', true, '2025-10-14 14:30:00+02'),
('a0000001-0001-0001-0001-000000000001', NULL, '71111111-1111-1111-1111-111111111111', 'Python Resources Available', 'Additional Python tutorials and coding exercises have been uploaded to the course materials section. These are great for extra practice!', 'normal', true, '2025-10-10 11:00:00+02'),

-- Algorithms Course Announcements
('a0000002-0002-0002-0002-000000000002', NULL, '72222222-2222-2222-2222-222222222222', 'Assignment Extension', 'Due to popular request, the Sorting Algorithms assignment deadline has been extended to October 27th at 23:59. No further extensions will be granted.', 'high', true, '2025-10-16 09:00:00+02'),
('a0000002-0002-0002-0002-000000000002', NULL, '72222222-2222-2222-2222-222222222222', 'Tutorial Session Topics', 'This week''s tutorial will focus on dynamic programming and memoization techniques. Come prepared with questions from the lecture!', 'normal', true, '2025-10-13 16:00:00+02'),
('a0000002-0002-0002-0002-000000000002', NULL, '72222222-2222-2222-2222-222222222222', 'Recommended Reading', 'For those struggling with graph algorithms, I highly recommend chapter 22-24 of the CLRS textbook. These chapters provide excellent examples and explanations.', 'normal', true, '2025-10-11 13:00:00+02'),

-- Databases Course Announcements
('a0000003-0003-0003-0003-000000000003', NULL, '73333333-3333-3333-3333-333333333333', 'SQL Lab Cancelled - Rescheduled', 'Friday''s SQL lab has been cancelled due to a facility issue. It will be rescheduled for next Monday at the same time. Check your email for room details.', 'urgent', true, '2025-10-15 15:00:00+02'),
('a0000003-0003-0003-0003-000000000003', NULL, '73333333-3333-3333-3333-333333333333', 'Project Teams Due', 'Please form your teams for the Database Design Project by October 20th. Teams should consist of 3-4 students. Submit team names via the course portal.', 'high', true, '2025-10-14 10:00:00+02'),
('a0000003-0003-0003-0003-000000000003', NULL, '73333333-3333-3333-3333-333333333333', 'Database Server Access', 'All students now have access to the practice database server. Connection details and credentials have been sent to your UvA email addresses.', 'normal', true, '2025-10-12 12:00:00+02'),

-- Machine Learning Course Announcements
('a0000004-0004-0004-0004-000000000004', NULL, '74444444-4444-4444-4444-444444444444', 'Dataset Available for Project', 'The dataset for the ML Classification project is now available for download. Please read the data dictionary carefully and start exploratory data analysis.', 'high', true, '2025-10-15 08:00:00+02'),
('a0000004-0004-0004-0004-000000000004', NULL, '74444444-4444-4444-4444-444444444444', 'GPU Resources Information', 'Students working on neural network projects can request access to GPU compute resources. Fill out the request form on the course website by October 25th.', 'normal', true, '2025-10-13 14:00:00+02'),

-- Web Development Course Announcements
('a0000005-0005-0005-0005-000000000005', NULL, '71111111-1111-1111-1111-111111111111', 'React Workshop Next Week', 'We will be hosting a special React workshop next Wednesday from 3-5 PM. This is optional but highly recommended for your portfolio project.', 'normal', true, '2025-10-16 10:00:00+02'),
('a0000005-0005-0005-0005-000000000005', NULL, '71111111-1111-1111-1111-111111111111', 'Portfolio Project Requirements', 'The portfolio project requirements have been updated with additional technical specifications. Please review the updated rubric on the course page.', 'high', true, '2025-10-14 11:30:00+02'),

-- Software Engineering Course Announcements
('a0000006-0006-0006-0006-000000000006', NULL, '72222222-2222-2222-2222-222222222222', 'Agile Sprint Planning', 'All project teams should complete their first sprint planning session by October 20th. Use the provided Jira template for your user stories and tasks.', 'high', true, '2025-10-15 13:00:00+02'),
('a0000006-0006-0006-0006-000000000006', NULL, '72222222-2222-2222-2222-222222222222', 'CI/CD Workshop', 'Join us for a hands-on workshop on setting up CI/CD pipelines with GitHub Actions. Friday, October 18th, 2-4 PM in SP Lab C3.165.', 'normal', true, '2025-10-13 09:00:00+02'),

-- Calculus Course Announcements
('a0000007-0007-0007-0007-000000000007', NULL, '75555555-5555-5555-5555-555555555555', 'Problem Set 3 Posted', 'Problem Set 3 covering derivatives and applications has been posted. This is not graded but excellent exam preparation.', 'normal', true, '2025-10-15 14:00:00+02'),
('a0000007-0007-0007-0007-000000000007', NULL, '75555555-5555-5555-5555-555555555555', 'Tutoring Sessions Available', 'Free math tutoring sessions are available every Tuesday and Thursday from 4-6 PM in the Math Help Center (UB 2.01).', 'normal', true, '2025-10-11 10:00:00+02'),

-- Linear Algebra Course Announcements
('a0000008-0008-0008-0008-000000000008', NULL, '75555555-5555-5555-5555-555555555555', 'Matrix Operations Quiz', 'There will be a short quiz on matrix operations at the beginning of next week''s lecture. This covers material from chapters 1-3.', 'high', true, '2025-10-16 11:00:00+02'),
('a0000008-0008-0008-0008-000000000008', NULL, '75555555-5555-5555-5555-555555555555', 'Eigenvalues Lecture Notes', 'Updated lecture notes on eigenvalues and eigenvectors with additional examples have been posted to the course materials.', 'normal', true, '2025-10-12 15:00:00+02'),

-- Business Courses Announcements
('a0000009-0009-0009-0009-000000000009', NULL, '76666666-6666-6666-6666-666666666666', 'Company Visit Opportunity', 'We have arranged a visit to Heineken headquarters on November 5th. Sign-up sheet is available in class. Space is limited!', 'high', true, '2025-10-15 12:00:00+02'),
('a0000009-0009-0009-0009-000000000009', NULL, '76666666-6666-6666-6666-666666666666', 'Guest Speaker Next Week', 'A successful entrepreneur will speak about starting a business in Amsterdam. Monday, October 21st, during regular class time.', 'normal', true, '2025-10-14 16:00:00+02'),

('a0000010-0010-0010-0010-000000000010', NULL, '76666666-6666-6666-6666-666666666666', 'Financial Statements Workshop', 'Struggling with reading financial statements? Join our workshop on Friday, October 18th at 1 PM. Bring your questions!', 'normal', true, '2025-10-13 10:00:00+02'),
('a0000010-0010-0010-0010-000000000010', NULL, '76666666-6666-6666-6666-666666666666', 'Midterm Review Session', 'I will conduct a midterm review session on October 28th from 6-8 PM. Location: ABS 0.01. Come with specific questions!', 'high', true, '2025-10-16 14:00:00+02'),

('a0000011-0011-0011-0011-000000000011', NULL, '76666666-6666-6666-6666-666666666666', 'Marketing Campaign Analysis Guidelines', 'Detailed guidelines for the Marketing Campaign Analysis assignment have been posted. Make sure to follow the analysis framework provided.', 'high', true, '2025-10-15 09:00:00+02'),
('a0000011-0011-0011-0011-000000000011', NULL, '76666666-6666-6666-6666-666666666666', 'Industry Panel Discussion', 'Marketing professionals from top Amsterdam agencies will discuss career paths in marketing. Thursday, October 24th at 3:30 PM.', 'normal', true, '2025-10-12 11:00:00+02'),

-- Economics Courses
('a0000013-0013-0013-0013-000000000013', NULL, '76666666-6666-6666-6666-666666666666', 'Microeconomics Problem Sets', 'Additional problem sets focusing on consumer and producer theory are now available. These will help you prepare for the midterm exam.', 'normal', true, '2025-10-14 13:00:00+02'),
('a0000013-0013-0013-0013-000000000013', NULL, '76666666-6666-6666-6666-666666666666', 'Study Group Formation', 'Consider forming study groups of 4-5 students. Research shows this significantly improves understanding of economic concepts.', 'normal', true, '2025-10-10 09:00:00+02'),

('a0000014-0014-0014-0014-000000000014', NULL, '76666666-6666-6666-6666-666666666666', 'Policy Analysis Assignment', 'New assignment posted: Analyze the economic impact of a recent policy change in the Netherlands. Due November 10th.', 'high', true, '2025-10-16 15:00:00+02'),

-- History Courses
('a0000016-0016-0016-0016-000000000016', NULL, '70000000-0000-0000-0000-000000000000', 'Primary Source Analysis Tips', 'Tips for analyzing medieval primary sources have been posted. This will be crucial for your upcoming essay assignments.', 'normal', true, '2025-10-13 11:00:00+02'),
('a0000016-0016-0016-0016-000000000016', NULL, '70000000-0000-0000-0000-000000000000', 'Museum Visit Optional', 'Optional visit to the Rijksmuseum medieval collection on October 26th. Meet at the museum entrance at 2 PM. Free entry with student ID.', 'normal', true, '2025-10-15 10:00:00+02'),

('a0000017-0017-0017-0017-000000000017', NULL, '70000000-0000-0000-0000-000000000000', 'Research Paper Topics', 'Please submit your research paper topic proposals by October 23rd. Make sure to choose a topic with sufficient primary sources available.', 'high', true, '2025-10-14 14:00:00+02'),

-- Law Courses
('a0000018-0018-0018-0018-000000000018', NULL, '70000000-0000-0000-0000-000000000000', 'Moot Court Competition', 'Sign up for the first-year moot court competition! Great opportunity to practice legal reasoning and argumentation.', 'normal', true, '2025-10-16 12:00:00+02'),

('a0000019-0019-0019-0019-000000000019', NULL, '70000000-0000-0000-0000-000000000000', 'Contract Law Case Updates', 'Two new important case precedents have been added to the reading list. Make sure to review these before next week''s discussion.', 'high', true, '2025-10-15 16:00:00+02'),

('a0000020-0020-0020-0020-000000000020', NULL, '70000000-0000-0000-0000-000000000000', 'Criminal Law Simulation', 'We will conduct a criminal trial simulation on November 8th. Roles will be assigned in next week''s class. Participation is mandatory.', 'urgent', true, '2025-10-14 09:00:00+02');
