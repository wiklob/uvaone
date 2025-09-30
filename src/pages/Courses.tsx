import { motion } from 'framer-motion';
import { courses, assignments } from '../data/mockData';
import './Courses.css';

export default function Courses() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1 className="page-title">My Courses</h1>
          <p className="page-subtitle">Fall Semester 2025</p>
        </div>
        <div className="header-stats">
          <div className="header-stat">
            <span className="header-stat-value">{courses.length}</span>
            <span className="header-stat-label">Courses</span>
          </div>
          <div className="header-stat">
            <span className="header-stat-value">{courses.reduce((sum, c) => sum + c.credits, 0)}</span>
            <span className="header-stat-label">Credits</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="courses-grid"
      >
        {courses.map((course) => {
          const courseAssignments = assignments.filter(a => a.courseCode === course.code);
          const pendingAssignments = courseAssignments.filter(a => a.status !== 'completed');

          return (
            <motion.div
              key={course.id}
              variants={cardVariants}
              className="course-card"
              whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)' }}
            >
              <div className="course-header" style={{ borderLeftColor: course.color }}>
                <div className="course-code" style={{ color: course.color }}>
                  {course.code}
                </div>
                <div className="course-credits">{course.credits} credits</div>
              </div>

              <h3 className="course-name">{course.name}</h3>

              <div className="course-details">
                <div className="course-detail">
                  <span className="detail-icon">👨‍🏫</span>
                  <span className="detail-text">{course.professor}</span>
                </div>
                <div className="course-detail">
                  <span className="detail-icon">📅</span>
                  <span className="detail-text">{course.schedule}</span>
                </div>
                <div className="course-detail">
                  <span className="detail-icon">📍</span>
                  <span className="detail-text">{course.room}</span>
                </div>
              </div>

              {pendingAssignments.length > 0 && (
                <div className="course-assignments">
                  <div className="assignments-header">
                    <span className="assignments-title">Pending Assignments</span>
                    <span className="assignments-count">{pendingAssignments.length}</span>
                  </div>
                  <div className="assignments-list">
                    {pendingAssignments.map(assignment => (
                      <div key={assignment.id} className="assignment-item">
                        <span className="assignment-title">{assignment.title}</span>
                        <span className="assignment-due">
                          Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="course-actions">
                <button className="course-btn primary">View Materials</button>
                <button className="course-btn">Announcements</button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}