import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { EventWithDetails, AssignmentWithSubmission, AnnouncementWithDetails, Submission } from '../types/database';

// Demo user: Daan Peters (CS student)
const DEMO_USER_ID = '77777777-7777-7777-7777-777777777777';

type QuickStats = {
  activeCourses: number;
  gpa: number;
  upcomingDeadlines: number;
  creditsEarned: number;
  creditsTotal: number;
};

type AnnouncementOrGrade = {
  id: string;
  type: 'announcement' | 'grade';
  title: string;
  content?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  course?: { code: string; title: string };
  college?: { name: string };
  timestamp: string;
  grade?: number;
  assignmentTitle?: string;
  maxPoints?: number;
};

export function useDashboard() {
  const [todaysSchedule, setTodaysSchedule] = useState<EventWithDetails[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    activeCourses: 0,
    gpa: 0,
    upcomingDeadlines: 0,
    creditsEarned: 0,
    creditsTotal: 180
  });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<AssignmentWithSubmission[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementOrGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        enrolledCoursesData,
        todaysEventsData,
        assignmentsData,
        announcementsData,
        recentGradesData
      ] = await Promise.all([
        fetchEnrolledCourses(),
        fetchTodaysEvents(),
        fetchUpcomingAssignments(),
        fetchAnnouncements(),
        fetchRecentGrades()
      ]);

      // Calculate stats
      const stats = calculateStats(enrolledCoursesData, assignmentsData);

      setTodaysSchedule(todaysEventsData);
      setQuickStats(stats);
      setUpcomingDeadlines(assignmentsData);

      // Merge announcements and grades
      const merged = mergeAnnouncementsAndGrades(announcementsData, recentGradesData);
      setAnnouncements(merged);

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return {
    todaysSchedule,
    quickStats,
    upcomingDeadlines,
    announcements,
    loading,
    error,
    refresh: fetchDashboardData
  };
}

// Helper functions

async function fetchEnrolledCourses() {
  const { data, error } = await supabase
    .from('course_enrollments')
    .select(`
      *,
      course(*)
    `)
    .eq('user_id', DEMO_USER_ID)
    .eq('role', 'student')
    .eq('status', 'active');

  if (error) throw error;
  return data || [];
}

async function fetchTodaysEvents(): Promise<EventWithDetails[]> {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  // First get user's enrolled courses
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('course_id')
    .eq('user_id', DEMO_USER_ID)
    .eq('role', 'student')
    .eq('status', 'active');

  if (!enrollments || enrollments.length === 0) return [];

  const courseIds = enrollments.map(e => e.course_id);

  const { data, error } = await supabase
    .from('event')
    .select(`
      *,
      lesson!inner(
        *,
        course!inner(*),
        room(
          *,
          facility(*)
        )
      )
    `)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .in('lesson.course_id', courseIds)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return (data || []) as EventWithDetails[];
}

async function fetchUpcomingAssignments(): Promise<AssignmentWithSubmission[]> {
  const now = new Date();
  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

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
    .gte('due_date', now.toISOString())
    .lte('due_date', twoWeeksFromNow.toISOString())
    .eq('submission.user_id', DEMO_USER_ID)
    .order('due_date', { ascending: true });

  if (error) throw error;

  // Transform to match expected type
  return (assignments || []).map(a => ({
    ...a,
    submission: Array.isArray(a.submission) ? a.submission : (a.submission ? [a.submission] : [])
  })) as AssignmentWithSubmission[];
}

async function fetchAnnouncements() {
  // Get user's enrolled courses
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('course_id')
    .eq('user_id', DEMO_USER_ID)
    .eq('role', 'student')
    .eq('status', 'active');

  if (!enrollments || enrollments.length === 0) return [];

  const courseIds = enrollments.map(e => e.course_id);

  const { data, error } = await supabase
    .from('announcement')
    .select(`
      *,
      course(code, title),
      college(name),
      author:user!author_id(first_name, last_name)
    `)
    .or(`course_id.in.(${courseIds.join(',')}),college_id.not.is.null`)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(3);

  if (error) throw error;
  return data || [];
}

async function fetchRecentGrades() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('submission')
    .select(`
      *,
      assignment!inner(
        title,
        max_points,
        course(code, title)
      )
    `)
    .eq('user_id', DEMO_USER_ID)
    .eq('status', 'graded')
    .gte('graded_at', oneWeekAgo.toISOString())
    .not('grade', 'is', null)
    .order('graded_at', { ascending: false })
    .limit(2);

  if (error) throw error;
  return data || [];
}

function calculateStats(enrollments: any[], assignments: AssignmentWithSubmission[]): QuickStats {
  const activeCourses = enrollments.length;

  // Calculate GPA from graded submissions
  let totalPoints = 0;
  let maxPoints = 0;

  assignments.forEach(assignment => {
    if (assignment.submission && assignment.submission.length > 0) {
      const submission = assignment.submission[0];
      if (submission.grade !== null && submission.grade !== undefined) {
        totalPoints += submission.grade;
        maxPoints += assignment.max_points || 0;
      }
    }
  });

  const gpa = maxPoints > 0 ? (totalPoints / maxPoints) * 10 : 0;

  // Count upcoming deadlines (next 7 days)
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

  const upcomingDeadlines = assignments.filter(a => {
    if (!a.due_date) return false;
    const dueDate = new Date(a.due_date);
    return dueDate <= oneWeekFromNow;
  }).length;

  // Calculate credits
  const creditsEarned = enrollments.reduce((sum, e) => {
    if (e.status === 'completed') {
      return sum + (e.course?.ects || 0);
    }
    return sum;
  }, 0);

  return {
    activeCourses,
    gpa,
    upcomingDeadlines,
    creditsEarned,
    creditsTotal: 180
  };
}

function mergeAnnouncementsAndGrades(
  announcements: any[],
  grades: any[]
): AnnouncementOrGrade[] {
  const result: AnnouncementOrGrade[] = [];

  // Add announcements
  announcements.forEach(a => {
    result.push({
      id: a.id,
      type: 'announcement',
      title: a.title,
      content: a.content,
      priority: a.priority,
      course: a.course,
      college: a.college,
      timestamp: a.published_at
    });
  });

  // Add grades
  grades.forEach(g => {
    result.push({
      id: `grade-${g.id}`,
      type: 'grade',
      title: 'Grade Posted',
      assignmentTitle: g.assignment?.title,
      course: g.assignment?.course,
      timestamp: g.graded_at,
      grade: g.grade,
      maxPoints: g.assignment?.max_points
    });
  });

  // Sort by timestamp descending
  result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return result.slice(0, 5);
}
