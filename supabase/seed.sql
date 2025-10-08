-- =============================================
-- UvA DEMO DATA SEED FILE
-- University of Amsterdam - Coherent Demo Dataset
-- =============================================

-- Clear existing data (in reverse FK order to respect foreign keys)
TRUNCATE TABLE attendance CASCADE;
TRUNCATE TABLE event CASCADE;
TRUNCATE TABLE lesson CASCADE;
TRUNCATE TABLE submission CASCADE;
TRUNCATE TABLE assignment CASCADE;
TRUNCATE TABLE announcement CASCADE;
TRUNCATE TABLE course_materials CASCADE;
TRUNCATE TABLE material CASCADE;
TRUNCATE TABLE course_objectives CASCADE;
TRUNCATE TABLE objective_tag CASCADE;
TRUNCATE TABLE course_teaching_methods CASCADE;
TRUNCATE TABLE teaching_method_tag CASCADE;
TRUNCATE TABLE prerequisites CASCADE;
TRUNCATE TABLE course_group_members CASCADE;
TRUNCATE TABLE course_groups CASCADE;
TRUNCATE TABLE course_enrollments CASCADE;
TRUNCATE TABLE college_members CASCADE;
TRUNCATE TABLE user_sessions CASCADE;
TRUNCATE TABLE "user" CASCADE;
TRUNCATE TABLE room CASCADE;
TRUNCATE TABLE facility CASCADE;
TRUNCATE TABLE course_colleges CASCADE;
TRUNCATE TABLE college_faculties CASCADE;
TRUNCATE TABLE programme_courses CASCADE;
TRUNCATE TABLE course CASCADE;
TRUNCATE TABLE programme CASCADE;
TRUNCATE TABLE faculty CASCADE;
TRUNCATE TABLE college CASCADE;

-- =============================================
-- COLLEGES (UvA Faculties are called Colleges in our schema)
-- =============================================

INSERT INTO college (id, name, description, website, email, logo_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Faculty of Science', 'The Faculty of Science (FNWI) is devoted to excellent education and groundbreaking research in the sciences. Areas include mathematics, physics, astronomy, chemistry, computer science, and biology.', 'https://www.uva.nl/en/faculty/faculty-of-science', 'science@uva.nl', NULL),
('22222222-2222-2222-2222-222222222222', 'Faculty of Humanities', 'The Faculty of Humanities offers a wide range of bachelor''s and master''s programmes in fields such as languages, literature, history, philosophy, arts, and media studies.', 'https://www.uva.nl/en/faculty/faculty-of-humanities', 'humanities@uva.nl', NULL),
('33333333-3333-3333-3333-333333333333', 'Faculty of Economics and Business', 'Amsterdam Business School is one of the largest faculties at the University of Amsterdam, offering programmes in economics, business administration, and actuarial science.', 'https://www.uva.nl/en/faculty/faculty-of-economics-and-business', 'feb@uva.nl', NULL),
('44444444-4444-4444-4444-444444444444', 'Faculty of Law', 'The Faculty of Law offers bachelor''s, master''s, and PhD programmes, as well as postgraduate courses. Research focuses on international and European law, criminal law, and legal theory.', 'https://www.uva.nl/en/faculty/faculty-of-law', 'law@uva.nl', NULL);

-- =============================================
-- FACULTIES (Departments within Colleges)
-- =============================================

INSERT INTO faculty (id, name, description, college_id) VALUES
-- Science departments
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Institute for Informatics', 'Research and education in computer science, artificial intelligence, software engineering, and information systems.', '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Korteweg-de Vries Institute for Mathematics', 'Pure and applied mathematics, statistics, and mathematical research.', '11111111-1111-1111-1111-111111111111'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Van''t Hoff Institute for Molecular Sciences', 'Chemistry and molecular sciences research and teaching.', '11111111-1111-1111-1111-111111111111'),
-- Humanities departments
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Amsterdam School for Cultural Analysis', 'Cultural studies, media studies, and critical theory.', '22222222-2222-2222-2222-222222222222'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Department of History', 'European history, global history, and historical research methods.', '22222222-2222-2222-2222-222222222222'),
-- Economics & Business departments
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Amsterdam School of Economics', 'Economics, econometrics, and economic theory.', '33333333-3333-3333-3333-333333333333'),
('99999999-9999-9999-9999-999999999999', 'Amsterdam Business School', 'Business administration, management, entrepreneurship, and strategy.', '33333333-3333-3333-3333-333333333333'),
-- Law department
('88888888-8888-8888-8888-888888888888', 'Department of Private Law', 'Civil law, commercial law, and private international law.', '44444444-4444-4444-4444-444444444444');

-- =============================================
-- COLLEGE-FACULTY JUNCTION
-- =============================================

