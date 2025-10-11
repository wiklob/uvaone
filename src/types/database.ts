// Database types matching Supabase schema

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  student_number: string | null;
  date_of_birth: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  status: 'active' | 'suspended' | 'graduated' | 'alumni';
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  ects: number;
  period: number | null;
  language: string | null;
  max_students: number | null;
  registration_start: string | null;
  registration_end: string | null;
  objectives: string | null;
  teaching_methods: string | null;
  contact_hours: number | null;
  academic_year: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
};

export type CourseEnrollment = {
  id: string;
  course_id: string;
  user_id: string;
  role: 'student' | 'lecturer' | 'tutor' | 'coordinator';
  enrolled_at: string;
  status: 'active' | 'dropped' | 'completed' | 'waitlist';
  final_grade: number | null;
  grade_letter: string | null;
  course?: Course;
};

export type Lesson = {
  id: string;
  course_id: string;
  course_group_id: string | null;
  title: string;
  type: 'lecture' | 'seminar' | 'exam' | 'tutorial' | 'lab' | 'workshop';
  description: string | null;
  room_id: string | null;
  created_at: string;
  course?: Course;
  room?: Room;
};

export type Event = {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null;
  recurrence_end_date: string | null;
  location_override: string | null;
  is_online: boolean;
  online_link: string | null;
  status: 'scheduled' | 'cancelled' | 'rescheduled' | 'completed';
  created_at: string;
  updated_at: string;
  lesson?: Lesson;
};

export type Room = {
  id: string;
  name: string;
  facility_id: string;
  capacity: number;
  type: 'lecture_hall' | 'classroom' | 'study_space' | 'lab' | 'exam_hall';
  floor: number | null;
  equipment: string | null;
  accessibility: string | null;
  bookable: boolean;
  created_at: string;
  facility?: Facility;
};

export type Facility = {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_hours: string | null;
  created_at: string;
};

export type Assignment = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  type: 'homework' | 'essay' | 'project' | 'exam' | 'quiz' | 'presentation' | 'preparation';
  max_points: number | null;
  weight: number | null;
  due_date: string | null;
  submission_type: 'file_upload' | 'text' | 'url' | 'no_submission';
  allows_late: boolean;
  late_penalty: number | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  lesson_id: string | null;
  course?: Course;
  lesson?: Lesson;
};

export type Submission = {
  id: string;
  assignment_id: string;
  user_id: string;
  submitted_at: string;
  content: string | null;
  file_url: string | null;
  external_url: string | null;
  status: 'draft' | 'submitted' | 'graded' | 'returned';
  grade: number | null;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
  is_late: boolean;
  assignment?: Assignment;
};

export type Material = {
  id: string;
  title: string;
  type: 'book' | 'video' | 'article' | 'research_paper' | 'slides' | 'dataset' | 'software';
  description: string | null;
  url: string | null;
  availability: 'library' | 'open_access' | 'paywall' | 'university_license';
  isbn: string | null;
  authors: string | null;
  publication_year: number | null;
  required: boolean;
  created_at: string;
};

export type CourseMaterial = {
  id: string;
  course_id: string;
  material_id: string;
  required: boolean | null;
  order: number | null;
  course?: Course;
  material?: Material;
};

export type Announcement = {
  id: string;
  course_id: string | null;
  college_id: string | null;
  author_id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  course?: Course;
  author?: User;
};

export type College = {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  email: string | null;
  logo_url: string | null;
  created_at: string;
};

export type CourseGroup = {
  id: string;
  course_id: string;
  name: string;
  type: 'lecture' | 'tutorial' | 'lab' | 'seminar';
  max_students: number | null;
  created_at: string;
};

// Helper types for joined queries
export type EventWithDetails = Event & {
  lesson: Lesson & {
    course: Course;
    room: Room & {
      facility: Facility;
    };
  };
};

export type AssignmentWithSubmission = Assignment & {
  course: Course;
  submission?: Submission[];
};

export type CourseMaterialWithDetails = CourseMaterial & {
  course: Course;
  material: Material;
};

export type AnnouncementWithDetails = Announcement & {
  course?: Course;
  college?: College;
  author: User;
};
