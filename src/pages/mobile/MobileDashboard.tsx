import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import MobileLayout from '../../components/mobile/MobileLayout';
import '../../pages/Dashboard.css';

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

export default function MobileDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [overallGPA, setOverallGPA] = useState<number | null>(null);
  const [weightProgress, setWeightProgress] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all enrolled courses
      const { data: enrolledCourses } = await supabase
        .from('course_enrollments')
        .select('course!inner(id, code, title, ects)');

      const coursesList = (enrolledCourses?.map(e => e.course as any as Course) || []) as Course[];
      setCourses(coursesList);
      const courseIds = coursesList.map(c => c.id);

      // Fetch assignments
      const { data: assignmentsData } = await supabase
        .from('assignment')
        .select('*')
        .in('course_id', courseIds)
        .eq('published', true);

      const assignmentIds = assignmentsData?.map(a => a.id) || [];
      const { data: submissions } = await supabase
        .from('submission')
        .select('*')
        .in('assignment_id', assignmentIds);

      const assignmentsWithSubmissions = (assignmentsData || []).map(assignment => {
        const course = coursesList.find(c => c.id === assignment.course_id);
        const submission = submissions?.find(s => s.assignment_id === assignment.id);
        return {
          ...assignment,
          courseCode: course?.code,
          courseTitle: course?.title,
          submission
        };
      });

      // Fetch timeline
      const { data: lessonsData } = await supabase
        .from('lesson')
        .select(`
          *,
          room:room_id (
            name,
            facility:facility_id (name)
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

      const timeline: TimelineItem[] = [];
      const now = new Date();

      if (eventsData && lessonsData) {
        eventsData.forEach(event => {
          const lesson = lessonsData.find(l => l.id === event.lesson_id);
          if (lesson) {
            timeline.push({
              id: event.id,
              type: 'lesson',
              title: event.title || lesson.title,
              date: event.start_time,
              courseId: lesson.course_id,
              courseCode: lesson.course.code,
              courseTitle: lesson.course.title,
              lessonType: lesson.type,
              facilityName: lesson.room?.facility?.name
            });
          }
        });
      }

      if (assignmentsData) {
        assignmentsData.forEach(assignment => {
          if (assignment.due_date) {
            const course = coursesList.find(c => c.id === assignment.course_id);
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

      const upcomingItems = timeline
        .filter(item => new Date(item.date) > now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

      setTimelineItems(upcomingItems);

      // Get pending assignments
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

      // Calculate GPA
      const gradedAssignments = assignmentsWithSubmissions.filter(a => a.submission?.grade != null);
      if (gradedAssignments.length > 0) {
        const totalWeight = assignmentsWithSubmissions.reduce((sum, a) => sum + (a.weight || 0), 0);
        const gradedWeight = gradedAssignments.reduce((sum, a) => sum + (a.weight || 0), 0);
        const weightedSum = gradedAssignments.reduce(
          (sum, a) => sum + ((a.submission!.grade! / a.max_points) * (a.weight || 0)),
          0
        );
        const gpa = gradedWeight > 0 ? (weightedSum / gradedWeight) * 10 : null;
        setOverallGPA(gpa);
        setWeightProgress(totalWeight > 0 ? (gradedWeight / totalWeight) * 100 : 0);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  const getGradeClass = (grade: number | null) => {
    if (grade === null) return '';
    if (grade >= 8.5) return 'excellent';
    if (grade >= 7.5) return 'good';
    if (grade >= 6.5) return 'average';
    if (grade >= 5.5) return 'poor';
    return 'fail';
  };

  if (loading) {
    return (
      <MobileLayout>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading dashboard...</div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
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
                  onClick={() => navigate('/timeline')}
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

            {/* Course Shortcuts Widget */}
            <div className="dashboard-widget">
              <div className="widget-header">
                <h3 className="widget-title">Course Shortcuts</h3>
                {courses.length > 4 && (
                  <button
                    className="widget-link-btn"
                    onClick={() => navigate('/courses/all_courses')}
                  >
                    View All →
                  </button>
                )}
              </div>
              <div className="widget-body">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem'
                }}>
                  {courses.slice(0, 4).map(course => (
                    <div
                      key={course.id}
                      onClick={() => navigate(`/course/${course.id}/overview`)}
                      style={{
                        padding: '1rem',
                        background: 'var(--primary)',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {course.code}
                      </div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                        {course.ects} ECTS
                      </div>
                    </div>
                  ))}
                </div>
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
                        <span className="gpa-detail-value">{courses.length}</span>
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
    </MobileLayout>
  );
}