INSERT INTO college_faculties (college_id, faculty_id) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
('22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
('33333333-3333-3333-3333-333333333333', 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
('33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999'),
('44444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888');

-- =============================================
-- PROGRAMMES
-- =============================================

INSERT INTO programme (id, title, description) VALUES
('81111111-1111-1111-1111-111111111111', 'BSc Computer Science', 'The Bachelor''s programme in Computer Science provides a thorough academic foundation in algorithms, software engineering, artificial intelligence, and theoretical computer science.'),
('82222222-2222-2222-2222-222222222222', 'MSc Artificial Intelligence', 'The Master''s programme in Artificial Intelligence covers machine learning, natural language processing, computer vision, and intelligent systems.'),
('83333333-3333-3333-3333-333333333333', 'BSc Business Administration', 'The Bachelor''s programme in Business Administration prepares students for management and business careers with courses in strategy, finance, marketing, and organizational behavior.'),
('84444444-4444-4444-4444-444444444444', 'MSc Economics', 'The Master''s programme in Economics offers advanced training in economic theory, econometrics, and applied economics.'),
('85555555-5555-5555-5555-555555555555', 'BA History', 'The Bachelor''s programme in History covers European and global history from ancient times to the present, with emphasis on critical analysis and research methods.'),
('86666666-6666-6666-6666-666666666666', 'LLB Dutch Law', 'The Bachelor''s programme in Dutch Law provides comprehensive legal education covering civil law, criminal law, constitutional law, and European law.');

-- =============================================
-- COURSES (UvA-themed realistic courses)
-- =============================================

INSERT INTO course (id, code, title, description, ects, period, language, max_students, academic_year, status, objectives, teaching_methods, contact_hours) VALUES
-- Computer Science Courses
('a0000001-0001-0001-0001-000000000001', '5082PROG6Y', 'Programming', 'Introduction to programming using Python. Topics include variables, control structures, functions, data structures, and object-oriented programming.', 6, 1, 'English', 200, '2024-2025', 'published', 'Learn fundamental programming concepts, develop problem-solving skills, understand OOP principles', 'Lectures, lab sessions, assignments', 84),
('a0000002-0002-0002-0002-000000000002', '5314ALGO6Y', 'Algorithms and Data Structures', 'Study of fundamental algorithms and data structures including sorting, searching, trees, graphs, and complexity analysis.', 6, 2, 'English', 180, '2024-2025', 'published', 'Analyze algorithm complexity, implement efficient data structures, solve computational problems', 'Lectures, tutorials, programming assignments', 84),
('a0000003-0003-0003-0003-000000000003', '5092DATA6Y', 'Databases', 'Introduction to database systems covering relational model, SQL, database design, normalization, and transactions.', 6, 3, 'English', 150, '2024-2025', 'published', 'Design relational databases, write complex SQL queries, understand transaction management', 'Lectures, lab sessions, project work', 84),
('a0000004-0004-0004-0004-000000000004', '5062MACH6Y', 'Machine Learning', 'Introduction to machine learning algorithms including supervised learning, unsupervised learning, neural networks, and deep learning.', 6, 4, 'English', 120, '2024-2025', 'published', 'Understand ML algorithms, implement learning models, evaluate model performance', 'Lectures, practical sessions, project', 84),
('a0000005-0005-0005-0005-000000000005', '5314WEBB6Y', 'Web Development', 'Modern web development using HTML, CSS, JavaScript, React, and backend technologies. Includes responsive design and API integration.', 6, 1, 'English', 100, '2024-2025', 'published', 'Build full-stack web applications, understand modern web frameworks, implement RESTful APIs', 'Lectures, workshops, project work', 84),
('a0000006-0006-0006-0006-000000000006', '5082SOFT6Y', 'Software Engineering', 'Software development methodologies, version control, testing, CI/CD, agile practices, and team collaboration.', 6, 2, 'English', 130, '2024-2025', 'published', 'Apply software engineering practices, work in teams, understand software lifecycle', 'Lectures, group projects, guest speakers', 84),

-- Mathematics Courses
('a0000007-0007-0007-0007-000000000007', '5062CALC6Y', 'Calculus I', 'Differential and integral calculus, limits, derivatives, applications, and fundamental theorem of calculus.', 6, 1, 'English', 250, '2024-2025', 'published', 'Master calculus fundamentals, solve differential problems, apply to real-world scenarios', 'Lectures, tutorials, problem sets', 84),
('a0000008-0008-0008-0008-000000000008', '5314LINA6Y', 'Linear Algebra', 'Vector spaces, matrices, linear transformations, eigenvalues, and applications.', 6, 2, 'English', 220, '2024-2025', 'published', 'Understand vector spaces, perform matrix operations, solve linear systems', 'Lectures, exercise sessions', 84),

-- Business Courses
('a0000009-0009-0009-0009-000000000009', '6011P0002Y', 'Introduction to Business', 'Overview of business functions including management, marketing, finance, and operations.', 6, 1, 'English', 300, '2024-2025', 'published', 'Understand business fundamentals, analyze business environments, develop strategic thinking', 'Lectures, case studies, group work', 84),
('a0000010-0010-0010-0010-000000000010', '6013P0004Y', 'Financial Accounting', 'Principles of financial accounting, financial statements, bookkeeping, and financial reporting standards.', 6, 2, 'English', 250, '2024-2025', 'published', 'Prepare financial statements, analyze financial data, understand accounting principles', 'Lectures, practical exercises', 84),
('a0000011-0011-0011-0011-000000000011', '6312P0021Y', 'Marketing Management', 'Marketing strategy, consumer behavior, branding, market research, and digital marketing.', 6, 3, 'English', 200, '2024-2025', 'published', 'Develop marketing strategies, understand consumer psychology, create marketing campaigns', 'Lectures, case studies, marketing project', 84),
('a0000012-0012-0012-0012-000000000012', '6013P0012Y', 'Corporate Finance', 'Investment decisions, capital budgeting, risk management, and corporate valuation.', 6, 4, 'English', 180, '2024-2025', 'published', 'Evaluate investment opportunities, understand financial markets, perform valuation analysis', 'Lectures, financial modeling workshops', 84),

-- Economics Courses
('a0000013-0013-0013-0013-000000000013', '6011P0001Y', 'Microeconomics', 'Consumer theory, producer theory, market structures, and welfare economics.', 6, 1, 'English', 280, '2024-2025', 'published', 'Analyze market behavior, understand economic decision-making, apply microeconomic models', 'Lectures, tutorials, problem sets', 84),
('a0000014-0014-0014-0014-000000000014', '6011P0003Y', 'Macroeconomics', 'National income, unemployment, inflation, monetary policy, and fiscal policy.', 6, 2, 'English', 280, '2024-2025', 'published', 'Understand macroeconomic indicators, analyze economic policies, model economic systems', 'Lectures, tutorials, case studies', 84),
('a0000015-0015-0015-0015-000000000015', '6312P0034Y', 'Econometrics', 'Statistical methods for economic analysis, regression analysis, hypothesis testing, and forecasting.', 6, 3, 'English', 150, '2024-2025', 'published', 'Apply statistical methods, interpret econometric results, conduct empirical research', 'Lectures, computer labs, research project', 84),

-- History Courses
('a0000016-0016-0016-0016-000000000016', '5102HIST6Y', 'Medieval European History', 'Political, social, and cultural developments in medieval Europe from 500-1500 CE.', 6, 1, 'English', 80, '2024-2025', 'published', 'Analyze medieval sources, understand historical context, develop critical thinking', 'Lectures, seminars, primary source analysis', 56),
('a0000017-0017-0017-0017-000000000017', '5314GLOB6Y', 'Global History 1500-1800', 'Exploration, colonialism, trade networks, and cultural exchange in the early modern period.', 6, 2, 'English', 75, '2024-2025', 'published', 'Understand global connections, analyze historical change, evaluate primary sources', 'Lectures, seminars, essay writing', 56),

-- Law Courses
('a0000018-0018-0018-0018-000000000018', '6011R0001N', 'Introduction to Law', 'Legal systems, sources of law, legal reasoning, and fundamental legal concepts.', 6, 1, 'Dutch', 350, '2024-2025', 'published', 'Understand legal systems, apply legal reasoning, analyze case law', 'Lectures, tutorials, moot court', 84),
('a0000019-0019-0019-0019-000000000019', '6212R0015N', 'Contract Law', 'Formation of contracts, contract terms, breach, and remedies under Dutch civil law.', 6, 2, 'Dutch', 300, '2024-2025', 'published', 'Analyze contract cases, draft contract clauses, understand contractual obligations', 'Lectures, case analysis, legal writing', 84),
('a0000020-0020-0020-0020-000000000020', '6312R0023N', 'Criminal Law', 'Principles of criminal law, elements of crimes, defenses, and criminal procedure.', 6, 3, 'Dutch', 280, '2024-2025', 'published', 'Apply criminal law principles, analyze criminal cases, understand criminal justice system', 'Lectures, case discussions, simulations', 84);

-- =============================================
-- PROGRAMME-COURSE JUNCTION
-- =============================================

INSERT INTO programme_courses (programme_id, course_id, required, semester) VALUES
-- BSc Computer Science
('81111111-1111-1111-1111-111111111111', 'a0000001-0001-0001-0001-000000000001', true, 1),
('81111111-1111-1111-1111-111111111111', 'a0000002-0002-0002-0002-000000000002', true, 2),
('81111111-1111-1111-1111-111111111111', 'a0000003-0003-0003-0003-000000000003', true, 3),
('81111111-1111-1111-1111-111111111111', 'a0000006-0006-0006-0006-000000000006', true, 2),
('81111111-1111-1111-1111-111111111111', 'a0000005-0005-0005-0005-000000000005', false, 1),
('81111111-1111-1111-1111-111111111111', 'a0000007-0007-0007-0007-000000000007', true, 1),
('81111111-1111-1111-1111-111111111111', 'a0000008-0008-0008-0008-000000000008', true, 2),

-- MSc Artificial Intelligence
('82222222-2222-2222-2222-222222222222', 'a0000004-0004-0004-0004-000000000004', true, 1),
('82222222-2222-2222-2222-222222222222', 'a0000002-0002-0002-0002-000000000002', true, 1),
('82222222-2222-2222-2222-222222222222', 'a0000008-0008-0008-0008-000000000008', true, 1),

-- BSc Business Administration
('83333333-3333-3333-3333-333333333333', 'a0000009-0009-0009-0009-000000000009', true, 1),
('83333333-3333-3333-3333-333333333333', 'a0000010-0010-0010-0010-000000000010', true, 2),
('83333333-3333-3333-3333-333333333333', 'a0000011-0011-0011-0011-000000000011', true, 3),
('83333333-3333-3333-3333-333333333333', 'a0000012-0012-0012-0012-000000000012', false, 4),
('83333333-3333-3333-3333-333333333333', 'a0000013-0013-0013-0013-000000000013', true, 1),

-- MSc Economics
('84444444-4444-4444-4444-444444444444', 'a0000013-0013-0013-0013-000000000013', true, 1),
('84444444-4444-4444-4444-444444444444', 'a0000014-0014-0014-0014-000000000014', true, 1),
('84444444-4444-4444-4444-444444444444', 'a0000015-0015-0015-0015-000000000015', true, 2),

-- BA History
('85555555-5555-5555-5555-555555555555', 'a0000016-0016-0016-0016-000000000016', true, 1),
('85555555-5555-5555-5555-555555555555', 'a0000017-0017-0017-0017-000000000017', true, 2),

-- LLB Dutch Law
('86666666-6666-6666-6666-666666666666', 'a0000018-0018-0018-0018-000000000018', true, 1),
('86666666-6666-6666-6666-666666666666', 'a0000019-0019-0019-0019-000000000019', true, 2),
('86666666-6666-6666-6666-666666666666', 'a0000020-0020-0020-0020-000000000020', true, 3);

-- =============================================
-- COURSE-COLLEGE JUNCTION
-- =============================================

INSERT INTO course_colleges (course_id, college_id) VALUES
-- Science courses
('a0000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111'),
('a0000002-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111'),
('a0000003-0003-0003-0003-000000000003', '11111111-1111-1111-1111-111111111111'),
('a0000004-0004-0004-0004-000000000004', '11111111-1111-1111-1111-111111111111'),
('a0000005-0005-0005-0005-000000000005', '11111111-1111-1111-1111-111111111111'),
('a0000006-0006-0006-0006-000000000006', '11111111-1111-1111-1111-111111111111'),
('a0000007-0007-0007-0007-000000000007', '11111111-1111-1111-1111-111111111111'),
('a0000008-0008-0008-0008-000000000008', '11111111-1111-1111-1111-111111111111'),

-- Business & Economics courses
('a0000009-0009-0009-0009-000000000009', '33333333-3333-3333-3333-333333333333'),
('a0000010-0010-0010-0010-000000000010', '33333333-3333-3333-3333-333333333333'),
('a0000011-0011-0011-0011-000000000011', '33333333-3333-3333-3333-333333333333'),
('a0000012-0012-0012-0012-000000000012', '33333333-3333-3333-3333-333333333333'),
('a0000013-0013-0013-0013-000000000013', '33333333-3333-3333-3333-333333333333'),
('a0000014-0014-0014-0014-000000000014', '33333333-3333-3333-3333-333333333333'),
('a0000015-0015-0015-0015-000000000015', '33333333-3333-3333-3333-333333333333'),

-- History courses
('a0000016-0016-0016-0016-000000000016', '22222222-2222-2222-2222-222222222222'),
('a0000017-0017-0017-0017-000000000017', '22222222-2222-2222-2222-222222222222'),

-- Law courses
('a0000018-0018-0018-0018-000000000018', '44444444-4444-4444-4444-444444444444'),
('a0000019-0019-0019-0019-000000000019', '44444444-4444-4444-4444-444444444444'),
('a0000020-0020-0020-0020-000000000020', '44444444-4444-4444-4444-444444444444');

-- =============================================
-- FACILITIES (UvA Buildings)
-- =============================================

INSERT INTO facility (id, name, address, latitude, longitude, opening_hours) VALUES
('61111111-1111-1111-1111-111111111111', 'Science Park', 'Science Park 904, 1098 XH Amsterdam', 52.3547, 4.9542, 'Mon-Fri: 08:00-22:00, Sat-Sun: 09:00-18:00'),
('62222222-2222-2222-2222-222222222222', 'Roeterseiland Campus', 'Roetersstraat 11, 1018 WB Amsterdam', 52.3640, 4.9115, 'Mon-Fri: 08:00-22:00, Sat: 09:00-17:00'),
('63333333-3333-3333-3333-333333333333', 'University Library', 'Singel 425, 1012 WP Amsterdam', 52.3702, 4.8897, 'Mon-Fri: 08:00-24:00, Sat-Sun: 10:00-20:00'),
('64444444-4444-4444-4444-444444444444', 'Oudemanhuispoort', 'Oudemanhuispoort 4-6, 1012 CN Amsterdam', 52.3697, 4.8960, 'Mon-Fri: 08:00-18:00'),
('65555555-5555-5555-5555-555555555555', 'Amsterdam Business School', 'Plantage Muidergracht 12, 1018 TV Amsterdam', 52.3665, 4.9102, 'Mon-Fri: 08:00-22:00');

-- =============================================
-- ROOMS
-- =============================================

INSERT INTO room (id, name, facility_id, capacity, type, floor, equipment, bookable) VALUES
-- Science Park rooms
('20000001-0001-0001-0001-000000000001', 'SP A1.04', '61111111-1111-1111-1111-111111111111', 200, 'lecture_hall', 1, 'Projector, microphone, recording equipment', true),
('20000002-0002-0002-0002-000000000002', 'SP A1.10', '61111111-1111-1111-1111-111111111111', 80, 'classroom', 1, 'Whiteboard, projector', true),
('20000003-0003-0003-0003-000000000003', 'SP Lab C3.165', '61111111-1111-1111-1111-111111111111', 40, 'lab', 3, 'Computers, development tools', true),
('20000004-0004-0004-0004-000000000004', 'SP G0.05', '61111111-1111-1111-1111-111111111111', 30, 'classroom', 0, 'Projector, whiteboard', true),
('20000005-0005-0005-0005-000000000005', 'SP Study Area B', '61111111-1111-1111-1111-111111111111', 50, 'study_space', 2, 'Tables, power outlets, WiFi', true),

-- Roeterseiland rooms
('20000006-0006-0006-0006-000000000006', 'REC A2.01', '62222222-2222-2222-2222-222222222222', 150, 'lecture_hall', 2, 'Projector, audio system', true),
('20000007-0007-0007-0007-000000000007', 'REC B1.03', '62222222-2222-2222-2222-222222222222', 60, 'classroom', 1, 'Smart board, projector', true),
('20000008-0008-0008-0008-000000000008', 'REC C3.06', '62222222-2222-2222-2222-222222222222', 40, 'classroom', 3, 'Round table, projector', true),
('20000009-0009-0009-0009-000000000009', 'REC E0.15', '62222222-2222-2222-2222-222222222222', 200, 'exam_hall', 0, 'Individual desks', false),

-- Library rooms
('20000010-0010-0010-0010-000000000010', 'UB 2.01', '63333333-3333-3333-3333-333333333333', 20, 'study_space', 2, 'Group study tables, whiteboard', true),
('20000011-0011-0011-0011-000000000011', 'UB 3.12', '63333333-3333-3333-3333-333333333333', 8, 'study_space', 3, 'Silent study room', true),

-- Oudemanhuispoort rooms
('20000012-0012-0012-0012-000000000012', 'OMP 1.02', '64444444-4444-4444-4444-444444444444', 100, 'lecture_hall', 1, 'Projector, audio', true),
('20000013-0013-0013-0013-000000000013', 'OMP 2.04', '64444444-4444-4444-4444-444444444444', 40, 'classroom', 2, 'Projector, whiteboard', true),

-- Business School rooms
('20000014-0014-0014-0014-000000000014', 'ABS 0.01', '65555555-5555-5555-5555-555555555555', 180, 'lecture_hall', 0, 'Projector, microphone, recording', true),
('20000015-0015-0015-0015-000000000015', 'ABS 1.05', '65555555-5555-5555-5555-555555555555', 50, 'classroom', 1, 'Projector, smart board', true);

-- =============================================
-- USERS (Students, Lecturers, Admins)
-- =============================================

INSERT INTO "user" (id, email, first_name, last_name, student_number, date_of_birth, phone, status) VALUES
-- Admin
('70000000-0000-0000-0000-000000000000', 'admin@uva.nl', 'System', 'Administrator', NULL, '1980-01-01', '+31201234567', 'active'),

-- Lecturers
('71111111-1111-1111-1111-111111111111', 'j.vermeulen@uva.nl', 'Jan', 'Vermeulen', NULL, '1975-03-15', '+31206541234', 'active'),
('72222222-2222-2222-2222-222222222222', 's.bakker@uva.nl', 'Sophie', 'Bakker', NULL, '1982-07-22', '+31206541235', 'active'),
('73333333-3333-3333-3333-333333333333', 'm.jansen@uva.nl', 'Michael', 'Jansen', NULL, '1978-11-08', '+31206541236', 'active'),
('74444444-4444-4444-4444-444444444444', 'e.deVries@uva.nl', 'Emma', 'de Vries', NULL, '1985-05-30', '+31206541237', 'active'),
('75555555-5555-5555-5555-555555555555', 'l.mulder@uva.nl', 'Lucas', 'Mulder', NULL, '1979-09-12', '+31206541238', 'active'),
('76666666-6666-6666-6666-666666666666', 'a.visser@uva.nl', 'Anna', 'Visser', NULL, '1983-02-18', '+31206541239', 'active'),

-- Students
('77777777-7777-7777-7777-777777777777', 'daan.peters@student.uva.nl', 'Daan', 'Peters', '13245678', '2003-04-12', '+31612345678', 'active'),
('78888888-8888-8888-8888-888888888888', 'lisa.jong@student.uva.nl', 'Lisa', 'de Jong', '13245679', '2003-08-25', '+31612345679', 'active'),
('79999999-9999-9999-9999-999999999999', 'tom.hendriks@student.uva.nl', 'Tom', 'Hendriks', '13245680', '2002-12-03', '+31612345680', 'active'),
('7a111111-1111-1111-1111-111111111111', 'nina.brouwer@student.uva.nl', 'Nina', 'Brouwer', '13245681', '2003-06-17', '+31612345681', 'active'),
('7b222222-2222-2222-2222-222222222222', 'lars.smit@student.uva.nl', 'Lars', 'Smit', '13245682', '2004-01-09', '+31612345682', 'active'),
('7c333333-3333-3333-3333-333333333333', 'sara.dekker@student.uva.nl', 'Sara', 'Dekker', '13245683', '2003-11-22', '+31612345683', 'active'),
('7d444444-4444-4444-4444-444444444444', 'finn.vandenberg@student.uva.nl', 'Finn', 'van den Berg', '13245684', '2002-07-14', '+31612345684', 'active'),
('7e555555-5555-5555-5555-555555555555', 'julia.meijer@student.uva.nl', 'Julia', 'Meijer', '13245685', '2003-03-28', '+31612345685', 'active'),
('7f666666-6666-6666-6666-666666666666', 'max.vandijk@student.uva.nl', 'Max', 'van Dijk', '13245686', '2004-05-19', '+31612345686', 'active'),
('70777777-7777-7777-7777-777777777777', 'eva.jacobs@student.uva.nl', 'Eva', 'Jacobs', '13245687', '2003-09-07', '+31612345687', 'active');

-- =============================================
-- USER AUTH - SKIPPED (Use Supabase Auth instead)
-- =============================================

-- =============================================
-- COURSE ENROLLMENTS
-- =============================================

-- Lecturers as coordinators/lecturers
INSERT INTO course_enrollments (course_id, user_id, role, status) VALUES
-- Programming - Jan Vermeulen
('a0000001-0001-0001-0001-000000000001', '71111111-1111-1111-1111-111111111111', 'coordinator', 'active'),
-- Algorithms - Sophie Bakker
('a0000002-0002-0002-0002-000000000002', '72222222-2222-2222-2222-222222222222', 'coordinator', 'active'),
-- Databases - Michael Jansen
('a0000003-0003-0003-0003-000000000003', '73333333-3333-3333-3333-333333333333', 'coordinator', 'active'),
-- Machine Learning - Emma de Vries
('a0000004-0004-0004-0004-000000000004', '74444444-4444-4444-4444-444444444444', 'coordinator', 'active'),
-- Web Development - Jan Vermeulen (also teaches this)
('a0000005-0005-0005-0005-000000000005', '71111111-1111-1111-1111-111111111111', 'lecturer', 'active'),
-- Software Engineering - Sophie Bakker
('a0000006-0006-0006-0006-000000000006', '72222222-2222-2222-2222-222222222222', 'lecturer', 'active'),
-- Calculus - Lucas Mulder
('a0000007-0007-0007-0007-000000000007', '75555555-5555-5555-5555-555555555555', 'coordinator', 'active'),
-- Linear Algebra - Lucas Mulder
('a0000008-0008-0008-0008-000000000008', '75555555-5555-5555-5555-555555555555', 'coordinator', 'active'),
-- Business courses - Anna Visser
('a0000009-0009-0009-0009-000000000009', '76666666-6666-6666-6666-666666666666', 'coordinator', 'active'),
('a0000010-0010-0010-0010-000000000010', '76666666-6666-6666-6666-666666666666', 'lecturer', 'active'),
('a0000011-0011-0011-0011-000000000011', '76666666-6666-6666-6666-666666666666', 'lecturer', 'active'),

-- Students enrolled in courses
-- Daan Peters (CS student) - enrolled in Programming, Algorithms, Web Dev, Calculus
('a0000001-0001-0001-0001-000000000001', '77777777-7777-7777-7777-777777777777', 'student', 'active'),
('a0000002-0002-0002-0002-000000000002', '77777777-7777-7777-7777-777777777777', 'student', 'active'),
('a0000005-0005-0005-0005-000000000005', '77777777-7777-7777-7777-777777777777', 'student', 'active'),
('a0000007-0007-0007-0007-000000000007', '77777777-7777-7777-7777-777777777777', 'student', 'active'),

-- Lisa de Jong (CS student) - enrolled in Programming, Databases, Software Eng, Linear Algebra
('a0000001-0001-0001-0001-000000000001', '78888888-8888-8888-8888-888888888888', 'student', 'active'),
('a0000003-0003-0003-0003-000000000003', '78888888-8888-8888-8888-888888888888', 'student', 'active'),
('a0000006-0006-0006-0006-000000000006', '78888888-8888-8888-8888-888888888888', 'student', 'active'),
('a0000008-0008-0008-0008-000000000008', '78888888-8888-8888-8888-888888888888', 'student', 'active'),

-- Tom Hendriks (AI student) - enrolled in Machine Learning, Algorithms, Linear Algebra
('a0000004-0004-0004-0004-000000000004', '79999999-9999-9999-9999-999999999999', 'student', 'active'),
('a0000002-0002-0002-0002-000000000002', '79999999-9999-9999-9999-999999999999', 'student', 'active'),
('a0000008-0008-0008-0008-000000000008', '79999999-9999-9999-9999-999999999999', 'student', 'active'),

-- Nina Brouwer (Business student) - enrolled in Intro Business, Accounting, Marketing
('a0000009-0009-0009-0009-000000000009', '7a111111-1111-1111-1111-111111111111', 'student', 'active'),
('a0000010-0010-0010-0010-000000000010', '7a111111-1111-1111-1111-111111111111', 'student', 'active'),
('a0000011-0011-0011-0011-000000000011', '7a111111-1111-1111-1111-111111111111', 'student', 'active'),

-- Lars Smit (Business student) - enrolled in Intro Business, Accounting, Microeconomics
('a0000009-0009-0009-0009-000000000009', '7b222222-2222-2222-2222-222222222222', 'student', 'active'),
('a0000010-0010-0010-0010-000000000010', '7b222222-2222-2222-2222-222222222222', 'student', 'active'),
('a0000013-0013-0013-0013-000000000013', '7b222222-2222-2222-2222-222222222222', 'student', 'active'),

-- Sara Dekker (CS student) - enrolled in Programming, Web Dev, Calculus
('a0000001-0001-0001-0001-000000000001', '7c333333-3333-3333-3333-333333333333', 'student', 'active'),
('a0000005-0005-0005-0005-000000000005', '7c333333-3333-3333-3333-333333333333', 'student', 'active'),
('a0000007-0007-0007-0007-000000000007', '7c333333-3333-3333-3333-333333333333', 'student', 'active'),

-- Finn van den Berg (CS student) - enrolled in Algorithms, Databases, Software Eng
('a0000002-0002-0002-0002-000000000002', '7d444444-4444-4444-4444-444444444444', 'student', 'active'),
('a0000003-0003-0003-0003-000000000003', '7d444444-4444-4444-4444-444444444444', 'student', 'active'),
('a0000006-0006-0006-0006-000000000006', '7d444444-4444-4444-4444-444444444444', 'student', 'active'),

-- Julia Meijer (Business student) - enrolled in Intro Business, Marketing
('a0000009-0009-0009-0009-000000000009', '7e555555-5555-5555-5555-555555555555', 'student', 'active'),
('a0000011-0011-0011-0011-000000000011', '7e555555-5555-5555-5555-555555555555', 'student', 'active'),

-- Max van Dijk (AI student) - enrolled in Machine Learning, Programming
('a0000004-0004-0004-0004-000000000004', '7f666666-6666-6666-6666-666666666666', 'student', 'active'),
('a0000001-0001-0001-0001-000000000001', '7f666666-6666-6666-6666-666666666666', 'student', 'active'),

-- Eva Jacobs (Business student) - enrolled in Intro Business, Accounting
('a0000009-0009-0009-0009-000000000009', '70777777-7777-7777-7777-777777777777', 'student', 'active'),
('a0000010-0010-0010-0010-000000000010', '70777777-7777-7777-7777-777777777777', 'student', 'active');

-- =============================================
-- COURSE GROUPS
-- =============================================

INSERT INTO course_groups (id, course_id, name, type, max_students) VALUES
-- Programming groups
('90000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000001', 'Lecture Group A', 'lecture', 200),
('90000002-0002-0002-0002-000000000002', 'a0000001-0001-0001-0001-000000000001', 'Lab Group 1', 'lab', 30),
('90000003-0003-0003-0003-000000000003', 'a0000001-0001-0001-0001-000000000001', 'Lab Group 2', 'lab', 30),

-- Algorithms groups
('90000004-0004-0004-0004-000000000004', 'a0000002-0002-0002-0002-000000000002', 'Lecture Group A', 'lecture', 180),
('90000005-0005-0005-0005-000000000005', 'a0000002-0002-0002-0002-000000000002', 'Tutorial Group 1', 'tutorial', 40),

-- Machine Learning groups
('90000006-0006-0006-0006-000000000006', 'a0000004-0004-0004-0004-000000000004', 'Lecture Group A', 'lecture', 120),
('90000007-0007-0007-0007-000000000007', 'a0000004-0004-0004-0004-000000000004', 'Lab Group 1', 'lab', 30);

-- =============================================
-- LESSONS
-- =============================================

INSERT INTO lesson (id, course_id, course_group_id, title, type, room_id) VALUES
-- Programming lessons
('10000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000001', '90000001-0001-0001-0001-000000000001', 'Programming Lecture', 'lecture', '20000001-0001-0001-0001-000000000001'),
('10000002-0002-0002-0002-000000000002', 'a0000001-0001-0001-0001-000000000001', '90000002-0002-0002-0002-000000000002', 'Programming Lab', 'lab', '20000003-0003-0003-0003-000000000003'),

-- Algorithms lessons
('10000003-0003-0003-0003-000000000003', 'a0000002-0002-0002-0002-000000000002', '90000004-0004-0004-0004-000000000004', 'Algorithms Lecture', 'lecture', '20000001-0001-0001-0001-000000000001'),
('10000004-0004-0004-0004-000000000004', 'a0000002-0002-0002-0002-000000000002', '90000005-0005-0005-0005-000000000005', 'Algorithms Tutorial', 'tutorial', '20000002-0002-0002-0002-000000000002'),

-- Databases lessons
('10000005-0005-0005-0005-000000000005', 'a0000003-0003-0003-0003-000000000003', NULL, 'Databases Lecture', 'lecture', '20000002-0002-0002-0002-000000000002'),
('10000006-0006-0006-0006-000000000006', 'a0000003-0003-0003-0003-000000000003', NULL, 'Databases Lab', 'lab', '20000003-0003-0003-0003-000000000003'),

-- Machine Learning lessons
('10000007-0007-0007-0007-000000000007', 'a0000004-0004-0004-0004-000000000004', '90000006-0006-0006-0006-000000000006', 'Machine Learning Lecture', 'lecture', '20000001-0001-0001-0001-000000000001'),
('10000008-0008-0008-0008-000000000008', 'a0000004-0004-0004-0004-000000000004', '90000007-0007-0007-0007-000000000007', 'Machine Learning Lab', 'lab', '20000003-0003-0003-0003-000000000003'),

-- Web Development lessons
('10000009-0009-0009-0009-000000000009', 'a0000005-0005-0005-0005-000000000005', NULL, 'Web Development Lecture', 'lecture', '20000002-0002-0002-0002-000000000002'),
('10000010-0010-0010-0010-000000000010', 'a0000005-0005-0005-0005-000000000005', NULL, 'Web Development Workshop', 'workshop', '20000003-0003-0003-0003-000000000003'),

-- Software Engineering lessons
('10000011-0011-0011-0011-000000000011', 'a0000006-0006-0006-0006-000000000006', NULL, 'Software Engineering Lecture', 'lecture', '20000002-0002-0002-0002-000000000002'),

-- Business courses
('10000012-0012-0012-0012-000000000012', 'a0000009-0009-0009-0009-000000000009', NULL, 'Introduction to Business Lecture', 'lecture', '20000014-0014-0014-0014-000000000014'),
('10000013-0013-0013-0013-000000000013', 'a0000010-0010-0010-0010-000000000010', NULL, 'Financial Accounting Lecture', 'lecture', '20000015-0015-0015-0015-000000000015'),
('10000014-0014-0014-0014-000000000014', 'a0000011-0011-0011-0011-000000000011', NULL, 'Marketing Management Lecture', 'lecture', '20000014-0014-0014-0014-000000000014');

-- =============================================
-- EVENTS (October 2025 Schedule - Current Period)
-- =============================================

INSERT INTO event (lesson_id, title, description, start_time, end_time, is_recurring, recurrence_rule, recurrence_end_date, status) VALUES
-- Week of October 6-10, 2025 (Current week)
-- Monday Oct 6
('10000001-0001-0001-0001-000000000001', 'Programming Lecture - Week 1', 'Introduction to Python and basic syntax', '2025-10-06 09:00:00+02', '2025-10-06 11:00:00+02', true, 'WEEKLY', '2025-12-19', 'scheduled'),
('10000012-0012-0012-0012-000000000012', 'Introduction to Business - Week 1', 'Overview of business functions', '2025-10-06 13:00:00+02', '2025-10-06 15:00:00+02', true, 'WEEKLY', '2025-12-19', 'scheduled'),

-- Tuesday Oct 7
('10000003-0003-0003-0003-000000000003', 'Algorithms Lecture - Week 1', 'Introduction to algorithms and complexity', '2025-10-07 10:00:00+02', '2025-10-07 12:00:00+02', true, 'WEEKLY', '2025-12-19', 'scheduled'),
('10000013-0013-0013-0013-000000000013', 'Financial Accounting - Week 1', 'Basics of accounting and financial statements', '2025-10-07 14:00:00+02', '2025-10-07 16:00:00+02', true, 'WEEKLY', '2025-12-19', 'scheduled'),

-- Wednesday Oct 8 (TODAY)
('10000002-0002-0002-0002-000000000002', 'Programming Lab - Week 1', 'Hands-on Python programming exercises', '2025-10-08 09:00:00+02', '2025-10-08 11:00:00+02', true, 'WEEKLY', '2025-12-19', 'scheduled'),
('10000005-0005-0005-0005-000000000005', 'Databases Lecture - Week 1', 'Introduction to relational databases', '2025-10-08 13:00:00+02', '2025-10-08 15:00:00+02', true, 'WEEKLY', '2025-12-19', 'scheduled'),
('10000009-0009-0009-0009-000000000009', 'Web Development Lecture - Week 1', 'HTML, CSS, and modern web technologies', '2025-10-08 15:30:00+02', '2025-10-08 17:30:00+02', true, 'WEEKLY', '2025-12-19', 'scheduled'),

-- Thursday Oct 9
('10000004-0004-0004-0004-000000000004', 'Algorithms Tutorial - Week 1', 'Problem solving session', '2025-10-09 09:00:00+02', '2025-10-09 11:00:00+02', true, 'WEEKLY', '2025-12-19', 'scheduled'),
('10000007-0007-0007-0007-000000000007', 'Machine Learning Lecture - Week 1', 'Introduction to ML and supervised learning', '2025-10-09 13:00:00+02', '2025-10-09 15:00:00+02', true, 'WEEKLY', '2025-12-19', 'scheduled'),
('10000014-0014-0014-0014-000000000014', 'Marketing Management - Week 1', 'Introduction to marketing concepts', '2025-10-09 15:30:00+02', '2025-10-09 17:30:00+02', true, 'WEEKLY', '2025-12-19', 'scheduled'),

-- Friday Oct 10
('10000006-0006-0006-0006-000000000006', 'Databases Lab - Week 1', 'SQL basics and practice', '2025-10-10 10:00:00+02', '2025-10-10 12:00:00+02', true, 'WEEKLY', '2025-12-19', 'scheduled'),
('10000008-0008-0008-0008-000000000008', 'Machine Learning Lab - Week 1', 'Implementing basic ML algorithms', '2025-10-10 13:00:00+02', '2025-10-10 15:00:00+02', true, 'WEEKLY', '2025-12-19', 'scheduled'),
('10000011-0011-0011-0011-000000000011', 'Software Engineering - Week 1', 'Software development lifecycle', '2025-10-10 15:30:00+02', '2025-10-10 17:30:00+02', true, 'WEEKLY', '2025-12-19', 'scheduled'),

-- Week of October 13-17, 2025 (Next week - automatically generated by recurrence)
-- Week of October 20-24, 2025 (automatically generated by recurrence)
-- And so on until December 19, 2025

-- One-time special events
('10000001-0001-0001-0001-000000000001', 'Programming Midterm Exam', 'Mid-semester programming assessment', '2025-11-12 09:00:00+01', '2025-11-12 12:00:00+01', false, NULL, NULL, 'scheduled'),
('10000007-0007-0007-0007-000000000007', 'Machine Learning Guest Lecture', 'Industry expert on AI in production', '2025-11-18 14:00:00+01', '2025-11-18 16:00:00+01', false, NULL, NULL, 'scheduled'),
('10000012-0012-0012-0012-000000000012', 'Business Case Competition', 'Team-based business strategy challenge', '2025-11-25 13:00:00+01', '2025-11-25 17:00:00+01', false, NULL, NULL, 'scheduled');

-- =============================================
-- MATERIALS
-- =============================================

INSERT INTO material (id, title, type, description, url, availability, authors, publication_year, required) VALUES
('30000001-0001-0001-0001-000000000001', 'Python Crash Course', 'book', 'A hands-on, project-based introduction to programming', 'https://nostarch.com/pythoncrashcourse2e', 'library', 'Eric Matthes', 2019, true),
('30000002-0002-0002-0002-000000000002', 'Introduction to Algorithms', 'book', 'Comprehensive textbook on algorithms and data structures', NULL, 'library', 'Cormen, Leiserson, Rivest, Stein', 2009, true),
('30000003-0003-0003-0003-000000000003', 'Database System Concepts', 'book', 'Fundamental concepts of database management systems', NULL, 'library', 'Silberschatz, Korth, Sudarshan', 2020, true),
('30000004-0004-0004-0004-000000000004', 'Pattern Recognition and Machine Learning', 'book', 'Comprehensive ML textbook', NULL, 'library', 'Christopher Bishop', 2006, true),
('30000005-0005-0005-0005-000000000005', 'JavaScript: The Good Parts', 'book', 'Essential JavaScript programming guide', 'https://www.oreilly.com/', 'library', 'Douglas Crockford', 2008, false),
('30000006-0006-0006-0006-000000000006', 'Clean Code', 'book', 'A handbook of agile software craftsmanship', NULL, 'library', 'Robert C. Martin', 2008, true),
('30000007-0007-0007-0007-000000000007', 'MIT OpenCourseWare - Calculus', 'video', 'Free online calculus lectures from MIT', 'https://ocw.mit.edu/courses/mathematics/', 'open_access', 'MIT Mathematics Department', 2020, false),
('30000008-0008-0008-0008-000000000008', 'Linear Algebra Done Right', 'book', 'Modern approach to linear algebra', NULL, 'library', 'Sheldon Axler', 2015, true),
('30000009-0009-0009-0009-000000000009', 'Principles of Marketing', 'book', 'Comprehensive marketing textbook', NULL, 'library', 'Philip Kotler, Gary Armstrong', 2020, true),
('30000010-0010-0010-0010-000000000010', 'Financial Accounting Theory', 'book', 'Advanced accounting concepts', NULL, 'library', 'William Scott', 2015, true);

-- =============================================
-- COURSE MATERIALS JUNCTION
-- =============================================

INSERT INTO course_materials (course_id, material_id, required, "order") VALUES
('a0000001-0001-0001-0001-000000000001', '30000001-0001-0001-0001-000000000001', true, 1),
('a0000002-0002-0002-0002-000000000002', '30000002-0002-0002-0002-000000000002', true, 1),
('a0000003-0003-0003-0003-000000000003', '30000003-0003-0003-0003-000000000003', true, 1),
('a0000004-0004-0004-0004-000000000004', '30000004-0004-0004-0004-000000000004', true, 1),
('a0000005-0005-0005-0005-000000000005', '30000005-0005-0005-0005-000000000005', false, 1),
('a0000006-0006-0006-0006-000000000006', '30000006-0006-0006-0006-000000000006', true, 1),
('a0000007-0007-0007-0007-000000000007', '30000007-0007-0007-0007-000000000007', false, 1),
('a0000008-0008-0008-0008-000000000008', '30000008-0008-0008-0008-000000000008', true, 1),
('a0000011-0011-0011-0011-000000000011', '30000009-0009-0009-0009-000000000009', true, 1),
('a0000010-0010-0010-0010-000000000010', '30000010-0010-0010-0010-000000000010', true, 1);

-- =============================================
-- ASSIGNMENTS
-- =============================================

INSERT INTO assignment (id, course_id, title, description, type, max_points, weight, due_date, submission_type, allows_late, published) VALUES
('40000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000001', 'Python Basics Assignment', 'Write functions to solve basic programming problems', 'homework', 100, 0.10, '2025-10-20 23:59:00+02', 'file_upload', true, true),
('40000002-0002-0002-0002-000000000002', 'a0000001-0001-0001-0001-000000000001', 'OOP Project', 'Build a simple object-oriented application', 'project', 100, 0.25, '2025-11-15 23:59:00+01', 'file_upload', false, true),
('40000003-0003-0003-0003-000000000003', 'a0000002-0002-0002-0002-000000000002', 'Sorting Algorithms', 'Implement and analyze various sorting algorithms', 'homework', 100, 0.15, '2025-10-25 23:59:00+02', 'file_upload', true, true),
('40000004-0004-0004-0004-000000000004', 'a0000003-0003-0003-0003-000000000003', 'Database Design Project', 'Design and implement a database for a real-world scenario', 'project', 100, 0.30, '2025-11-30 23:59:00+01', 'file_upload', false, true),
('40000005-0005-0005-0005-000000000005', 'a0000004-0004-0004-0004-000000000004', 'ML Classification Task', 'Train and evaluate classification models', 'project', 100, 0.35, '2025-12-10 23:59:00+01', 'file_upload', false, true),
('40000006-0006-0006-0006-000000000006', 'a0000005-0005-0005-0005-000000000005', 'Personal Portfolio Website', 'Build a responsive portfolio website', 'project', 100, 0.40, '2025-11-05 23:59:00+01', 'url', false, true),
('40000007-0007-0007-0007-000000000007', 'a0000009-0009-0009-0009-000000000009', 'Business Model Canvas', 'Create a business model for a startup idea', 'essay', 100, 0.20, '2025-10-28 23:59:00+01', 'file_upload', true, true),
('40000008-0008-0008-0008-000000000008', 'a0000011-0011-0011-0011-000000000011', 'Marketing Campaign Analysis', 'Analyze a successful marketing campaign', 'essay', 100, 0.25, '2025-11-20 23:59:00+01', 'file_upload', true, true);

-- =============================================
-- SUBMISSIONS (Some students have submitted)
-- =============================================

INSERT INTO submission (assignment_id, user_id, submitted_at, status, grade, feedback, graded_by, graded_at, is_late) VALUES
-- Daan Peters submitted Python assignment (graded)
('40000001-0001-0001-0001-000000000001', '77777777-7777-7777-7777-777777777777', '2025-10-18 14:32:00+02', 'graded', 85, 'Good work overall. Pay attention to edge cases in your functions.', '71111111-1111-1111-1111-111111111111', '2025-10-19 10:15:00+02', false),

-- Lisa de Jong submitted Python assignment (graded)
('40000001-0001-0001-0001-000000000001', '78888888-8888-8888-8888-888888888888', '2025-10-19 22:15:00+02', 'graded', 92, 'Excellent work! Clean code and good documentation.', '71111111-1111-1111-1111-111111111111', '2025-10-20 09:30:00+02', false),

-- Sara Dekker submitted Python assignment (not yet graded)
('40000001-0001-0001-0001-000000000001', '7c333333-3333-3333-3333-333333333333', '2025-10-20 18:45:00+02', 'submitted', NULL, NULL, NULL, NULL, false),

-- Nina Brouwer submitted Business Model Canvas (graded)
('40000007-0007-0007-0007-000000000007', '7a111111-1111-1111-1111-111111111111', '2025-10-27 20:30:00+01', 'graded', 88, 'Creative business idea with solid market analysis.', '76666666-6666-6666-6666-666666666666', '2025-10-28 14:00:00+01', false);

-- =============================================
-- ANNOUNCEMENTS
-- =============================================

INSERT INTO announcement (course_id, college_id, author_id, title, content, priority, published, published_at) VALUES
('a0000001-0001-0001-0001-000000000001', NULL, '71111111-1111-1111-1111-111111111111', 'Welcome to Programming!', 'Welcome to the Programming course! Please make sure to review the syllabus and set up your Python environment before the first lab session.', 'normal', true, '2025-10-01 09:00:00+02'),
('a0000001-0001-0001-0001-000000000001', NULL, '71111111-1111-1111-1111-111111111111', 'Lab Session Reminder', 'Reminder: Lab sessions start this Wednesday. Bring your laptop with Python installed.', 'high', true, '2025-10-06 16:00:00+02'),
('a0000004-0004-0004-0004-000000000004', NULL, '74444444-4444-4444-4444-444444444444', 'Guest Lecture Announcement', 'We will have a guest lecture from an AI industry expert on November 18th. Attendance is highly recommended!', 'high', true, '2025-10-07 11:00:00+02'),
('a0000009-0009-0009-0009-000000000009', NULL, '76666666-6666-6666-6666-666666666666', 'Business Case Competition', 'Sign up for the Business Case Competition happening on November 25th. Teams of 3-4 students. Prizes for winners!', 'normal', true, '2025-10-05 14:00:00+02'),
(NULL, '11111111-1111-1111-1111-111111111111', '70000000-0000-0000-0000-000000000000', 'University Holiday', 'The university will be closed on November 11th for a national holiday. No classes will be held.', 'urgent', true, '2025-10-01 08:00:00+02');

-- =============================================
-- PREREQUISITES
-- =============================================

INSERT INTO prerequisites (course_id, type, required_course_id, description) VALUES
-- Machine Learning requires Programming
('a0000004-0004-0004-0004-000000000004', 'course', 'a0000001-0001-0001-0001-000000000001', 'Must complete Programming before enrolling in Machine Learning'),
-- Databases requires Programming
('a0000003-0003-0003-0003-000000000003', 'course', 'a0000001-0001-0001-0001-000000000001', 'Must complete Programming before enrolling in Databases'),
-- Software Engineering requires Programming and Algorithms
('a0000006-0006-0006-0006-000000000006', 'course', 'a0000001-0001-0001-0001-000000000001', 'Must complete Programming before enrolling in Software Engineering'),
('a0000006-0006-0006-0006-000000000006', 'course', 'a0000002-0002-0002-0002-000000000002', 'Must complete Algorithms before enrolling in Software Engineering');

-- =============================================
-- OBJECTIVE TAGS
-- =============================================

INSERT INTO objective_tag (id, name, description, category) VALUES
('50000001-0001-0001-0001-000000000001', 'Problem Solving', 'Ability to analyze and solve computational problems', 'skill'),
('50000002-0002-0002-0002-000000000002', 'Programming', 'Proficiency in writing code', 'skill'),
('50000003-0003-0003-0003-000000000003', 'Data Analysis', 'Understanding data structures and analysis techniques', 'skill'),
('50000004-0004-0004-0004-000000000004', 'Critical Thinking', 'Analytical and logical reasoning', 'competency'),
('50000005-0005-0005-0005-000000000005', 'Teamwork', 'Collaboration and communication in groups', 'competency'),
('50000006-0006-0006-0006-000000000006', 'Business Strategy', 'Understanding strategic business decisions', 'knowledge');

-- =============================================
-- TEACHING METHOD TAGS
-- =============================================

INSERT INTO teaching_method_tag (id, name, description) VALUES
('10000001-0001-0001-0001-000000000001', 'Lectures', 'Traditional classroom lectures'),
('10000002-0002-0002-0002-000000000002', 'Hands-on Labs', 'Practical lab sessions'),
('10000003-0003-0003-0003-000000000003', 'Project-based Learning', 'Learning through projects'),
('10000004-0004-0004-0004-000000000004', 'Case Studies', 'Analysis of real-world cases'),
('10000005-0005-0005-0005-000000000005', 'Group Work', 'Collaborative team projects');

-- =============================================
-- SEED DATA COMPLETE
-- =============================================
