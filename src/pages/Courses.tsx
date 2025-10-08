import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCourses } from '../hooks/useCourses';
import type { AssignmentWithSubmission, CourseMaterialWithDetails } from '../types/database';
import './Courses.css';

export default function Courses() {
  const {
    courses,
    allAssignments,
    allMaterials,
    allAnnouncements,
    contentTab,
    setContentTab,
    loading,
    error
  } = useCourses();

  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [showRequiredOnly, setShowRequiredOnly] = useState(false);

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

  const getCourseColor = (courseCode: string) => {
    const colors = ['#0066cc', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1'];
    const hash = courseCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getDaysUntil = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'book': return '📖';
      case 'video': return '🎥';
      case 'article': return '📄';
      case 'research_paper': return '📑';
      case 'slides': return '📊';
      case 'dataset': return '💾';
      case 'software': return '💻';
      default: return '📚';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'library': return '📚';
      case 'open_access': return '🌐';
      case 'paywall': return '🔒';
      case 'university_license': return '🎓';
      default: return '📖';
    }
  };

  const filteredAssignments = allAssignments.filter(assignment => {
    if (assignmentFilter === 'all') return true;
    const submission = assignment.submission?.[0];
    if (assignmentFilter === 'upcoming') return !submission || submission.status === 'draft';
    if (assignmentFilter === 'submitted') return submission?.status === 'submitted';
    if (assignmentFilter === 'graded') return submission?.status === 'graded';
    return true;
  });

  const filteredMaterials = allMaterials.filter(material => {
    if (showRequiredOnly && !material.required) return false;
    if (materialFilter === 'all') return true;
    return material.material.type === materialFilter;
  });

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

  return (
    <div className="page">
      <div className="content-view">
        <div className="content-tabs">
          <button
            className={`content-tab ${contentTab === 'courses' ? 'active' : ''}`}
            onClick={() => setContentTab('courses')}
          >
            📚 All Courses
          </button>
          <button
            className={`content-tab ${contentTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setContentTab('assignments')}
          >
            📝 Assignments
          </button>
          <button
            className={`content-tab ${contentTab === 'materials' ? 'active' : ''}`}
            onClick={() => setContentTab('materials')}
          >
            📖 Materials
          </button>
          <button
            className={`content-tab ${contentTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setContentTab('announcements')}
          >
            📢 Announcements
          </button>
          <button
            className={`content-tab ${contentTab === 'grades' ? 'active' : ''}`}
            onClick={() => setContentTab('grades')}
          >
            📊 Grades
          </button>
        </div>

        {contentTab === 'courses' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="courses-grid"
          >
          {courses.map((enrollment) => {
            const course = enrollment.course;
            const color = getCourseColor(course.code);
            const pendingAssignments = allAssignments.filter(
              a => a.course_id === course.id && (!a.submission || a.submission.length === 0)
            );

            return (
              <motion.div
                key={enrollment.id}
                variants={cardVariants}
                className="course-card"
                whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)' }}
              >
                <div className="course-header" style={{ borderLeftColor: color }}>
                  <div className="course-code" style={{ color }}>
                    {course.code}
                  </div>
                  <div className="course-credits">{course.ects} EC</div>
                </div>

                <h3 className="course-name">{course.title}</h3>

                {course.description && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {course.description}
                  </p>
                )}

                <div className="course-details">
                  <div className="course-detail">
                    <span className="detail-icon">📅</span>
                    <span className="detail-text">Period {course.period}</span>
                  </div>
                  <div className="course-detail">
                    <span className="detail-icon">🌐</span>
                    <span className="detail-text">{course.language}</span>
                  </div>
                  <div className="course-detail">
                    <span className="detail-icon">⏰</span>
                    <span className="detail-text">{course.contact_hours} hours</span>
                  </div>
                </div>

                {pendingAssignments.length > 0 && (
                  <div className="course-assignments">
                    <div className="assignments-header">
                      <span className="assignments-title">Pending Assignments</span>
                      <span className="assignments-count">{pendingAssignments.length}</span>
                    </div>
                    <div className="assignments-list">
                      {pendingAssignments.slice(0, 3).map(assignment => (
                        <div key={assignment.id} className="assignment-item">
                          <span className="assignment-title">{assignment.title}</span>
                          <span className="assignment-due">
                            Due: {new Date(assignment.due_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {enrollment.final_grade && (
                  <div style={{ padding: '0.75rem', background: '#e8f5e9', borderRadius: '8px', fontSize: '0.875rem' }}>
                    <strong>Current Grade:</strong> {enrollment.final_grade}/10
                    {enrollment.grade_letter && ` (${enrollment.grade_letter})`}
                  </div>
                )}

                <div className="course-actions">
                  <button className="course-btn primary">View Materials</button>
                  <button className="course-btn">
                    Announcements {enrollment.announcementsCount > 0 && `(${enrollment.announcementsCount})`}
                  </button>
                </div>
              </motion.div>
            );
          })}
          </motion.div>
        )}

        {contentTab === 'assignments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="content-filters">
                <div className="filter-group">
                  <span className="filter-label">Status:</span>
                  <select
                    className="filter-select"
                    value={assignmentFilter}
                    onChange={(e) => setAssignmentFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="submitted">Submitted</option>
                    <option value="graded">Graded</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredAssignments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No assignments found
                  </div>
                ) : (
                  filteredAssignments.map((assignment) => {
                    const daysUntil = getDaysUntil(assignment.due_date!);
                    const submission = assignment.submission?.[0];
                    const isGraded = submission?.status === 'graded';
                    const color = getCourseColor(assignment.course?.code || '');

                    return (
                      <div key={assignment.id} className="assignment-card">
                        <div className="assignment-card-header">
                          <div className="assignment-info">
                            <h3 className="assignment-card-title">{assignment.title}</h3>
                            <div className="assignment-card-meta">
                              <span style={{ color, fontWeight: 600 }}>{assignment.course?.code}</span>
                              <span>•</span>
                              <span style={{ textTransform: 'capitalize' }}>{assignment.type}</span>
                              <span>•</span>
                              <span>{assignment.max_points} points</span>
                              {assignment.weight && (
                                <>
                                  <span>•</span>
                                  <span>{(assignment.weight * 100).toFixed(0)}% of grade</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div>
                            {!submission || submission.status === 'draft' ? (
                              <span className={`assignment-badge ${daysUntil <= 2 ? 'urgent' : ''}`}>
                                📅 Due: {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                              </span>
                            ) : isGraded ? (
                              <span className="assignment-badge graded">
                                ✓ Graded: {submission.grade}/{assignment.max_points}
                              </span>
                            ) : (
                              <span className="assignment-badge submitted">
                                ✓ Submitted
                              </span>
                            )}
                          </div>
                        </div>

                        {assignment.description && (
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                            {assignment.description}
                          </p>
                        )}

                        {isGraded && submission.feedback && (
                          <div className="assignment-status" style={{ background: '#e3f2fd' }}>
                            <strong>Feedback:</strong> {submission.feedback}
                          </div>
                        )}

                        {submission && submission.status === 'submitted' && (
                          <div className="assignment-status">
                            ⏳ Submitted on {new Date(submission.submitted_at).toLocaleDateString()} - Awaiting grade
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
        )}

        {contentTab === 'materials' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="content-filters">
                <div className="filter-group">
                  <span className="filter-label">Type:</span>
                  <select
                    className="filter-select"
                    value={materialFilter}
                    onChange={(e) => setMaterialFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="book">Books</option>
                    <option value="video">Videos</option>
                    <option value="article">Articles</option>
                    <option value="slides">Slides</option>
                  </select>
                </div>
                <div className="filter-group">
                  <input
                    type="checkbox"
                    id="required-only"
                    className="filter-checkbox"
                    checked={showRequiredOnly}
                    onChange={(e) => setShowRequiredOnly(e.target.checked)}
                  />
                  <label htmlFor="required-only" className="filter-label" style={{ cursor: 'pointer' }}>
                    Required Only
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredMaterials.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No materials found
                  </div>
                ) : (
                  (() => {
                    const groupedByCourse: Record<string, typeof filteredMaterials> = {};
                    filteredMaterials.forEach(m => {
                      const code = m.course.code;
                      if (!groupedByCourse[code]) groupedByCourse[code] = [];
                      groupedByCourse[code].push(m);
                    });

                    return Object.entries(groupedByCourse).map(([courseCode, materials]) => (
                      <div key={courseCode}>
                        <h3 className="course-group-header">
                          {courseCode} - {materials[0].course.title}
                        </h3>
                        {materials.map((courseMaterial) => {
                          const material = courseMaterial.material;
                          return (
                            <div key={courseMaterial.id} className="material-card" style={{ marginBottom: '1rem' }}>
                              <div className="material-card-header">
                                <div className="material-icon">{getMaterialIcon(material.type)}</div>
                                <div className="material-info">
                                  <span className={`material-badge ${!courseMaterial.required ? 'optional' : ''}`}>
                                    {courseMaterial.required ? 'REQUIRED' : 'OPTIONAL'}
                                  </span>
                                  <h4 className="material-title">{material.title}</h4>
                                  {material.authors && (
                                    <div className="material-meta">
                                      {material.authors} {material.publication_year && `• ${material.publication_year}`}
                                    </div>
                                  )}
                                  {material.description && (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                                      {material.description}
                                    </p>
                                  )}
                                  <div className="material-availability">
                                    {getAvailabilityIcon(material.availability)} {material.availability.replace('_', ' ').toUpperCase()}
                                    {material.isbn && ` • ISBN: ${material.isbn}`}
                                  </div>
                                  {material.url && (
                                    <div className="material-actions">
                                      <a href={material.url} target="_blank" rel="noopener noreferrer" className="material-btn primary">
                                        Access Resource
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ));
                  })()
                )}
              </div>
            </motion.div>
        )}

        {contentTab === 'announcements' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {allAnnouncements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No announcements
                  </div>
                ) : (
                  allAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="assignment-card">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ fontSize: '2rem' }}>
                          {announcement.priority === 'urgent' ? '🚨' : announcement.priority === 'high' ? '📢' : '📌'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {announcement.priority !== 'normal' && (
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
                            {announcement.course && (
                              <span style={{ color: getCourseColor(announcement.course.code), fontWeight: 600 }}>
                                {announcement.course.code}
                              </span>
                            )}
                            <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
                              {new Date(announcement.published_at!).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.125rem' }}>{announcement.title}</h3>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {announcement.content}
                          </p>
                          <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            By {announcement.author.first_name} {announcement.author.last_name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
        )}

        {contentTab === 'grades' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(() => {
                  const gradedAssignments = allAssignments.filter(a => a.submission?.[0]?.status === 'graded');

                  if (gradedAssignments.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No grades yet
                      </div>
                    );
                  }

                  return gradedAssignments.map((assignment) => {
                    const submission = assignment.submission![0];
                    const percentage = ((submission.grade! / assignment.max_points!) * 100).toFixed(1);
                    const color = getCourseColor(assignment.course?.code || '');

                    return (
                      <div key={assignment.id} className="assignment-card">
                        <div className="assignment-card-header">
                          <div className="assignment-info">
                            <h3 className="assignment-card-title">{assignment.title}</h3>
                            <div className="assignment-card-meta">
                              <span style={{ color, fontWeight: 600 }}>{assignment.course?.code}</span>
                              <span>•</span>
                              <span style={{ textTransform: 'capitalize' }}>{assignment.type}</span>
                              <span>•</span>
                              <span>Graded {new Date(submission.graded_at!).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>
                              {submission.grade}/{assignment.max_points}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                              {percentage}%
                            </div>
                          </div>
                        </div>
                        {submission.feedback && (
                          <div className="assignment-status" style={{ background: '#e3f2fd' }}>
                            <strong>Feedback:</strong> {submission.feedback}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>
        )}
      </div>
    </div>
  );
}
