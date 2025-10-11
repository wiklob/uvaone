import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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

interface Material {
  id: string;
  title: string;
  type: string;
  file_url: string;
  uploaded_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
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
  const [finalGrade, setFinalGrade] = useState<number | null>(null);
  const [currentGrade, setCurrentGrade] = useState<number | null>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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

      // Fetch materials
      const { data: materialsData } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', id)
        .order('uploaded_at', { ascending: false });

      setMaterials(materialsData || []);

      // Fetch announcements
      const { data: announcementsData } = await supabase
        .from('course_announcements')
        .select('*')
        .eq('course_id', id)
        .order('created_at', { ascending: false });

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

      // Add events with their lesson info
      if (eventsData && lessonsData) {
        eventsData.forEach(event => {
          const lesson = lessonsData.find(l => l.id === event.lesson_id);
          if (lesson) {
            timeline.push({
              id: event.id,
              type: 'lesson',
              title: event.title || lesson.title,
              date: event.start_time,
              endDate: event.end_time,
              description: event.description || lesson.description,
              lessonType: lesson.type,
              isOnline: event.is_online,
              status: event.status,
              roomName: lesson.room?.name,
              facilityName: lesson.room?.facility?.name
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
            <div className="overview-section">
              <h3 className="section-heading">Course Description</h3>
              <p className="course-description">{course.description || 'No description available.'}</p>
            </div>

            <div className="overview-stats-grid">
              <div className="overview-stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-value">{assignments.length}</div>
                <div className="stat-label">Assignments</div>
              </div>
              <div className="overview-stat-card">
                <div className="stat-icon">📄</div>
                <div className="stat-value">{materials.length}</div>
                <div className="stat-label">Materials</div>
              </div>
              <div className="overview-stat-card">
                <div className="stat-icon">📢</div>
                <div className="stat-value">{announcements.length}</div>
                <div className="stat-label">Announcements</div>
              </div>
            </div>

            {announcements.length > 0 && (
              <div className="overview-section">
                <h3 className="section-heading">Recent Announcements</h3>
                <div className="announcements-preview">
                  {announcements.slice(0, 3).map((announcement) => (
                    <div key={announcement.id} className="announcement-preview-card">
                      <div className="announcement-preview-title">{announcement.title}</div>
                      <div className="announcement-preview-date">{formatDate(announcement.created_at)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

                        // Group items by week
                        timelineItems.forEach(item => {
                          const itemDate = new Date(item.date);
                          const weekNum = Math.floor((itemDate.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000));
                          const week = weekNum + Math.ceil(timelineItems.length / 7);
                          if (!weeks.has(week)) weeks.set(week, []);
                          weeks.get(week)!.push(item);
                        });

                        return Array.from(weeks.entries()).map(([week, items]) => (
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

                      // Group items by week
                      timelineItems.forEach(item => {
                        const itemDate = new Date(item.date);
                        const weekNum = Math.floor((itemDate.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000));
                        const week = weekNum + Math.ceil(timelineItems.length / 7);
                        if (!weeks.has(week)) weeks.set(week, []);
                        weeks.get(week)!.push(item);
                      });

                      return Array.from(weeks.entries()).map(([week, items]) => (
                        <div key={week}>
                          <div className="timeline-week-badge">Week {week}</div>
                          {items.map((item) => {
                            const isExpanded = expandedItems.has(item.id);
                            return (
                              <div
                                key={`${item.type}-${item.id}`}
                                id={`timeline-item-${item.type}-${item.id}`}
                                className="timeline-item"
                              >
                          <div
                            className={`timeline-item-card ${item.type} ${isExpanded ? 'expanded' : ''}`}
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
                                  <button className="action-btn primary" onClick={(e) => e.stopPropagation()}>
                                    <div className="action-btn-icon">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                      </svg>
                                    </div>
                                    <span>SUBMIT</span>
                                  </button>
                                )}
                                {item.type === 'assignment' && (
                                  <button className="action-btn secondary" onClick={(e) => e.stopPropagation()}>
                                    <div className="action-btn-icon">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 13l4 4L19 7"/>
                                      </svg>
                                    </div>
                                    <span>MARK AS DONE</span>
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
            <div className="grades-summary">
              {finalGrade !== null && (
                <div className="grade-card final">
                  <div className="grade-card-label">Final Grade</div>
                  <div className={`grade-card-value ${getGradeClass(finalGrade)}`}>
                    {finalGrade.toFixed(1)}
                  </div>
                  <div className="grade-card-sublabel">out of 10</div>
                </div>
              )}
              {currentGrade !== null && (
                <div className="grade-card current">
                  <div className="grade-card-label">Current Grade</div>
                  <div className={`grade-card-value ${getGradeClass(currentGrade / 10)}`}>
                    {currentGrade.toFixed(1)}%
                  </div>
                  <div className="grade-card-sublabel">based on graded work</div>
                </div>
              )}
              {!finalGrade && !currentGrade && (
                <div className="empty-state-small">
                  <div className="empty-icon-small">📊</div>
                  <div className="empty-text">No grades yet</div>
                </div>
              )}
            </div>

            <h3 className="section-heading">Assignment Grades</h3>
            <div className="assignments-list">
              {assignments.length === 0 ? (
                <div className="empty-state-small">
                  <div className="empty-icon-small">📝</div>
                  <div className="empty-text">No assignments yet</div>
                </div>
              ) : (
                assignments.map((assignment) => (
                  <div key={assignment.id} className="assignment-grade-card">
                    <div className="assignment-grade-left">
                      <div className={`assignment-status-dot ${
                        assignment.submission?.grade != null ? 'graded' :
                        assignment.submission?.status === 'submitted' ? 'pending' :
                        'not-submitted'
                      }`}></div>
                      <div className="assignment-grade-info">
                        <h4 className="assignment-grade-title">{assignment.title}</h4>
                        <div className="assignment-grade-meta">
                          <span className="meta-badge">{assignment.type}</span>
                          <span className="meta-text">Weight: {(assignment.weight * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="assignment-grade-right">
                      {assignment.submission?.grade != null ? (
                        <div className="grade-display">
                          <div className={`grade-display-value ${
                            getGradeClass((assignment.submission.grade / assignment.max_points) * 10)
                          }`}>
                            {assignment.submission.grade} / {assignment.max_points}
                          </div>
                          <div className="grade-display-percent">
                            {((assignment.submission.grade / assignment.max_points) * 100).toFixed(0)}%
                          </div>
                        </div>
                      ) : assignment.submission?.status === 'submitted' ? (
                        <div className="status-badge pending">⏳ Pending</div>
                      ) : (
                        <div className="status-badge not-submitted">Not Submitted</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
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
                  <div key={assignment.id} className="assignment-detail-card">
                    <div className="assignment-detail-header">
                      <h4 className="assignment-detail-title">{assignment.title}</h4>
                      <span className="assignment-type-badge">{assignment.type}</span>
                    </div>
                    <div className="assignment-detail-meta">
                      <span>Max Points: {assignment.max_points}</span>
                      <span>Weight: {(assignment.weight * 100).toFixed(0)}%</span>
                      {assignment.due_date && (
                        <span className="due-date">Due: {formatDate(assignment.due_date)}</span>
                      )}
                    </div>
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
          <div className="tab-content">
            <div className="materials-list">
              {materials.length === 0 ? (
                <div className="empty-state-small">
                  <div className="empty-icon-small">📄</div>
                  <div className="empty-text">No materials yet</div>
                </div>
              ) : (
                materials.map((material) => (
                  <div key={material.id} className="material-card">
                    <div className="material-icon">📄</div>
                    <div className="material-info">
                      <h4 className="material-title">{material.title}</h4>
                      <div className="material-meta">
                        <span className="material-type">{material.type}</span>
                        <span className="material-date">{formatDate(material.uploaded_at)}</span>
                      </div>
                    </div>
                    <a href={material.file_url} className="material-download-btn" target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="tab-content">
            <div className="announcements-list">
              {announcements.length === 0 ? (
                <div className="empty-state-small">
                  <div className="empty-icon-small">📢</div>
                  <div className="empty-text">No announcements yet</div>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div key={announcement.id} className="announcement-card">
                    <div className="announcement-header">
                      <h4 className="announcement-title">{announcement.title}</h4>
                      <span className="announcement-date">{formatDate(announcement.created_at)}</span>
                    </div>
                    <div className="announcement-content">{announcement.content}</div>
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
