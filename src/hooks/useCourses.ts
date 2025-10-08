import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type {
  CourseEnrollment,
  Course,
  AssignmentWithSubmission,
  CourseMaterialWithDetails,
  AnnouncementWithDetails
} from '../types/database';

// Demo user: Daan Peters (CS student)
const DEMO_USER_ID = '77777777-7777-7777-7777-777777777777';

export type CourseWithDetails = CourseEnrollment & {
  course: Course;
  assignmentsCount: number;
  materialsCount: number;
  announcementsCount: number;
};

type ContentTab = 'courses' | 'assignments' | 'materials' | 'announcements' | 'grades';

export function useCourses() {
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [allAssignments, setAllAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [allMaterials, setAllMaterials] = useState<CourseMaterialWithDetails[]>([]);
  const [allAnnouncements, setAllAnnouncements] = useState<AnnouncementWithDetails[]>([]);
  const [contentTab, setContentTab] = useState<ContentTab>('courses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoursesData();
  }, []);

  const fetchCoursesData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [coursesData, assignmentsData, materialsData, announcementsData] = await Promise.all([
        fetchEnrolledCourses(),
        fetchAllAssignments(),
        fetchAllMaterials(),
        fetchAllAnnouncements()
      ]);

      setCourses(coursesData);
      setAllAssignments(assignmentsData);
      setAllMaterials(materialsData);
      setAllAnnouncements(announcementsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses data:', err);
      setError('Failed to load courses data');
    } finally {
      setLoading(false);
    }
  };

  return {
    courses,
    allAssignments,
    allMaterials,
    allAnnouncements,
    contentTab,
    setContentTab,
    loading,
    error,
    refresh: fetchCoursesData
  };
}

// Helper functions

async function fetchEnrolledCourses(): Promise<CourseWithDetails[]> {
  const { data: enrollments, error } = await supabase
    .from('course_enrollments')
    .select(`
      *,
      course(*)
    `)
    .eq('user_id', DEMO_USER_ID)
    .eq('role', 'student')
    .eq('status', 'active');

  if (error) throw error;

  // Fetch counts for each course
  const coursesWithCounts = await Promise.all(
    (enrollments || []).map(async (enrollment) => {
      const [assignmentsCount, materialsCount, announcementsCount] = await Promise.all([
        // Count assignments
        supabase
          .from('assignment')
          .select('id', { count: 'exact', head: true })
          .eq('course_id', enrollment.course_id)
          .eq('published', true)
          .then(res => res.count || 0),

        // Count materials
        supabase
          .from('course_materials')
          .select('id', { count: 'exact', head: true })
          .eq('course_id', enrollment.course_id)
          .then(res => res.count || 0),

        // Count announcements
        supabase
          .from('announcement')
          .select('id', { count: 'exact', head: true })
          .eq('course_id', enrollment.course_id)
          .eq('published', true)
          .then(res => res.count || 0)
      ]);

      return {
        ...enrollment,
        assignmentsCount,
        materialsCount,
        announcementsCount
      } as CourseWithDetails;
    })
  );

  return coursesWithCounts;
}

async function fetchAllAssignments(): Promise<AssignmentWithSubmission[]> {
  // Get user's enrolled courses
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('course_id')
    .eq('user_id', DEMO_USER_ID)
    .eq('role', 'student')
    .eq('status', 'active');

  if (!enrollments || enrollments.length === 0) return [];

  const courseIds = enrollments.map(e => e.course_id);

  const { data: assignments, error } = await supabase
    .from('assignment')
    .select(`
      *,
      course(*),
      submission(*)
    `)
    .in('course_id', courseIds)
    .eq('published', true)
    .eq('submission.user_id', DEMO_USER_ID)
    .order('due_date', { ascending: true });

  if (error) throw error;

  // Transform to match expected type
  return (assignments || []).map(a => ({
    ...a,
    submission: Array.isArray(a.submission) ? a.submission : (a.submission ? [a.submission] : [])
  })) as AssignmentWithSubmission[];
}

async function fetchAllMaterials(): Promise<CourseMaterialWithDetails[]> {
  // Get user's enrolled courses
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('course_id')
    .eq('user_id', DEMO_USER_ID)
    .eq('role', 'student')
    .eq('status', 'active');

  if (!enrollments || enrollments.length === 0) return [];

  const courseIds = enrollments.map(e => e.course_id);

  const { data: materials, error } = await supabase
    .from('course_materials')
    .select(`
      *,
      course(*),
      material(*)
    `)
    .in('course_id', courseIds)
    .order('order', { ascending: true });

  if (error) throw error;

  return materials as CourseMaterialWithDetails[];
}

async function fetchAllAnnouncements(): Promise<AnnouncementWithDetails[]> {
  // Get user's enrolled courses
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('course_id')
    .eq('user_id', DEMO_USER_ID)
    .eq('role', 'student')
    .eq('status', 'active');

  if (!enrollments || enrollments.length === 0) return [];

  const courseIds = enrollments.map(e => e.course_id);

  const { data: announcements, error } = await supabase
    .from('announcement')
    .select(`
      *,
      course(code, title),
      college(name),
      author:user!author_id(*)
    `)
    .in('course_id', courseIds)
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) throw error;

  return announcements as AnnouncementWithDetails[];
}
