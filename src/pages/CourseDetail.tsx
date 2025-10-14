import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import MaterialCard, { type CourseMaterial as MaterialCardType } from '../components/MaterialCard';
import './CourseDetail.css';

interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  ects: number;
  instructor: string;
  schedule: string;
}

interface Assignment {
  id: string;
  title: string;
  type: string;
  max_points: number;
  weight: number;
  due_date: string;
  course_id: string;
  lesson_id?: string | null;
}

interface Submission {
  id: string;
  assignment_id: string;
  grade: number | null;
  feedback: string | null;
  status: string;
  submitted_at: string;
}

interface Material extends MaterialCardType {
  week?: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  published_at?: string;
  priority?: string;
  author?: {
    first_name: string;
    last_name: string;
  };
}

interface TimelineItem {
  id: string;
  type: 'lesson' | 'assignment';
  title: string;
  date: string;
  endDate?: string;
  description?: string | null;
  lessonType?: string;
  assignmentType?: string;
  dueDate?: string | null;
  maxPoints?: number;
  isOnline?: boolean;
  status?: string;
  roomName?: string;
  facilityName?: string;
  submissionType?: string;
}

type TabType = 'overview' | 'timeline' | 'grades' | 'assignments' | 'materials' | 'announcements';

export default function CourseDetail() {
  const { id, tab, itemId } = useParams<{ id: string; tab?: string; itemId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<(Assignment & { submission?: Submission })[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [_finalGrade, setFinalGrade] = useState<number | null>(null);
  const [_currentGrade, setCurrentGrade] = useState<number | null>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [submittedAssignments, setSubmittedAssignments] = useState<Set<string>>(new Set());

  // Materials filters state
  const [materialSearch, setMaterialSearch] = useState('');
  const [showMaterialFilters, setShowMaterialFilters] = useState(false);
  const [materialTypeFilter, setMaterialTypeFilter] = useState('all');
  const [materialStatusFilter, setMaterialStatusFilter] = useState('all');
  const [materialGroupBy, setMaterialGroupBy] = useState<'week' | 'type' | 'none'>('week');

  // Determine item type from pathname for detail views
  const pathname = location.pathname;
  let itemType: 'assignment' | 'lesson' | 'announcement' | null = null;
  if (pathname.includes('/assignment/')) {
    itemType = 'assignment';
  } else if (pathname.includes('/lesson/')) {
    itemType = 'lesson';
  } else if (pathname.includes('/announcement/')) {
    itemType = 'announcement';
  }

  // Check if we're viewing a detail page
  const isDetailView = itemId && itemType !== null;

  // Derive active tab from URL parameter
  const activeTab = isDetailView ? 'timeline' : ((tab as TabType) || 'overview');

  // Validate that the tab is a valid TabType
  const validTabs: TabType[] = ['overview', 'timeline', 'grades', 'assignments', 'materials', 'announcements'];
  const isValidTab = isDetailView || validTabs.includes(activeTab);

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  // Helper function to expand recurring events into multiple occurrences
  const expandRecurringEvent = (event: any): any[] => {
    if (!event.is_recurring || !event.recurrence_rule || !event.recurrence_end_date) {
      return [event]; // Return as-is if not recurring
    }

    const occurrences: any[] = [];
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    const recurrenceEndDate = new Date(event.recurrence_end_date);
    const duration = endDate.getTime() - startDate.getTime();

    let currentDate = new Date(startDate);
    let occurrenceNumber = 0;

    while (currentDate <= recurrenceEndDate) {
      // Create a new occurrence
      const occurrenceStart = new Date(currentDate);
      const occurrenceEnd = new Date(currentDate.getTime() + duration);

      // Remove "Week X" from the title
      let updatedTitle = event.title;
      if (updatedTitle) {
        updatedTitle = updatedTitle.replace(/\s*-?\s*Week \d+/i, '');
      }

      occurrences.push({
        ...event,
        // Generate unique ID for each occurrence
        id: `${event.id}-occurrence-${occurrenceNumber}`,
        title: updatedTitle,
        start_time: occurrenceStart.toISOString(),
        end_time: occurrenceEnd.toISOString(),
        // Keep original event ID for navigation
        original_event_id: event.id
      });

      occurrenceNumber++;

      // Calculate next occurrence based on recurrence rule
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
          // Unknown recurrence rule, break the loop
          currentDate = new Date(recurrenceEndDate.getTime() + 1);
      }
    }

    return occurrences;
  };

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('course')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch enrollment for final grade
      const { data: enrollment } = await supabase
        .from('course_enrollments')
        .select('final_grade, grade_letter')
        .eq('course_id', id)
        .single();

      if (enrollment) {
        setFinalGrade(enrollment.final_grade);
      }

      // Fetch assignments with submissions
      const { data: assignmentsData, error: assignError } = await supabase
        .from('assignment')
        .select('*')
        .eq('course_id', id)
        .eq('published', true);

      if (assignError) throw assignError;

      const assignmentIds = assignmentsData?.map(a => a.id) || [];
      const { data: submissions } = await supabase
        .from('submission')
        .select('*')
        .in('assignment_id', assignmentIds);

      const assignmentsWithSubmissions = (assignmentsData || []).map(assignment => {
        const submission = submissions?.find(s => s.assignment_id === assignment.id);
        return {
          ...assignment,
          submission
        };
      });

      setAssignments(assignmentsWithSubmissions);

      // Calculate current grade
      const gradedAssignments = assignmentsWithSubmissions.filter(
        a => a.submission?.grade != null
      );

      if (gradedAssignments.length > 0) {
        const totalWeight = gradedAssignments.reduce((sum, a) => sum + (a.weight || 0), 0);
        const weightedSum = gradedAssignments.reduce(
          (sum, a) => sum + ((a.submission?.grade || 0) / a.max_points) * (a.weight || 0),
          0
        );
        setCurrentGrade(totalWeight > 0 ? (weightedSum / totalWeight) * 100 : null);
      }

      // Fetch materials with full details
      const { data: materialsData } = await supabase
        .from('course_materials')
        .select(`
          *,
          material (*)
        `)
        .eq('course_id', id)
        .order('order', { ascending: true });

      // Transform materials data to match our interface
      const transformedMaterials = (materialsData || []).map((cm: any) => ({
        id: cm.id,
        course_id: cm.course_id,
        material_id: cm.material_id,
        required: cm.required || false,
        order: cm.order,
        material: cm.material,
        week: cm.week || 0, // Add week assignment if available in DB
        accessed: false, // TODO: Fetch from user progress tracking table
        last_accessed: null,
        // Spread material properties to top level for compatibility
        ...cm.material
      }));

      setMaterials(transformedMaterials as Material[]);

      // Fetch announcements with author details
      const { data: announcementsData } = await supabase
        .from('announcement')
        .select(`
          *,
          author:user!author_id(first_name, last_name)
        `)
        .eq('course_id', id)
        .eq('published', true)
        .order('published_at', { ascending: false });

      setAnnouncements(announcementsData || []);

      // Fetch lessons and events for timeline
      const { data: lessonsData } = await supabase
        .from('lesson')
        .select(`
          *,
          room:room_id (
            name,
            facility:facility_id (
              name
            )
          )
        `)
        .eq('course_id', id);

      const lessonIds = lessonsData?.map(l => l.id) || [];
      const { data: eventsData } = await supabase
        .from('event')
        .select('*')
        .in('lesson_id', lessonIds)
        .order('start_time', { ascending: true });

      // Build timeline items from events and assignments
      const timeline: TimelineItem[] = [];

      // Add events with their lesson info (expanding recurring events)
      if (eventsData && lessonsData) {
        eventsData.forEach(event => {
          const lesson = lessonsData.find(l => l.id === event.lesson_id);
          if (lesson) {
            // Expand recurring events into multiple occurrences
            const eventOccurrences = expandRecurringEvent(event);

            eventOccurrences.forEach(occurrence => {
              timeline.push({
                id: occurrence.id, // Will be unique for each occurrence
                type: 'lesson',
                title: occurrence.title || lesson.title,
                date: occurrence.start_time,
                endDate: occurrence.end_time,
                description: occurrence.description || lesson.description,
                lessonType: lesson.type,
                isOnline: occurrence.is_online,
                status: occurrence.status,
                roomName: lesson.room?.name,
                facilityName: lesson.room?.facility?.name
              });
            });
          }
        });
      }

      // Add assignments
      if (assignmentsData) {
        assignmentsData.forEach(assignment => {
          if (assignment.due_date) {
            timeline.push({
              id: assignment.id,
              type: 'assignment',
              title: assignment.title,
              date: assignment.due_date,
              description: assignment.description,
              assignmentType: assignment.type,
              dueDate: assignment.due_date,
              maxPoints: assignment.max_points,
              submissionType: assignment.submission_type
            });
          }
        });
      }

      // Sort timeline by date
      timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setTimelineItems(timeline);

    } catch (error) {
      console.error('Error fetching course data:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCompactDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
  };

  const toggleExpand = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to detail page
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSubmit = (assignmentId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    setSubmittedAssignments(prev => {
      const newSet = new Set(prev);
      newSet.add(assignmentId);
      return newSet;
    });
  };

  const handleMaterialAccess = (materialId: string) => {
    // Mark material as accessed
    setMaterials(prev => prev.map(m =>
      m.id === materialId ? { ...m, accessed: true, last_accessed: new Date().toISOString() } : m
    ));
    // In a real app, you'd also update this in the database
  };

  const handleMaterialMarkAsRead = (materialId: string) => {
    // Mark material as read/accessed
    setMaterials(prev => prev.map(m =>
      m.id === materialId ? { ...m, accessed: true, last_accessed: new Date().toISOString() } : m
    ));
    // In a real app, you'd also update this in the database
  };

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading course details...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
          <div>Course not found</div>
        </div>
      </div>
    );
  }

  // Redirect to overview if no tab or invalid tab (but not for detail views)
  if (!isDetailView && (!tab || !isValidTab)) {
    return <Navigate to={`/course/${id}/overview`} replace />;
  }

  // Show detail view if viewing a specific item
  if (isDetailView && itemId && itemType) {
    let item: any = null;

    if (itemType === 'assignment') {
      item = assignments.find(a => a.id === itemId);
    } else if (itemType === 'lesson') {
      const timelineItem = timelineItems.find(ti => ti.type === 'lesson' && ti.id === itemId);
      if (timelineItem) {
        item = timelineItem;
      }
    } else if (itemType === 'announcement') {
      item = announcements.find(a => a.id === itemId);
    }

    return (
      <div className="course-detail-page">
        <button className="back-button" onClick={() => navigate(`/course/${id}/timeline`)}>
          ← Back to Timeline
        </button>

        <div className="course-detail-header">
          <div className="course-detail-title-section">
            <h1 className="course-detail-code">{course.code}</h1>
            <h2 className="course-detail-title">{course.title}</h2>
          </div>
        </div>

        <div className="course-detail-content">
          {item ? (
            <div className="item-detail-view">
              <div className="item-detail-header">
                <div className="item-detail-type-badge">
                  {itemType === 'assignment' && (
                    <>
                      {item.type === 'homework' && '📝 Homework'}
                      {item.type === 'essay' && '📄 Essay'}
                      {item.type === 'project' && '🚀 Project'}
                      {item.type === 'exam' && '📝 Exam'}
                      {item.type === 'quiz' && '❓ Quiz'}
                      {item.type === 'presentation' && '🎤 Presentation'}
                      {item.type === 'preparation' && '📖 Preparation'}
                    </>
                  )}
                  {itemType === 'lesson' && (
                    <>
                      {item.lessonType === 'lecture' && '📚 Lecture'}
                      {item.lessonType === 'seminar' && '💬 Seminar'}
                      {item.lessonType === 'tutorial' && '👨‍🏫 Tutorial'}
                      {item.lessonType === 'lab' && '🔬 Lab'}
                      {item.lessonType === 'workshop' && '🛠️ Workshop'}
                      {item.lessonType === 'exam' && '📝 Exam'}
                    </>
                  )}
                  {itemType === 'announcement' && '📢 Announcement'}
                </div>
                <h1 className="item-detail-title">{item.title}</h1>
              </div>

              <div className="item-detail-body">
                {itemType === 'assignment' && (
                  <>
                    <div className="item-detail-section">
                      <h3>Assignment Details</h3>
                      <p className="item-detail-description">{item.description || 'No description provided.'}</p>
                      <div className="item-detail-meta">
                        {item.due_date && (
                          <div className="meta-row">
                            <span className="meta-label">Due Date:</span>
                            <span className="meta-value">{formatDateTime(item.due_date)}</span>
                          </div>
                        )}
                        {item.max_points && (
                          <div className="meta-row">
                            <span className="meta-label">Max Points:</span>
                            <span className="meta-value">{item.max_points}</span>
                          </div>
                        )}
                        {item.weight && (
                          <div className="meta-row">
                            <span className="meta-label">Weight:</span>
                            <span className="meta-value">{(item.weight * 100).toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {item.submission && (
                      <div className="item-detail-section">
                        <h3>Your Submission</h3>
                        <div className="submission-status-display">
                          <span className={`status-badge ${item.submission.status}`}>
                            {item.submission.status}
                          </span>
                          {item.submission.grade != null && (
                            <div className="grade-large">
                              {item.submission.grade} / {item.max_points}
                            </div>
                          )}
                        </div>
                        {item.submission.feedback && (
                          <div className="feedback-display">
                            <h4>Feedback:</h4>
                            <p>{item.submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {itemType === 'lesson' && (
                  <div className="item-detail-section">
                    <h3>Lesson Details</h3>
                    <p className="item-detail-description">{item.description || 'No description provided.'}</p>
                    <div className="item-detail-meta">
                      <div className="meta-row">
                        <span className="meta-label">Date & Time:</span>
                        <span className="meta-value">
                          {formatDateTime(item.date)} - {formatTime(item.endDate)}
                        </span>
                      </div>
                      {item.isOnline && (
                        <div className="meta-row">
                          <span className="meta-label">Format:</span>
                          <span className="meta-value">🌐 Online</span>
                        </div>
                      )}
                      {item.status && (
                        <div className="meta-row">
                          <span className="meta-label">Status:</span>
                          <span className={`meta-value status-${item.status}`}>{item.status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {itemType === 'announcement' && (
                  <div className="item-detail-section">
                    <h3>Announcement</h3>
                    <p className="item-detail-description">{item.content}</p>
                    <div className="item-detail-meta">
                      <div className="meta-row">
                        <span className="meta-label">Posted:</span>
                        <span className="meta-value">{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state-small">
              <div className="empty-icon-small">❌</div>
              <div className="empty-text">Item not found</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      <button className="back-button" onClick={() => navigate('/courses/all_courses')}>
        ← Back to Courses
      </button>

      <div className="course-detail-header">
        <div className="course-detail-title-section">
          <h1 className="course-detail-code">{course.code}</h1>
          <h2 className="course-detail-title">{course.title}</h2>
          <div className="course-detail-meta">
            <span className="meta-item">👨‍🏫 {course.instructor}</span>
            <span className="meta-item">📚 {course.ects} ECTS</span>
            {course.schedule && <span className="meta-item">🕐 {course.schedule}</span>}
          </div>
        </div>
      </div>

      <div className="course-detail-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => navigate(`/course/${id}/overview`)}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => navigate(`/course/${id}/timeline`)}
        >
          Timeline
        </button>
        <button
          className={`tab-button ${activeTab === 'grades' ? 'active' : ''}`}
          onClick={() => navigate(`/course/${id}/grades`)}
        >
          Grades
        </button>
        <button
          className={`tab-button ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => navigate(`/course/${id}/assignments`)}
        >
          Assignments
        </button>
        <button
          className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => navigate(`/course/${id}/materials`)}
        >
          Materials
        </button>
        <button
          className={`tab-button ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => navigate(`/course/${id}/announcements`)}
        >
          Announcements
        </button>
      </div>

      <div className="course-detail-content">
        {activeTab === 'overview' && (
          <div className="tab-content">
            {(() => {
              const now = new Date();

              // Get upcoming timeline items (next 5)
              const upcomingItems = timelineItems
                .filter(item => new Date(item.date) > now)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5);

              // Calculate weighted GPA
              const gradedAssignments = assignments.filter(a => a.submission?.grade != null);
              const totalWeight = assignments.reduce((sum, a) => sum + (a.weight || 0), 0);
              const gradedWeight = gradedAssignments.reduce((sum, a) => sum + (a.weight || 0), 0);
              const weightedGPA = gradedAssignments.length > 0
                ? gradedAssignments.reduce((sum, a) => {
                    const percentage = (a.submission!.grade! / a.max_points) * 100;
                    const gradePoint = percentage / 10; // Convert to 10-point scale
                    return sum + (gradePoint * (a.weight || 0));
                  }, 0) / gradedWeight
                : null;
              const weightProgress = totalWeight > 0 ? (gradedWeight / totalWeight) * 100 : 0;

              // Get pending assignments (upcoming + not submitted)
              const pendingAssignments = assignments
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

              return (
                <div className="dashboard-grid">
                  {/* Timeline Widget */}
                  <div className="dashboard-widget timeline-widget">
                    <div className="widget-header">
                      <h3 className="widget-title">Upcoming Timeline</h3>
                      <button
                        className="widget-link-btn"
                        onClick={() => navigate(`/course/${id}/timeline`)}
                      >
                        View All →
                      </button>
                    </div>
                    <div className="widget-body">
                      {upcomingItems.length === 0 ? (
                        <div className="widget-empty">
                          <div className="widget-empty-icon">✅</div>
                          <div className="widget-empty-text">No upcoming events</div>
                        </div>
                      ) : (
                        <div className="compact-timeline-list">
                          {upcomingItems.map(item => (
                            <div
                              key={`${item.type}-${item.id}`}
                              className="compact-timeline-item"
                              onClick={() => {
                                if (item.type === 'lesson') {
                                  navigate(`/course/${id}/lesson/${item.id}`);
                                } else {
                                  navigate(`/course/${id}/assignment/${item.id}`);
                                }
                              }}
                            >
                              <div className={`compact-item-marker ${item.type}`}></div>
                              <div className="compact-item-content">
                                <div className="compact-item-title">{item.title}</div>
                                <div className="compact-item-meta">
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
                        onClick={() => navigate(`/course/${id}/grades`)}
                      >
                        View All →
                      </button>
                    </div>
                    <div className="widget-body centered">
                      {weightedGPA !== null ? (
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
                              <div className={`gpa-value ${getGradeClass(weightedGPA)}`}>
                                {weightedGPA.toFixed(2)}
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
                              <span className="gpa-detail-label">Assignments Graded:</span>
                              <span className="gpa-detail-value">{gradedAssignments.length} / {assignments.length}</span>
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
                        onClick={() => navigate(`/course/${id}/assignments`)}
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
                              key={assignment.id}
                              className="compact-assignment-item"
                              onClick={() => navigate(`/course/${id}/assignment/${assignment.id}`)}
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
              );
            })()}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="tab-content">
            <div className="timeline-layout">
              {/* Left column: Mini map */}
              <div className="timeline-minimap">
                <h3 className="minimap-title">Course Structure</h3>
                <div className="minimap-sections">
                  {timelineItems.length > 0 && (
                    <>
                      {(() => {
                        const now = new Date();
                        const weeks = new Map<number, TimelineItem[]>();

                        // Find the earliest date to use as Week 1 reference
                        const earliestDate = timelineItems.length > 0
                          ? new Date(Math.min(...timelineItems.map(item => new Date(item.date).getTime())))
                          : now;

                        // Group items by week relative to course start
                        timelineItems.forEach(item => {
                          const itemDate = new Date(item.date);
                          // Calculate week number relative to the earliest date
                          const daysDiff = Math.floor((itemDate.getTime() - earliestDate.getTime()) / (24 * 60 * 60 * 1000));
                          const weekNum = Math.floor(daysDiff / 7) + 1; // Week 1, 2, 3, etc.

                          if (!weeks.has(weekNum)) weeks.set(weekNum, []);
                          weeks.get(weekNum)!.push(item);
                        });

                        return Array.from(weeks.entries()).sort(([a], [b]) => a - b).map(([week, items]) => (
                          <div key={week} className="minimap-week">
                            <div className="minimap-week-label">Week {week}</div>
                            <div className="minimap-items">
                              {items.map(item => (
                                <div
                                  key={`${item.type}-${item.id}`}
                                  className={`minimap-item ${item.type}`}
                                  onClick={() => {
                                    const element = document.getElementById(`timeline-item-${item.type}-${item.id}`);
                                    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }}
                                >
                                  <div className="minimap-item-dot"></div>
                                  <div className="minimap-item-label">
                                    {item.title}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </>
                  )}
                </div>
              </div>

              {/* Right column: Timeline */}
              <div className="timeline-main">
                {timelineItems.length === 0 ? (
                  <div className="empty-state-small">
                    <div className="empty-icon-small">📅</div>
                    <div className="empty-text">No upcoming activities</div>
                  </div>
                ) : (
                  <div className="timeline-container">
                    {(() => {
                      const now = new Date();
                      const weeks = new Map<number, TimelineItem[]>();

                      // Find the earliest date to use as Week 1 reference
                      const earliestDate = timelineItems.length > 0
                        ? new Date(Math.min(...timelineItems.map(item => new Date(item.date).getTime())))
                        : now;

                      // Group items by week relative to course start
                      timelineItems.forEach(item => {
                        const itemDate = new Date(item.date);
                        // Calculate week number relative to the earliest date
                        const daysDiff = Math.floor((itemDate.getTime() - earliestDate.getTime()) / (24 * 60 * 60 * 1000));
                        const weekNum = Math.floor(daysDiff / 7) + 1; // Week 1, 2, 3, etc.

                        if (!weeks.has(weekNum)) weeks.set(weekNum, []);
                        weeks.get(weekNum)!.push(item);
                      });

                      return Array.from(weeks.entries()).sort(([a], [b]) => a - b).map(([week, items]) => (
                        <div key={week}>
                          <div className="timeline-week-badge">Week {week}</div>
                          {items.map((item) => {
                            const isExpanded = expandedItems.has(item.id);
                            const isPast = new Date(item.date) < now;
                            return (
                              <div
                                key={`${item.type}-${item.id}`}
                                id={`timeline-item-${item.type}-${item.id}`}
                                className="timeline-item"
                              >
                          <div
                            className={`timeline-item-card ${item.type} ${isExpanded ? 'expanded' : ''} ${isPast ? 'past' : ''}`}
                            onClick={() => {
                              if (item.type === 'lesson') {
                                toggleExpand(item.id, { stopPropagation: () => {} } as React.MouseEvent);
                              } else {
                                navigate(`/course/${id}/${item.type}/${item.id}`);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="timeline-item-header-row">
                              <div className="timeline-item-main-content">
                                {/* Metadata row at top */}
                                <div className="timeline-item-metadata">
                                  {item.type === 'lesson' ? (
                                    <>
                                      <span className="timeline-item-type-badge">
                                        {item.lessonType === 'lecture' && '📚 LECTURE'}
                                        {item.lessonType === 'seminar' && '💬 SEMINAR'}
                                        {item.lessonType === 'tutorial' && '👨‍🏫 TUTORIAL'}
                                        {item.lessonType === 'lab' && '🔬 LAB'}
                                        {item.lessonType === 'workshop' && '🛠️ WORKSHOP'}
                                        {item.lessonType === 'exam' && '📝 EXAM'}
                                      </span>
                                      <span className="meta-separator">•</span>
                                      <span>{formatCompactDate(item.date)}, {formatTime(item.date)}-{formatTime(item.endDate!)}</span>
                                      {item.facilityName && (
                                        <>
                                          <span className="meta-separator">•</span>
                                          <span>{item.facilityName}</span>
                                        </>
                                      )}
                                      {item.roomName && (
                                        <>
                                          <span className="meta-separator">•</span>
                                          <span>Room {item.roomName}</span>
                                        </>
                                      )}
                                      {item.isOnline && (
                                        <>
                                          <span className="meta-separator">•</span>
                                          <span>🌐 Online</span>
                                        </>
                                      )}
                                      {item.status === 'cancelled' && (
                                        <>
                                          <span className="meta-separator">•</span>
                                          <span className="status-cancelled">CANCELLED</span>
                                        </>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <span className="timeline-item-type-badge">
                                        {item.assignmentType === 'homework' && '📝'}
                                        {item.assignmentType === 'essay' && '📄'}
                                        {item.assignmentType === 'project' && '🚀'}
                                        {item.assignmentType === 'exam' && '📝'}
                                        {item.assignmentType === 'quiz' && '❓'}
                                        {item.assignmentType === 'presentation' && '🎤'}
                                        {item.assignmentType === 'preparation' && '📖'}
                                        {' '}
                                        {item.assignmentType?.toUpperCase()}
                                      </span>
                                      <span className="meta-separator">•</span>
                                      <span>DUE {formatCompactDate(item.date)}</span>
                                      {item.maxPoints && (
                                        <>
                                          <span className="meta-separator">•</span>
                                          <span>{item.maxPoints} points</span>
                                        </>
                                      )}
                                      {item.submissionType === 'no_submission' && (
                                        <>
                                          <span className="meta-separator">•</span>
                                          <span>NO submission</span>
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>

                                {/* Title */}
                                <h4 className="timeline-item-title">{item.title}</h4>
                              </div>

                              {/* Action buttons on the right */}
                              <div className="timeline-item-actions">
                                {item.type === 'assignment' && item.submissionType !== 'no_submission' && (
                                  <button
                                    className={`action-btn ${submittedAssignments.has(item.id) ? 'primary' : ''}`}
                                    onClick={(e) => handleSubmit(item.id, e)}
                                  >
                                    <div className="action-btn-icon">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                      </svg>
                                    </div>
                                    <span>{submittedAssignments.has(item.id) ? 'SUBMITTED' : 'SUBMIT'}</span>
                                  </button>
                                )}
                                {item.type === 'lesson' && (
                                  <button
                                    className="expand-btn"
                                    onClick={(e) => toggleExpand(item.id, e)}
                                  >
                                    <div className="expand-icon">
                                      {isExpanded ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M18 15L12 9L6 15" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M6 9L12 15L18 9" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      )}
                                    </div>
                                    <span>{isExpanded ? 'COLLAPSE' : 'EXPAND'}</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Expanded content */}
                            {isExpanded && item.type === 'lesson' && (
                              <div className="timeline-item-expanded">
                                {/* Description */}
                                {item.description && (
                                  <p className="timeline-item-description">{item.description}</p>
                                )}

                                {/* Professor info - placeholder for now */}
                                <div className="timeline-item-instructor">
                                  <div className="instructor-avatar">👤</div>
                                  <div className="instructor-info">
                                    <div className="instructor-name">Professor Name</div>
                                    <div className="instructor-department">FACULTY OF DEPARTMENT</div>
                                  </div>
                                </div>

                                {/* Quick action buttons */}
                                <div className="timeline-quick-actions">
                                  <button className="quick-action-btn" onClick={(e) => e.stopPropagation()}>
                                    <div className="quick-action-icon">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                      </svg>
                                    </div>
                                    <span>SLIDES</span>
                                  </button>
                                  <button className="quick-action-btn" onClick={(e) => e.stopPropagation()}>
                                    <div className="quick-action-icon">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                      </svg>
                                    </div>
                                    <span>READINGS</span>
                                  </button>
                                  <button className="quick-action-btn" onClick={(e) => e.stopPropagation()}>
                                    <div className="quick-action-icon">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                      </svg>
                                    </div>
                                    <span>NOTES</span>
                                  </button>
                                  <button className="quick-action-btn" onClick={(e) => e.stopPropagation()}>
                                    <div className="quick-action-icon">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                      </svg>
                                    </div>
                                    <span>RECORDING</span>
                                  </button>
                                  <button className="quick-action-btn" onClick={(e) => e.stopPropagation()}>
                                    <div className="quick-action-icon">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                      </svg>
                                    </div>
                                    <span>PREPARATIONS</span>
                                  </button>
                                  <button
                                    className="quick-action-btn primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/course/${id}/lesson/${item.id}`);
                                    }}
                                  >
                                    <div className="quick-action-icon">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                                      </svg>
                                    </div>
                                    <span>LESSON PANEL</span>
                                  </button>
                                  <button className="quick-action-btn primary" onClick={(e) => e.stopPropagation()}>
                                    <div className="quick-action-icon">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                      </svg>
                                    </div>
                                    <span>ATTENDANCE</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="tab-content">
            {/* Grade Composition Table */}
            {(() => {
              // Group assignments by type
              const categories = new Map<string, typeof assignments>();
              assignments.forEach(assignment => {
                const type = assignment.type;
                if (!categories.has(type)) {
                  categories.set(type, []);
                }
                categories.get(type)!.push(assignment);
              });

              const now = new Date();

              const getAssignmentStatus = (assignment: typeof assignments[0]) => {
                if (assignment.submission?.grade != null) return 'graded';
                if (assignment.submission?.status === 'submitted') return 'submitted';
                if (assignment.due_date && new Date(assignment.due_date) < now) return 'overdue';
                return 'upcoming';
              };

              // Calculate totals
              const totalWeight = assignments.reduce((sum, a) => sum + (a.weight || 0), 0);
              const gradedAssignments = assignments.filter(a => a.submission?.grade != null);
              const gradedWeight = gradedAssignments.reduce((sum, a) => sum + (a.weight || 0), 0);
              const weightedSum = gradedAssignments.reduce(
                (sum, a) => sum + ((a.submission!.grade! / a.max_points) * (a.weight || 0)),
                0
              );
              const weightedGPA = gradedWeight > 0 ? (weightedSum / gradedWeight) * 10 : null;
              const weightProgress = totalWeight > 0 ? (gradedWeight / totalWeight) * 100 : 0;

              return (
                <>
                  <h3 className="section-heading">Grade Composition</h3>

                  <div className="grade-composition-layout">
                    {/* Left: Tables */}
                    <div className="grade-composition-table-container">
                      {Array.from(categories.entries()).map(([type, items]) => {
                        const categoryWeight = items.reduce((sum, a) => sum + (a.weight || 0), 0);
                        const gradedItems = items.filter(a => a.submission?.grade != null);
                        const categoryGradedWeight = gradedItems.reduce((sum, a) => sum + (a.weight || 0), 0);

                        const weightedSum = gradedItems.reduce(
                          (sum, a) => sum + ((a.submission!.grade! / a.max_points) * (a.weight || 0)),
                          0
                        );
                        const categoryAvg = categoryGradedWeight > 0 ? (weightedSum / categoryGradedWeight) * 10 : null;

                        return (
                          <div key={type} className="category-table">
                            <div className="category-table-header">
                              <h4>{type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                              <div className="category-summary">
                                <span>Weight: {(categoryWeight * 100).toFixed(0)}%</span>
                                <span>•</span>
                                <span>Graded: {gradedItems.length}/{items.length}</span>
                                {categoryAvg !== null && (
                                  <>
                                    <span>•</span>
                                    <span>Average: {categoryAvg.toFixed(1)}/10</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <table className="assignments-table">
                              <thead>
                                <tr>
                                  <th className="col-assignment">Assignment</th>
                                  <th className="col-weight">Weight</th>
                                  <th className="col-due">Due Date</th>
                                  <th className="col-status">Status</th>
                                  <th className="col-score">Score</th>
                                  <th className="col-contribution">Contribution</th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.map((assignment) => {
                                  const status = getAssignmentStatus(assignment);
                                  const contribution = assignment.submission?.grade != null
                                    ? (((assignment.submission.grade / assignment.max_points) * assignment.weight) * 10)
                                    : 0;
                                  const maxContribution = assignment.weight * 10;

                                  return (
                                    <tr
                                      key={assignment.id}
                                      onClick={() => navigate(`/course/${id}/assignment/${assignment.id}`)}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <td className="col-assignment">{assignment.title}</td>
                                      <td className="col-weight">{(assignment.weight * 100).toFixed(0)}%</td>
                                      <td className="col-due">
                                        {assignment.due_date ? formatDate(assignment.due_date) : 'N/A'}
                                      </td>
                                      <td className="col-status">
                                        <span className={`status-badge-table ${status}`}>
                                          {status}
                                        </span>
                                      </td>
                                      <td className="col-score">
                                        {assignment.submission?.grade != null
                                          ? `${assignment.submission.grade}/${assignment.max_points}`
                                          : '—'}
                                      </td>
                                      <td className="col-contribution">
                                        {contribution.toFixed(2)}/{maxContribution.toFixed(2)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: Total Summary Widget */}
                    <div className="grade-total-widget">
                      <div className="grade-total-header">
                        <h4>SUMMARY</h4>
                      </div>

                      {weightedGPA !== null ? (
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
                              <div className={`gpa-value ${getGradeClass(weightedGPA)}`}>
                                {weightedGPA.toFixed(2)}
                              </div>
                              <div className="gpa-label">CURRENT</div>
                            </div>
                          </div>

                          <div className="grade-total-table">
                            <table className="total-summary-table">
                              <thead>
                                <tr>
                                  <th>Category</th>
                                  <th>Weight</th>
                                  <th>Contribution</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Array.from(categories.entries()).map(([type, items]) => {
                                  const categoryWeight = items.reduce((sum, a) => sum + (a.weight || 0), 0);
                                  const gradedItems = items.filter(a => a.submission?.grade != null);
                                  const weightedSum = gradedItems.reduce(
                                    (sum, a) => sum + ((a.submission!.grade! / a.max_points) * (a.weight || 0)),
                                    0
                                  );
                                  const contribution = weightedSum * 10;
                                  const maxContribution = categoryWeight * 10;

                                  return (
                                    <tr key={type}>
                                      <td>{type.charAt(0).toUpperCase() + type.slice(1)}</td>
                                      <td>{(categoryWeight * 100).toFixed(0)}%</td>
                                      <td>{contribution.toFixed(2)}/{maxContribution.toFixed(2)}</td>
                                    </tr>
                                  );
                                })}
                                <tr className="total-row">
                                  <td>TOTAL</td>
                                  <td>{(totalWeight * 100).toFixed(0)}%</td>
                                  <td>{(weightedSum * 10).toFixed(2)}/10.00</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <div className="grade-stats-list">
                            <div className="grade-stat-item">
                              <span className="stat-item-label">Graded Weight</span>
                              <span className="stat-item-value">{weightProgress.toFixed(0)}%</span>
                            </div>
                            <div className="grade-stat-item">
                              <span className="stat-item-label">Assignments Graded</span>
                              <span className="stat-item-value">{gradedAssignments.length}/{assignments.length}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="widget-empty">
                          <div className="widget-empty-text">No grades yet</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="tab-content">
            <div className="assignments-list">
              {assignments.length === 0 ? (
                <div className="empty-state-small">
                  <div className="empty-icon-small">📝</div>
                  <div className="empty-text">No assignments yet</div>
                </div>
              ) : (
                assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="assignment-detail-card"
                    onClick={() => navigate(`/course/${id}/assignment/${assignment.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Metadata row */}
                    <div className="assignment-detail-meta">
                      <span className="assignment-type-badge">
                        {assignment.type === 'homework' && '📝'}
                        {assignment.type === 'essay' && '📄'}
                        {assignment.type === 'project' && '🚀'}
                        {assignment.type === 'exam' && '📝'}
                        {assignment.type === 'quiz' && '❓'}
                        {assignment.type === 'presentation' && '🎤'}
                        {assignment.type === 'preparation' && '📖'}
                        {' '}
                        {assignment.type.toUpperCase()}
                      </span>
                      <span className="meta-separator">•</span>
                      <span>{assignment.max_points} points</span>
                      <span className="meta-separator">•</span>
                      <span>Weight: {(assignment.weight * 100).toFixed(0)}%</span>
                      {assignment.due_date && (
                        <>
                          <span className="meta-separator">•</span>
                          <span className="due-date">Due {formatDate(assignment.due_date)}</span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="assignment-detail-title">{assignment.title}</h4>

                    {/* Submission info if available */}
                    {assignment.submission && (
                      <div className="submission-info">
                        <div className="submission-status">
                          Status: <span className={`status-text ${assignment.submission.status}`}>
                            {assignment.submission.status}
                          </span>
                        </div>
                        {assignment.submission.grade != null && (
                          <div className="submission-grade">
                            Grade: {assignment.submission.grade} / {assignment.max_points}
                          </div>
                        )}
                        {assignment.submission.feedback && (
                          <div className="submission-feedback">
                            <div className="feedback-label">Feedback:</div>
                            <div className="feedback-text">{assignment.submission.feedback}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="tab-content materials-tab-content">
            {/* Search and Progress Bar */}
            <div className="materials-header-section">
              <div className="materials-search-bar">
                <input
                  type="text"
                  placeholder="🔍 Search materials..."
                  className="materials-search-input"
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                />
                <button className="materials-filter-toggle-btn" onClick={() => setShowMaterialFilters(!showMaterialFilters)}>
                  🎯 Filters {showMaterialFilters ? '▲' : '▼'}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="materials-progress-section">
                <div className="materials-progress-label">
                  📊 Progress: {materials.filter(m => m.accessed).length}/{materials.length} materials accessed
                </div>
                <div className="materials-progress-bar">
                  <div
                    className="materials-progress-fill"
                    style={{ width: `${materials.length > 0 ? (materials.filter(m => m.accessed).length / materials.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            {showMaterialFilters && (
              <div className="materials-filters-section">
                <div className="filter-row">
                  <div className="filter-group">
                    <label className="filter-label">Type:</label>
                    <select
                      className="filter-select"
                      value={materialTypeFilter}
                      onChange={(e) => setMaterialTypeFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="book">Books</option>
                      <option value="video">Videos</option>
                      <option value="article">Articles</option>
                      <option value="research_paper">Research Papers</option>
                      <option value="slides">Slides</option>
                      <option value="dataset">Datasets</option>
                      <option value="software">Software</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Status:</label>
                    <select
                      className="filter-select"
                      value={materialStatusFilter}
                      onChange={(e) => setMaterialStatusFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="required">Required Only</option>
                      <option value="optional">Optional Only</option>
                      <option value="accessed">Accessed</option>
                      <option value="not_accessed">Not Accessed</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Group by:</label>
                    <select
                      className="filter-select"
                      value={materialGroupBy}
                      onChange={(e) => setMaterialGroupBy(e.target.value as 'week' | 'type' | 'none')}
                    >
                      <option value="week">By Week</option>
                      <option value="type">By Type</option>
                      <option value="none">No Grouping</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Materials List */}
            <div className="materials-content-area">
              {materials.length === 0 ? (
                <div className="empty-state-small">
                  <div className="empty-icon-small">📄</div>
                  <div className="empty-text">No materials yet</div>
                </div>
              ) : (
                (() => {
                  // Filter materials
                  let filteredMaterials = materials.filter(material => {
                    // Search filter
                    if (materialSearch &&
                        !material.material.title.toLowerCase().includes(materialSearch.toLowerCase()) &&
                        !material.material.description?.toLowerCase().includes(materialSearch.toLowerCase())) {
                      return false;
                    }

                    // Type filter
                    if (materialTypeFilter !== 'all' && material.material.type !== materialTypeFilter) {
                      return false;
                    }

                    // Status filter
                    if (materialStatusFilter === 'required' && !material.required) return false;
                    if (materialStatusFilter === 'optional' && material.required) return false;
                    if (materialStatusFilter === 'accessed' && !material.accessed) return false;
                    if (materialStatusFilter === 'not_accessed' && material.accessed) return false;

                    return true;
                  });

                  if (filteredMaterials.length === 0) {
                    return (
                      <div className="empty-state-small">
                        <div className="empty-icon-small">🔍</div>
                        <div className="empty-text">No materials match your filters</div>
                      </div>
                    );
                  }

                  // Group materials
                  if (materialGroupBy === 'week') {
                    const grouped = new Map<number, typeof filteredMaterials>();

                    filteredMaterials.forEach(material => {
                      const weekNum = material.week || 0;
                      if (!grouped.has(weekNum)) grouped.set(weekNum, []);
                      grouped.get(weekNum)!.push(material);
                    });

                    return Array.from(grouped.entries())
                      .sort(([a], [b]) => a - b)
                      .map(([week, materials]) => (
                        <div key={week} className="materials-group">
                          <h3 className="materials-group-header">
                            {week === 0 ? '📚 General Resources' : `📅 Week ${week}`}
                          </h3>
                          {materials.map((material) => (
                            <div key={material.id} className="material-card-wrapper">
                              <MaterialCard
                                courseMaterial={material}
                                courseId={id || ''}
                                onAccess={handleMaterialAccess}
                                onMarkAsRead={handleMaterialMarkAsRead}
                              />
                            </div>
                          ))}
                        </div>
                      ));
                  } else if (materialGroupBy === 'type') {
                    const grouped = new Map<string, typeof filteredMaterials>();

                    filteredMaterials.forEach(material => {
                      const type = material.material.type;
                      if (!grouped.has(type)) grouped.set(type, []);
                      grouped.get(type)!.push(material);
                    });

                    return Array.from(grouped.entries())
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([type, materials]) => (
                        <div key={type} className="materials-group">
                          <h3 className="materials-group-header">
                            {type === 'book' && '📖 Books'}
                            {type === 'video' && '🎥 Videos'}
                            {type === 'article' && '📄 Articles'}
                            {type === 'research_paper' && '📑 Research Papers'}
                            {type === 'slides' && '📊 Slides'}
                            {type === 'dataset' && '💾 Datasets'}
                            {type === 'software' && '💻 Software'}
                          </h3>
                          {materials.map((material) => (
                            <div key={material.id} className="material-card-wrapper">
                              <MaterialCard
                                courseMaterial={material}
                                courseId={id || ''}
                                onAccess={handleMaterialAccess}
                                onMarkAsRead={handleMaterialMarkAsRead}
                              />
                            </div>
                          ))}
                        </div>
                      ));
                  } else {
                    // No grouping
                    return filteredMaterials.map((material) => (
                      <div key={material.id} className="material-card-wrapper">
                        <MaterialCard
                          courseMaterial={material}
                          courseId={id || ''}
                          onAccess={handleMaterialAccess}
                          onMarkAsRead={handleMaterialMarkAsRead}
                        />
                      </div>
                    ));
                  }
                })()
              )}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="tab-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.length === 0 ? (
                <div className="empty-state-small">
                  <div className="empty-icon-small">📢</div>
                  <div className="empty-text">No announcements yet</div>
                </div>
              ) : (
                announcements.map((announcement) => (
                    <div key={announcement.id} className="assignment-card">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ fontSize: '2rem' }}>
                          {announcement.priority === 'urgent' ? '🚨' : announcement.priority === 'high' ? '📢' : '📌'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {announcement.priority && announcement.priority !== 'normal' && (
                              <span
                                style={{
                                  padding: '0.25rem 0.625rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  background: announcement.priority === 'urgent' ? '#dc3545' : '#fd7e14',
                                  color: 'white',
                                  textTransform: 'uppercase'
                                }}
                              >
                                {announcement.priority}
                              </span>
                            )}
                            <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
                              {formatDate(announcement.published_at || announcement.created_at)}
                            </span>
                          </div>
                          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.125rem' }}>{announcement.title}</h3>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {announcement.content}
                          </p>
                          {announcement.author && (
                            <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                              By {announcement.author.first_name} {announcement.author.last_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
