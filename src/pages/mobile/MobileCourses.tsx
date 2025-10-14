import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../../hooks/useCourses';
import { supabase } from '../../lib/supabase';
import MobileLayout from '../../components/mobile/MobileLayout';
import CourseSelector from '../../components/CourseSelector';
import '../../pages/CourseDetail.css';

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

export default function MobileCourses() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const {
    courses,
    allAssignments,
    allAnnouncements,
    loading
  } = useCourses();

  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const contentTab = (tab as ContentTab) || 'all_courses';

  useEffect(() => {
    if (contentTab === 'timeline' && !loading) {
      fetchAllTimeline();
    }
  }, [contentTab, loading]);

  const fetchAllTimeline = async () => {
    if (courses.length === 0) return;

    setTimelineLoading(true);
    try {
      const courseIds = courses.map(e => e.course_id);

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

      const { data: eventsData } = await supabase
        .from('event')
        .select('*')
        .in('lesson_id', lessonIds)
        .order('start_time', { ascending: true });

      const timeline: TimelineItem[] = [];

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
              facilityName: lesson.room?.facility?.name,
              courseId: lesson.course_id,
              courseCode: lesson.course.code
            });
          }
        });
      }

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

      timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setTimelineItems(timeline);
    } catch (err) {
      console.error('Error fetching timeline:', err);
    } finally {
      setTimelineLoading(false);
    }
  };

  const toggleExpand = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const coursesForSelector = courses.map(enrollment => ({
    id: enrollment.course.id,
    code: enrollment.course.code,
    title: enrollment.course.title,
    ects: enrollment.course.ects
  }));

  if (loading) {
    return (
      <MobileLayout showTopTabBar={true} selectedTab={contentTab} courseId="all">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading courses...</div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      showTopTabBar={true}
      selectedTab={contentTab}
      courseId="all"
    >
      <div className="course-detail-page">
        <div className="course-detail-header" style={{ padding: '1rem' }}>
          <CourseSelector
            selectedCourse="all"
            courses={coursesForSelector}
            currentTab={contentTab}
          />
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
                <div className="timeline-container" style={{ padding: '0 1rem' }}>
                  {(() => {
                    const now = new Date();
                    const weeks = new Map<number, TimelineItem[]>();
                    const earliestDate = timelineItems.length > 0
                      ? new Date(Math.min(...timelineItems.map(item => new Date(item.date).getTime())))
                      : now;

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
                                        </>
                                      )}
                                    </div>

                                    <h4 className="timeline-item-title">{item.title}</h4>
                                  </div>

                                  <div className="timeline-item-actions">
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

                                {isExpanded && item.type === 'lesson' && (
                                  <div className="timeline-item-expanded">
                                    {item.description && (
                                      <p className="timeline-item-description">{item.description}</p>
                                    )}
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
          )}

          {/* ASSIGNMENTS TAB */}
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

          {/* GRADES TAB */}
          {contentTab === 'grades' && (
            <div className="tab-content">
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                Grades implementation in progress...
              </div>
            </div>
          )}

          {/* MATERIALS TAB */}
          {contentTab === 'materials' && (
            <div className="tab-content">
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                Materials implementation in progress...
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS TAB */}
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
    </MobileLayout>
  );
}
