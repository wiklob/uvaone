import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import { supabase } from '../lib/supabase';
import CourseSelector from '../components/CourseSelector';
import '../pages/CourseDetail.css';  // USE COURSEDETAIL CSS!

type ContentTab = 'all_courses' | 'timeline' | 'assignments' | 'materials' | 'announcements' | 'grades';

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
  courseId: string;
  courseCode: string;
}

export default function Courses() {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const {
    courses,
    allAssignments,
    allAnnouncements,
    loading,
    error
  } = useCourses();

  const [contentTab, setContentTab] = useState<ContentTab>('all_courses');
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Sync tab state with URL
  useEffect(() => {
    const validTabs: ContentTab[] = ['all_courses', 'timeline', 'assignments', 'materials', 'announcements', 'grades'];
    if (tab && validTabs.includes(tab as ContentTab)) {
      setContentTab(tab as ContentTab);
    } else {
      navigate('/courses/all_courses', { replace: true });
    }
  }, [tab, navigate]);

  // Fetch timeline when timeline tab is active
  useEffect(() => {
    if (contentTab === 'timeline' && !loading) {
      fetchAllTimeline();
    }
  }, [contentTab, loading]);

  // Helper function to expand recurring events into multiple occurrences
  const expandRecurringEvent = (event: any, lesson: any): TimelineItem[] => {
    if (!event.is_recurring || !event.recurrence_rule || !event.recurrence_end_date) {
      // Not recurring, return single item
      return [{
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
        facilityName: lesson.room?.facility?.name,
        courseId: lesson.course_id,
        courseCode: lesson.course.code
      }];
    }

    const occurrences: TimelineItem[] = [];
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    const recurrenceEndDate = new Date(event.recurrence_end_date);
    const duration = endDate.getTime() - startDate.getTime();

    let currentDate = new Date(startDate);
    let occurrenceNumber = 0;

    while (currentDate <= recurrenceEndDate) {
      const occurrenceStart = new Date(currentDate);
      const occurrenceEnd = new Date(currentDate.getTime() + duration);

      // Remove "Week X" from the title
      let updatedTitle = event.title || lesson.title;
      if (updatedTitle) {
        updatedTitle = updatedTitle.replace(/\s*-?\s*Week \d+/i, '');
      }

      occurrences.push({
        id: `${event.id}-occurrence-${occurrenceNumber}`,
        type: 'lesson',
        title: updatedTitle,
        date: occurrenceStart.toISOString(),
        endDate: occurrenceEnd.toISOString(),
        description: event.description || lesson.description,
        lessonType: lesson.type,
        isOnline: event.is_online,
        status: event.status,
        roomName: lesson.room?.name,
        facilityName: lesson.room?.facility?.name,
        courseId: lesson.course_id,
        courseCode: lesson.course.code
      });

      occurrenceNumber++;

      // Calculate next occurrence
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

  const fetchAllTimeline = async () => {
    if (courses.length === 0) return;

    setTimelineLoading(true);
    try {
      const courseIds = courses.map(e => e.course_id);

      // Fetch all lessons for enrolled courses
      const { data: lessonsData } = await supabase
        .from('lesson')
        .select(`
          *,
          course!inner(id, code),
          room:room_id (
            name,
            facility:facility_id (name)
          )
        `)
        .in('course_id', courseIds);

      const lessonIds = lessonsData?.map(l => l.id) || [];

      // Fetch all events for these lessons
      const { data: eventsData } = await supabase
        .from('event')
        .select('*')
        .in('lesson_id', lessonIds)
        .order('start_time', { ascending: true });

      // Build timeline from events and assignments
      const timeline: TimelineItem[] = [];

      // Add events with lesson info (expanding recurring events)
      if (eventsData && lessonsData) {
        eventsData.forEach(event => {
          const lesson = lessonsData.find(l => l.id === event.lesson_id);
          if (lesson) {
            const expandedEvents = expandRecurringEvent(event, lesson);
            timeline.push(...expandedEvents);
          }
        });
      }

      // Add assignments with due dates
      allAssignments.forEach(assignment => {
        if (assignment.due_date) {
          timeline.push({
            id: assignment.id,
            type: 'assignment',
            title: assignment.title,
            date: assignment.due_date,
            description: assignment.description,
            assignmentType: assignment.type,
            dueDate: assignment.due_date,
            maxPoints: assignment.max_points ?? undefined,
            submissionType: assignment.submission_type,
            courseId: assignment.course_id,
            courseCode: assignment.course?.code || ''
          });
        }
      });

      // Sort by date
      timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setTimelineItems(timeline);
    } catch (err) {
      console.error('Error fetching timeline:', err);
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleTabChange = (newTab: ContentTab) => {
    setContentTab(newTab);
    navigate(`/courses/${newTab}`);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading courses...</div>
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

  // Transform courses for CourseSelector
  const coursesForSelector = courses.map(enrollment => ({
    id: enrollment.course.id,
    code: enrollment.course.code,
    title: enrollment.course.title,
    ects: enrollment.course.ects
  }));

  return (
    <div className="course-detail-page">
      <div className="course-detail-header">
        <div className="course-detail-title-section">
          <CourseSelector
            selectedCourse="all"
            courses={coursesForSelector}
            currentTab={contentTab}
          />
        </div>
      </div>

      <div className="course-detail-tabs">
        <button
          className={`tab-button ${contentTab === 'all_courses' ? 'active' : ''}`}
          onClick={() => handleTabChange('all_courses')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${contentTab === 'timeline' ? 'active' : ''}`}
          onClick={() => handleTabChange('timeline')}
        >
          Timeline
        </button>
        <button
          className={`tab-button ${contentTab === 'assignments' ? 'active' : ''}`}
          onClick={() => handleTabChange('assignments')}
        >
          Assignments
        </button>
        <button
          className={`tab-button ${contentTab === 'grades' ? 'active' : ''}`}
          onClick={() => handleTabChange('grades')}
        >
          Grades
        </button>
        <button
          className={`tab-button ${contentTab === 'materials' ? 'active' : ''}`}
          onClick={() => handleTabChange('materials')}
        >
          Materials
        </button>
        <button
          className={`tab-button ${contentTab === 'announcements' ? 'active' : ''}`}
          onClick={() => handleTabChange('announcements')}
        >
          Announcements
        </button>
      </div>

      <div className="course-detail-content">
        {/* OVERVIEW TAB */}
        {contentTab === 'all_courses' && (
          <div className="tab-content">
            <div className="assignments-list">
              {courses.map(enrollment => (
                <div
                  key={enrollment.id}
                  className="assignment-detail-card"
                  onClick={() => navigate(`/course/${enrollment.course.id}/overview`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="assignment-detail-meta">
                    <span className="assignment-type-badge">{enrollment.course.code}</span>
                    <span className="meta-separator">•</span>
                    <span>{enrollment.course.ects} ECTS</span>
                    <span className="meta-separator">•</span>
                    <span>Period {enrollment.course.period}</span>
                  </div>
                  <h4 className="assignment-detail-title">{enrollment.course.title}</h4>
                  {enrollment.course.description && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
                      {enrollment.course.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {contentTab === 'timeline' && (
          <div className="tab-content">
            {timelineLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <div>Loading timeline...</div>
              </div>
            ) : timelineItems.length === 0 ? (
              <div className="empty-state-small">
                <div className="empty-icon-small">📅</div>
                <div className="empty-text">No upcoming activities</div>
              </div>
            ) : (
              <div className="timeline-layout">
                {/* Left column: Mini map */}
                <div className="timeline-minimap">
                  <h3 className="minimap-title">All Courses</h3>
                  <div className="minimap-sections">
                    {(() => {
                      const now = new Date();
                      const weeks = new Map<number, TimelineItem[]>();

                      // Find earliest date
                      const earliestDate = timelineItems.length > 0
                        ? new Date(Math.min(...timelineItems.map(item => new Date(item.date).getTime())))
                        : now;

                      // Group items by week
                      timelineItems.forEach(item => {
                        const itemDate = new Date(item.date);
                        const daysDiff = Math.floor((itemDate.getTime() - earliestDate.getTime()) / (24 * 60 * 60 * 1000));
                        const weekNum = Math.floor(daysDiff / 7) + 1;

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
                  </div>
                </div>

                {/* Right column: Timeline */}
                <div className="timeline-main">
                  <div className="timeline-container">
                {(() => {
                  const now = new Date();
                  const weeks = new Map<number, TimelineItem[]>();

                  // Find earliest date
                  const earliestDate = timelineItems.length > 0
                    ? new Date(Math.min(...timelineItems.map(item => new Date(item.date).getTime())))
                    : now;

                  // Group items by week
                  timelineItems.forEach(item => {
                    const itemDate = new Date(item.date);
                    const daysDiff = Math.floor((itemDate.getTime() - earliestDate.getTime()) / (24 * 60 * 60 * 1000));
                    const weekNum = Math.floor(daysDiff / 7) + 1;

                    if (!weeks.has(weekNum)) weeks.set(weekNum, []);
                    weeks.get(weekNum)!.push(item);
                  });

                  return Array.from(weeks.entries()).sort(([a], [b]) => a - b).map(([week, items]) => (
                    <div key={week}>
                      <div className="timeline-week-badge">Week {week}</div>
                      {items.map((item) => {
                        const isPast = new Date(item.date) < now;
                        const isExpanded = expandedItems.has(item.id);
                        return (
                          <div
                            key={`${item.type}-${item.id}`}
                            id={`timeline-item-${item.type}-${item.id}`}
                            className="timeline-item"
                          >
                            <div
                              className={`timeline-item-card ${item.type} ${isExpanded ? 'expanded' : ''} ${isPast ? 'past' : ''}`}
                              onClick={() => {
                                if (item.type === 'assignment') {
                                  navigate(`/course/${item.courseId}/assignment/${item.id}`);
                                } else {
                                  toggleExpand(item.id, { stopPropagation: () => {} } as React.MouseEvent);
                                }
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="timeline-item-header-row">
                                <div className="timeline-item-main-content">
                                  <div className="timeline-item-metadata">
                                    <span className="course-badge" style={{ background: 'var(--primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, marginRight: '0.5rem' }}>
                                      {item.courseCode}
                                    </span>
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

                                  <h4 className="timeline-item-title">{item.title}</h4>
                                </div>

                                {/* Action buttons on the right */}
                                <div className="timeline-item-actions">
                                  {item.type === 'assignment' && item.submissionType !== 'no_submission' && (
                                    <button
                                      className="action-btn"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="action-btn-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                      </div>
                                      <span>SUBMIT</span>
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
                                        navigate(`/course/${item.courseId}/lesson/${item.id}`);
                                      }}
                                    >
                                      <div className="quick-action-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                                        </svg>
                                      </div>
                                      <span>LESSON PANEL</span>
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
                </div>
              </div>
            )}
          </div>
        )}

        {/* ASSIGNMENTS TAB - TO BE REFACTORED */}
        {contentTab === 'assignments' && (
          <div className="tab-content">
            <div className="assignments-list">
              {allAssignments.length === 0 ? (
                <div className="empty-state-small">
                  <div className="empty-icon-small">📝</div>
                  <div className="empty-text">No assignments yet</div>
                </div>
              ) : (
                allAssignments.map(assignment => (
                  <div
                    key={assignment.id}
                    className="assignment-detail-card"
                    onClick={() => navigate(`/course/${assignment.course_id}/assignment/${assignment.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="assignment-detail-meta">
                      <span className="course-badge" style={{ background: 'var(--primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700 }}>
                        {assignment.course?.code}
                      </span>
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
                      {assignment.due_date && (
                        <>
                          <span className="meta-separator">•</span>
                          <span className="due-date">Due {formatDate(assignment.due_date)}</span>
                        </>
                      )}
                    </div>
                    <h4 className="assignment-detail-title">{assignment.title}</h4>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* GRADES TAB - TO BE REFACTORED */}
        {contentTab === 'grades' && (
          <div className="tab-content">
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Grades implementation in progress...
            </div>
          </div>
        )}

        {/* MATERIALS TAB - TO BE REFACTORED */}
        {contentTab === 'materials' && (
          <div className="tab-content">
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Materials implementation in progress...
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS TAB - TO BE REFACTORED */}
        {contentTab === 'announcements' && (
          <div className="tab-content">
            <div className="assignments-list">
              {allAnnouncements.length === 0 ? (
                <div className="empty-state-small">
                  <div className="empty-icon-small">📢</div>
                  <div className="empty-text">No announcements yet</div>
                </div>
              ) : (
                allAnnouncements.map(announcement => (
                  <div key={announcement.id} className="assignment-detail-card">
                    <div className="assignment-detail-meta">
                      <span className="course-badge" style={{ background: 'var(--primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700 }}>
                        {announcement.course?.code}
                      </span>
                      <span className="assignment-type-badge">
                        {announcement.priority === 'urgent' && '🚨 URGENT'}
                        {announcement.priority === 'high' && '📢 HIGH'}
                        {announcement.priority === 'normal' && '📌 ANNOUNCEMENT'}
                      </span>
                      <span className="meta-separator">•</span>
                      <span>{formatDate(announcement.published_at || announcement.created_at)}</span>
                    </div>
                    <h4 className="assignment-detail-title">{announcement.title}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
                      {announcement.content}
                    </p>
                    {announcement.author && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                        By {announcement.author.first_name} {announcement.author.last_name}
                      </div>
                    )}
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
