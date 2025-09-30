import { motion } from 'framer-motion';
import { assignments } from '../data/mockData';
import './Dashboard.css';

export default function Dashboard() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const upcomingAssignments = assignments
    .filter(a => a.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const todayClasses = [
    { time: '10:00-11:30', course: 'CS101', name: 'Intro to Computer Science', room: 'Science A-201' },
    { time: '14:00-15:30', course: 'PHY101', name: 'Physics I', room: 'Physics P-303' }
  ];

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

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1 className="page-title">Welcome back, John! 👋</h1>
          <p className="page-subtitle">{today}</p>
        </div>
        <div className="weather">
          <span className="weather-icon">☀️</span>
          <span className="weather-temp">18°C</span>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="dashboard-grid"
      >
        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="stat-card">
          <div className="stat-icon" style={{ background: '#0066cc' }}>📚</div>
          <div className="stat-info">
            <div className="stat-value">4</div>
            <div className="stat-label">Active Courses</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card">
          <div className="stat-icon" style={{ background: '#28a745' }}>✅</div>
          <div className="stat-info">
            <div className="stat-value">8.3</div>
            <div className="stat-label">Current GPA</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card">
          <div className="stat-icon" style={{ background: '#ff6b35' }}>📝</div>
          <div className="stat-info">
            <div className="stat-value">{upcomingAssignments.length}</div>
            <div className="stat-label">Due This Week</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card">
          <div className="stat-icon" style={{ background: '#9c27b0' }}>🎯</div>
          <div className="stat-info">
            <div className="stat-value">21/60</div>
            <div className="stat-label">Credits Earned</div>
          </div>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div variants={itemVariants} className="card schedule-card">
          <div className="card-header">
            <h2 className="card-title">Today's Schedule</h2>
            <span className="badge">{todayClasses.length} classes</span>
          </div>
          <div className="schedule-list">
            {todayClasses.map((cls, idx) => (
              <div key={idx} className="schedule-item">
                <div className="schedule-time">{cls.time}</div>
                <div className="schedule-details">
                  <div className="schedule-course">{cls.name}</div>
                  <div className="schedule-room">{cls.room}</div>
                </div>
                <div className="schedule-code">{cls.course}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div variants={itemVariants} className="card deadlines-card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Deadlines</h2>
            <a href="/courses" className="view-all">View all →</a>
          </div>
          <div className="deadline-list">
            {upcomingAssignments.map((assignment) => {
              const daysUntil = Math.ceil(
                (new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div key={assignment.id} className="deadline-item">
                  <div className="deadline-info">
                    <div className="deadline-title">{assignment.title}</div>
                    <div className="deadline-course">{assignment.courseCode}</div>
                  </div>
                  <div className="deadline-date">
                    <span className={`deadline-badge ${daysUntil <= 2 ? 'urgent' : ''}`}>
                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="card quick-actions-card">
          <h2 className="card-title">Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn">
              <span className="action-icon">📧</span>
              <span>Check Email</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📖</span>
              <span>Reserve Study Room</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">🍽️</span>
              <span>Today's Menu</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">🚌</span>
              <span>Shuttle Times</span>
            </button>
          </div>
        </motion.div>

        {/* Announcements */}
        <motion.div variants={itemVariants} className="card announcements-card">
          <h2 className="card-title">Recent Announcements</h2>
          <div className="announcements-list">
            <div className="announcement-item">
              <div className="announcement-icon">📢</div>
              <div className="announcement-content">
                <div className="announcement-title">Library Hours Extended</div>
                <div className="announcement-text">The library will be open 24/7 during exam week</div>
                <div className="announcement-time">2 hours ago</div>
              </div>
            </div>
            <div className="announcement-item">
              <div className="announcement-icon">🎓</div>
              <div className="announcement-content">
                <div className="announcement-title">Career Fair Next Week</div>
                <div className="announcement-text">Register now for the annual career fair on October 10th</div>
                <div className="announcement-time">1 day ago</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}