import { motion } from 'framer-motion';
import { useDashboard } from '../hooks/useDashboard';
import './Dashboard.css';

export default function Dashboard() {
  const {
    todaysSchedule,
    quickStats,
    upcomingDeadlines,
    announcements,
    loading,
    error
  } = useDashboard();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const formatTime = (isoTime: string) => {
    return new Date(isoTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getRelativeTime = (isoTime: string) => {
    const now = new Date().getTime();
    const time = new Date(isoTime).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  const getDaysUntil = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'lecture': return '🎓';
      case 'lab': return '🧪';
      case 'tutorial': return '👨‍🏫';
      case 'seminar': return '💼';
      case 'exam': return '📝';
      case 'workshop': return '🔨';
      default: return '📚';
    }
  };

  const getAnnouncementIcon = (item: typeof announcements[0]) => {
    if (item.type === 'grade') return '📊';
    if (item.priority === 'urgent') return '🚨';
    if (item.priority === 'high') return '📢';
    return '📌';
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'normal': return '#0066cc';
      case 'low': return '#6c757d';
      default: return '#0066cc';
    }
  };

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

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{today}</p>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="dashboard-grid"
      >
        {/* Today's Schedule - Full Width */}
        <motion.div variants={itemVariants} className="card schedule-card" style={{ gridColumn: 'span 4' }}>
          <div className="card-header">
            <h2 className="card-title">📅 Today's Schedule</h2>
            <span className="badge">{todaysSchedule.length} event{todaysSchedule.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="schedule-list">
            {todaysSchedule.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No classes scheduled for today
              </div>
            ) : (
              todaysSchedule.map((event) => (
                <div key={event.id} className="schedule-item">
                  <div className="schedule-time">
                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  </div>
                  <div className="schedule-details">
                    <div className="schedule-course">
                      {getLessonIcon(event.lesson.type)} {event.lesson.course.title}
                    </div>
                    <div className="schedule-room">
                      {event.is_online ? (
                        <>🌐 Online{event.online_link && ` - ${event.online_link}`}</>
                      ) : event.lesson.room ? (
                        <>📍 {event.lesson.room.facility?.name} {event.lesson.room.name}</>
                      ) : (
                        <>📍 Location TBA</>
                      )}
                    </div>
                  </div>
                  <div className="schedule-code">{event.lesson.course.code}</div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="stat-card">
          <div className="stat-icon" style={{ background: '#0066cc' }}>📚</div>
          <div className="stat-info">
            <div className="stat-value">{quickStats.activeCourses}</div>
            <div className="stat-label">Active Courses</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card">
          <div className="stat-icon" style={{ background: '#28a745' }}>✅</div>
          <div className="stat-info">
            <div className="stat-value">{quickStats.gpa.toFixed(1)}</div>
            <div className="stat-label">Current GPA</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card">
          <div className="stat-icon" style={{ background: '#ff6b35' }}>📝</div>
          <div className="stat-info">
            <div className="stat-value">{quickStats.upcomingDeadlines}</div>
            <div className="stat-label">Due This Week</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card">
          <div className="stat-icon" style={{ background: '#9c27b0' }}>🎯</div>
          <div className="stat-info">
            <div className="stat-value">{quickStats.creditsEarned}/{quickStats.creditsTotal}</div>
            <div className="stat-label">Credits Earned</div>
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div variants={itemVariants} className="card deadlines-card">
          <div className="card-header">
            <h2 className="card-title">📅 Upcoming Deadlines</h2>
            <a href="/courses" className="view-all">View all →</a>
          </div>
          <div className="deadline-list">
            {upcomingDeadlines.map((assignment) => {
              const daysUntil = getDaysUntil(assignment.due_date!);
              const submission = assignment.submission?.[0];
              const isGraded = submission?.status === 'graded';

              return (
                <div key={assignment.id} className="deadline-item">
                  <div className="deadline-info">
                    <div className="deadline-title">{assignment.title}</div>
                    <div className="deadline-course">
                      {assignment.course?.code}
                      {isGraded && (
                        <span style={{ marginLeft: '0.5rem', color: '#28a745', fontWeight: 600 }}>
                          ✓ Graded: {submission.grade}/{assignment.max_points}
                        </span>
                      )}
                      {submission && !isGraded && submission.status === 'submitted' && (
                        <span style={{ marginLeft: '0.5rem', color: '#ffc107', fontWeight: 600 }}>
                          ⏳ Grading...
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="deadline-date">
                    {!submission || submission.status === 'draft' ? (
                      <span className={`deadline-badge ${daysUntil <= 2 ? 'urgent' : ''}`}>
                        {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                      </span>
                    ) : (
                      <span className="deadline-badge" style={{ background: '#28a745' }}>
                        Submitted
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Announcements & Alerts */}
        <motion.div variants={itemVariants} className="card announcements-card">
          <h2 className="card-title">📢 Announcements & Alerts</h2>
          <div className="announcements-list">
            {announcements.map((item) => (
              <div key={item.id} className="announcement-item">
                <div
                  className="announcement-icon"
                  style={{ color: item.priority ? getPriorityColor(item.priority) : '#0066cc' }}
                >
                  {getAnnouncementIcon(item)}
                </div>
                <div className="announcement-content">
                  <div className="announcement-title">
                    {item.type === 'grade' ? (
                      <>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '4px',
                          background: '#28a745',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          marginRight: '0.5rem'
                        }}>
                          GRADE POSTED
                        </span>
                        {item.course?.code}: {item.assignmentTitle} - {item.grade}/10
                      </>
                    ) : (
                      <>
                        {item.priority && item.priority !== 'normal' && (
                          <span style={{
                            display: 'inline-block',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '4px',
                            background: getPriorityColor(item.priority),
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            marginRight: '0.5rem',
                            textTransform: 'uppercase'
                          }}>
                            {item.priority}
                          </span>
                        )}
                        {item.title}
                      </>
                    )}
                  </div>
                  {item.content && (
                    <div className="announcement-text">{item.content}</div>
                  )}
                  <div className="announcement-time">
                    {item.course && item.type === 'announcement' && `${item.course.code} • `}
                    {item.college && `${item.college.name} • `}
                    {getRelativeTime(item.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
