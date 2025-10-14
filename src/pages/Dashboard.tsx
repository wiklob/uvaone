import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './CourseDetail.css';
import './Dashboard.css';

interface Course {
  id: string;
  code: string;
  title: string;
  ects: number;
}

interface TimelineItem {
  id: string;
  type: 'lesson' | 'assignment';
  title: string;
  date: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  lessonType?: string;
  assignmentType?: string;
  facilityName?: string;
  maxPoints?: number;
  dueDate?: string;
}

interface Assignment {
  id: string;
  title: string;
  type: string;
  max_points: number;
  weight: number;
  due_date: string | null;
  course_id: string;
  courseCode?: string;
  courseTitle?: string;
  submission?: {
    id: string;
    grade: number | null;
    status: string;
  };
}

interface CourseWithGrades {
  course_id: string;
  courseCode: string;
  courseTitle: string;
  ects: number;
  assignments: Assignment[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [coursesWithGrades, setCoursesWithGrades] = useState<CourseWithGrades[]>([]);
  const [overallGPA, setOverallGPA] = useState<number | null>(null);
  const [totalWeight, setTotalWeight] = useState(0);
  const [gradedWeight, setGradedWeight] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const expandRecurringEvent = (event: any): any[] => {
    if (!event.is_recurring || !event.recurrence_rule || !event.recurrence_end_date) {
      return [event];
    }

    const occurrences: any[] = [];
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    const recurrenceEndDate = new Date(event.recurrence_end_date);
    const duration = endDate.getTime() - startDate.getTime();

    let currentDate = new Date(startDate);
    let occurrenceNumber = 0;

    while (currentDate <= recurrenceEndDate) {
      const occurrenceStart = new Date(currentDate);
      const occurrenceEnd = new Date(currentDate.getTime() + duration);

      let updatedTitle = event.title;
      if (updatedTitle) {
        updatedTitle = updatedTitle.replace(/\s*-?\s*Week \d+/i, '');
      }

      occurrences.push({
        ...event,
        id: `${event.id}-occurrence-${occurrenceNumber}`,
        title: updatedTitle,
        start_time: occurrenceStart.toISOString(),
        end_time: occurrenceEnd.toISOString(),
        original_event_id: event.id
      });

      occurrenceNumber++;

      switch (event.recurrence_rule) {
        case 'DAILY':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'WEEKLY':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'MONTHLY':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        default:
          currentDate = new Date(recurrenceEndDate.getTime() + 1);
      }
    }

    return occurrences;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all enrolled courses
      const { data: enrolledCourses, error: enrollError } = await supabase
        .from('course_enrollments')
        .select('course!inner(id, code, title, ects)');

      if (enrollError) throw enrollError;

      const courses = (enrolledCourses?.map(e => e.course as any as Course) || []) as Course[];
      const courseIds = courses.map(c => c.id);

      // Fetch all assignments from all courses
      const { data: assignmentsData, error: assignError } = await supabase
        .from('assignment')
        .select('*')
        .in('course_id', courseIds)
        .eq('published', true);

      if (assignError) throw assignError;

      const assignmentIds = assignmentsData?.map(a => a.id) || [];
      const { data: submissions } = await supabase
        .from('submission')
        .select('*')
        .in('assignment_id', assignmentIds);

      // Build assignments with submissions and course info
      const assignmentsWithSubmissions = (assignmentsData || []).map(assignment => {
        const course = courses.find(c => c.id === assignment.course_id);
        const submission = submissions?.find(s => s.assignment_id === assignment.id);
        return {
          ...assignment,
          courseCode: course?.code,
          courseTitle: course?.title,
          submission
        };
      });

      // Fetch all lessons and events from all courses
      const { data: lessonsData } = await supabase
        .from('lesson')
        .select(`
          *,
          room:room_id (
            name,
            facility:facility_id (
              name
            )
          ),
          course!inner(code, title)
        `)
        .in('course_id', courseIds);

      const lessonIds = lessonsData?.map(l => l.id) || [];
      const { data: eventsData } = await supabase
        .from('event')
        .select('*')
        .in('lesson_id', lessonIds)
        .order('start_time', { ascending: true });

      // Build timeline items
      const timeline: TimelineItem[] = [];
      const now = new Date();

      // Add events with their lesson info (expanding recurring events)
      if (eventsData && lessonsData) {
        eventsData.forEach(event => {
          const lesson = lessonsData.find(l => l.id === event.lesson_id);
          if (lesson) {
            const eventOccurrences = expandRecurringEvent(event);

            eventOccurrences.forEach(occurrence => {
              timeline.push({
                id: occurrence.id,
                type: 'lesson',
                title: occurrence.title || lesson.title,
                date: occurrence.start_time,
                courseId: lesson.course_id,
                courseCode: lesson.course.code,
                courseTitle: lesson.course.title,
                lessonType: lesson.type,
                facilityName: lesson.room?.facility?.name
              });
            });
          }
        });
      }

      // Add assignments to timeline
      if (assignmentsData) {
        assignmentsData.forEach(assignment => {
          if (assignment.due_date) {
            const course = courses.find(c => c.id === assignment.course_id);
            timeline.push({
              id: assignment.id,
              type: 'assignment',
              title: assignment.title,
              date: assignment.due_date,
              courseId: assignment.course_id,
              courseCode: course?.code || '',
              courseTitle: course?.title || '',
              assignmentType: assignment.type,
              dueDate: assignment.due_date,
              maxPoints: assignment.max_points
            });
          }
        });
      }

      // Sort timeline by date and filter for upcoming items (next 5)
      const upcomingItems = timeline
        .filter(item => new Date(item.date) > now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

      setTimelineItems(upcomingItems);

      // Get pending assignments (upcoming + not submitted)
      const pending = assignmentsWithSubmissions
        .filter(a => {
          const hasSubmission = a.submission?.grade != null || a.submission?.status === 'submitted';
          return !hasSubmission && (!a.due_date || new Date(a.due_date) > now);
        })
        .sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        })
        .slice(0, 5);

      setPendingAssignments(pending);

      // Calculate overall GPA across all courses
      const courseGrades: CourseWithGrades[] = courses.map(course => {
        const courseAssignments = assignmentsWithSubmissions.filter(a => a.course_id === course.id);
        return {
          course_id: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          ects: course.ects,
          assignments: courseAssignments
        };
      });

      setCoursesWithGrades(courseGrades);

      // Calculate weighted GPA (weighted by ECTS)
      let totalECTS = 0;
      let weightedGradeSum = 0;
      let totalAssignmentWeight = 0;
      let totalGradedWeight = 0;

      courseGrades.forEach(courseGrade => {
        const gradedAssignments = courseGrade.assignments.filter(a => a.submission?.grade != null);

        if (gradedAssignments.length > 0) {
          const courseAssignmentWeight = courseGrade.assignments.reduce((sum, a) => sum + (a.weight || 0), 0);
          const courseGradedWeight = gradedAssignments.reduce((sum, a) => sum + (a.weight || 0), 0);

          totalAssignmentWeight += courseAssignmentWeight;
          totalGradedWeight += courseGradedWeight;

          const courseWeightedGPA = gradedAssignments.reduce((sum, a) => {
            const percentage = (a.submission!.grade! / a.max_points) * 100;
            const gradePoint = percentage / 10;
            return sum + (gradePoint * (a.weight || 0));
          }, 0) / courseGradedWeight;

          totalECTS += courseGrade.ects;
          weightedGradeSum += courseWeightedGPA * courseGrade.ects;
        }
      });

      const gpa = totalECTS > 0 ? weightedGradeSum / totalECTS : null;
      setOverallGPA(gpa);
      setTotalWeight(totalAssignmentWeight);
      setGradedWeight(totalGradedWeight);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGradeClass = (grade: number | null) => {
    if (grade === null) return '';
    if (grade >= 8.5) return 'excellent';
    if (grade >= 7.5) return 'good';
    if (grade >= 6.5) return 'average';
    if (grade >= 5.5) return 'poor';
    return 'fail';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#dc3545' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  const weightProgress = totalWeight > 0 ? (gradedWeight / totalWeight) * 100 : 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{getGreeting()}, Daan</h1>
          <p className="page-subtitle">{today}</p>
        </div>
      </div>

      <div className="tab-content">
        <div className="dashboard-grid">
          {/* Timeline Widget */}
          <div className="dashboard-widget timeline-widget">
            <div className="widget-header">
              <h3 className="widget-title">Upcoming Timeline</h3>
              <button
                className="widget-link-btn"
                onClick={() => navigate('/courses/timeline')}
              >
                View All →
              </button>
            </div>
            <div className="widget-body">
              {timelineItems.length === 0 ? (
                <div className="widget-empty">
                  <div className="widget-empty-icon">✅</div>
                  <div className="widget-empty-text">No upcoming events</div>
                </div>
              ) : (
                <div className="compact-timeline-list">
                  {timelineItems.map(item => (
                    <div
                      key={`${item.type}-${item.id}-${item.courseId}`}
                      className="compact-timeline-item"
                      onClick={() => {
                        if (item.type === 'lesson') {
                          navigate(`/course/${item.courseId}/lesson/${item.id}`);
                        } else {
                          navigate(`/course/${item.courseId}/assignment/${item.id}`);
                        }
                      }}
                    >
                      <div className={`compact-item-marker ${item.type}`}></div>
                      <div className="compact-item-content">
                        <div className="compact-item-title">{item.title}</div>
                        <div className="compact-item-meta">
                          <span className="course-badge" style={{
                            display: 'inline-block',
                            padding: '0.125rem 0.375rem',
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            marginRight: '0.5rem'
                          }}>
                            {item.courseCode}
                          </span>
                          {item.type === 'lesson' ? (
                            <>
                              <span className="compact-meta-badge">
                                {item.lessonType === 'lecture' && '📚'}
                                {item.lessonType === 'seminar' && '💬'}
                                {item.lessonType === 'tutorial' && '👨‍🏫'}
                                {item.lessonType === 'lab' && '🔬'}
                                {item.lessonType === 'workshop' && '🛠️'}
                                {item.lessonType === 'exam' && '📝'}
                                {' '}{item.lessonType}
                              </span>
                              <span>•</span>
                              <span>{formatDateTime(item.date)}</span>
                              {item.facilityName && (
                                <>
                                  <span>•</span>
                                  <span>{item.facilityName}</span>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="compact-meta-badge">
                                {item.assignmentType === 'homework' && '📝'}
                                {item.assignmentType === 'essay' && '📄'}
                                {item.assignmentType === 'project' && '🚀'}
                                {item.assignmentType === 'exam' && '📝'}
                                {item.assignmentType === 'quiz' && '❓'}
                                {item.assignmentType === 'presentation' && '🎤'}
                                {item.assignmentType === 'preparation' && '📖'}
                                {' '}{item.assignmentType}
                              </span>
                              <span>•</span>
                              <span>Due {formatDateTime(item.date)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grades Widget */}
          <div className="dashboard-widget grades-widget">
            <div className="widget-header">
              <h3 className="widget-title">Your Grades</h3>
              <button
                className="widget-link-btn"
                onClick={() => navigate('/courses/grades')}
              >
                View All →
              </button>
            </div>
            <div className="widget-body centered">
              {overallGPA !== null ? (
                <>
                  <div className="gpa-circle-container">
                    <svg className="gpa-circle" viewBox="0 0 200 200">
                      <circle
                        className="gpa-circle-bg"
                        cx="100"
                        cy="100"
                        r="85"
                      />
                      <circle
                        className="gpa-circle-progress"
                        cx="100"
                        cy="100"
                        r="85"
                        strokeDasharray={`${(weightProgress / 100) * 534.07} 534.07`}
                      />
                    </svg>
                    <div className="gpa-value-container">
                      <div className={`gpa-value ${getGradeClass(overallGPA)}`}>
                        {overallGPA.toFixed(2)}
                      </div>
                      <div className="gpa-label">GPA</div>
                    </div>
                  </div>
                  <div className="gpa-details">
                    <div className="gpa-detail-item">
                      <span className="gpa-detail-label">Graded Weight:</span>
                      <span className="gpa-detail-value">{weightProgress.toFixed(0)}%</span>
                    </div>
                    <div className="gpa-detail-item">
                      <span className="gpa-detail-label">Active Courses:</span>
                      <span className="gpa-detail-value">{coursesWithGrades.length}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="widget-empty">
                  <div className="widget-empty-icon">📊</div>
                  <div className="widget-empty-text">No grades yet</div>
                </div>
              )}
            </div>
          </div>

          {/* Assignments Widget */}
          <div className="dashboard-widget assignments-widget">
            <div className="widget-header">
              <h3 className="widget-title">Pending Assignments</h3>
              <button
                className="widget-link-btn"
                onClick={() => navigate('/courses/assignments')}
              >
                View All →
              </button>
            </div>
            <div className="widget-body">
              {pendingAssignments.length === 0 ? (
                <div className="widget-empty">
                  <div className="widget-empty-icon">✅</div>
                  <div className="widget-empty-text">All caught up!</div>
                </div>
              ) : (
                <div className="compact-assignments-list">
                  {pendingAssignments.map(assignment => (
                    <div
                      key={`${assignment.id}-${assignment.course_id}`}
                      className="compact-assignment-item"
                      onClick={() => navigate(`/course/${assignment.course_id}/assignment/${assignment.id}`)}
                    >
                      <div className="compact-assignment-left">
                        <div className="compact-assignment-icon">
                          {assignment.type === 'homework' && '📝'}
                          {assignment.type === 'essay' && '📄'}
                          {assignment.type === 'project' && '🚀'}
                          {assignment.type === 'exam' && '📝'}
                          {assignment.type === 'quiz' && '❓'}
                          {assignment.type === 'presentation' && '🎤'}
                          {assignment.type === 'preparation' && '📖'}
                        </div>
                        <div className="compact-assignment-info">
                          <div className="compact-assignment-title">{assignment.title}</div>
                          <div className="compact-assignment-meta">
                            <span className="course-badge" style={{
                              display: 'inline-block',
                              padding: '0.125rem 0.375rem',
                              background: 'var(--primary)',
                              color: 'white',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              marginRight: '0.5rem'
                            }}>
                              {assignment.courseCode}
                            </span>
                            <span className="compact-meta-badge">{assignment.type}</span>
                            {assignment.due_date && (
                              <>
                                <span>•</span>
                                <span className="compact-assignment-due">
                                  Due {formatDate(assignment.due_date)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="compact-assignment-right">
                        <div className="compact-assignment-weight">
                          {(assignment.weight * 100).toFixed(0)}%
                        </div>
                        <div className="compact-assignment-points">
                          {assignment.max_points} pts
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
