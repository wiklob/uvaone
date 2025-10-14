import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Grades.css';

interface Course {
  id: string;
  code: string;
  title: string;
  ects: number;
  final_grade: number | null;
  grade_letter: string | null;
}

interface Assignment {
  id: string;
  title: string;
  type: string;
  max_points: number;
  weight: number;
  due_date: string;
  course_id: string;
}

interface Submission {
  id: string;
  assignment_id: string;
  grade: number | null;
  feedback: string | null;
  status: string;
  submitted_at: string;
}

interface CourseWithGrades extends Course {
  assignments: (Assignment & { submission?: Submission })[];
  currentGrade: number | null;
}

export default function Grades() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseWithGrades[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [gpa, setGpa] = useState<number | null>(null);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const { data: enrollments, error: enrollError } = await supabase
        .from('course_enrollments')
        .select(`
          course_id,
          final_grade,
          grade_letter,
          course:course_id (
            id,
            code,
            title,
            ects
          )
        `)
        .eq('status', 'active')
        .limit(10);

      if (enrollError) throw enrollError;

      const coursesWithGrades: CourseWithGrades[] = [];

      for (const enrollment of enrollments || []) {
        const course = enrollment.course as any;

        const { data: assignments, error: assignError } = await supabase
          .from('assignment')
          .select('*')
          .eq('course_id', course.id)
          .eq('published', true);

        if (assignError) throw assignError;

        const assignmentIds = assignments?.map(a => a.id) || [];
        const { data: submissions } = await supabase
          .from('submission')
          .select('*')
          .in('assignment_id', assignmentIds);

        const assignmentsWithSubmissions = (assignments || []).map(assignment => {
          const submission = submissions?.find(s => s.assignment_id === assignment.id);
          return {
            ...assignment,
            submission
          };
        });

        const gradedAssignments = assignmentsWithSubmissions.filter(
          a => a.submission?.grade != null
        );

        let currentGrade = null;
        if (gradedAssignments.length > 0) {
          const totalWeight = gradedAssignments.reduce((sum, a) => sum + (a.weight || 0), 0);
          const weightedSum = gradedAssignments.reduce(
            (sum, a) => sum + ((a.submission?.grade || 0) / a.max_points) * (a.weight || 0),
            0
          );
          currentGrade = totalWeight > 0 ? (weightedSum / totalWeight) * 10 : null;
        }

        coursesWithGrades.push({
          id: course.id,
          code: course.code,
          title: course.title,
          ects: course.ects,
          final_grade: enrollment.final_grade,
          grade_letter: enrollment.grade_letter,
          assignments: assignmentsWithSubmissions,
          currentGrade
        });
      }

      setCourses(coursesWithGrades);

      const completedCourses = coursesWithGrades.filter(c => c.final_grade != null);
      if (completedCourses.length > 0) {
        const totalEcts = completedCourses.reduce((sum, c) => sum + c.ects, 0);
        const weightedSum = completedCourses.reduce(
          (sum, c) => sum + (c.final_grade || 0) * c.ects,
          0
        );
        setGpa(weightedSum / totalEcts);
      }

    } catch (error) {
      console.error('Error fetching grades:', error);
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

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading grades...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grades-page">
      <div className="grades-header">
        <h1 className="grades-title">Academic Progress</h1>

        {gpa !== null && (
          <div className="stats-grid">
            <div className="stat-card-gradient blue">
              <div className="stat-card-header">
                <div className="stat-card-label">Current GPA</div>
                <div className="stat-icon-circle">🎯</div>
              </div>
              <div className="stat-card-value">{gpa.toFixed(2)}</div>
              <div className="stat-card-sublabel">Out of 10.0</div>
            </div>

            <div className="stat-card-gradient purple">
              <div className="stat-card-header">
                <div className="stat-card-label">Total ECTS</div>
                <div className="stat-icon-circle">📚</div>
              </div>
              <div className="stat-card-value">{courses.reduce((sum, c) => sum + c.ects, 0)}</div>
              <div className="stat-card-sublabel">Credits earned</div>
            </div>

            <div className="stat-card-gradient green">
              <div className="stat-card-header">
                <div className="stat-card-label">Active Courses</div>
                <div className="stat-icon-circle">📖</div>
              </div>
              <div className="stat-card-value">{courses.length}</div>
              <div className="stat-card-sublabel">Currently enrolled</div>
            </div>
          </div>
        )}
      </div>

      <div className="courses-section">
        <h2 className="section-title">My Courses</h2>
        <div className="courses-grid">
          {courses.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-icon">📚</div>
              <div className="empty-title">No enrolled courses found</div>
              <div className="empty-text">Enroll in courses to see your grades here</div>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="course-card"
                onClick={() => setSelectedCourse(course.id)}
              >
                <div className="course-card-header">
                  <div>
                    <div className="course-code">{course.code}</div>
                    <div className="course-title">{course.title}</div>
                  </div>
                  <div className="ects-badge">{course.ects} ECTS</div>
                </div>

                <div className="grades-display">
                  <div className="grades-row">
                    {course.currentGrade !== null && (
                      <div className="grade-item">
                        <div className="grade-label">Current</div>
                        <div className={`grade-value ${getGradeClass(course.currentGrade)}`}>
                          {course.currentGrade.toFixed(1)}
                        </div>
                        <div className="grade-sublabel">out of 10</div>
                      </div>
                    )}
                    {course.final_grade !== null && (
                      <div className="grade-item">
                        <div className="grade-label">Final</div>
                        <div className={`grade-value ${getGradeClass(course.final_grade)}`}>
                          {course.final_grade.toFixed(1)}
                        </div>
                        <div className="grade-sublabel">out of 10</div>
                      </div>
                    )}
                    {!course.currentGrade && !course.final_grade && (
                      <div className="grade-item">
                        <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
                          No grades yet
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {course.assignments.length > 0 && (
                  <button className="view-assignments-btn">
                    <span>{selectedCourse === course.id ? '▲' : '▼'}</span>
                    <span>
                      {selectedCourse === course.id ? 'Hide' : 'View'} {course.assignments.length} Assignment{course.assignments.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {selectedCourse && (
        <div className="assignments-modal" onClick={() => setSelectedCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const course = courses.find(c => c.id === selectedCourse);
              if (!course) return null;

              return (
                <>
                  <div className="modal-header">
                    <div className="modal-header-content">
                      <div>
                        <h2 className="modal-title">{course.code}</h2>
                        <p className="modal-subtitle">{course.title}</p>
                      </div>
                      <button
                        className="modal-close-btn"
                        onClick={() => setSelectedCourse(null)}
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="modal-body">
                    {course.assignments.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <div className="empty-title">No assignments yet</div>
                      </div>
                    ) : (
                      <div className="assignments-list">
                        {course.assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="assignment-card"
                            onClick={() => navigate(`/course/${course.id}/assignment/${assignment.id}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="assignment-content">
                              <div className="assignment-left">
                                <div className="assignment-header">
                                  <div className={`assignment-status-icon ${
                                    assignment.submission?.grade != null ? 'graded' :
                                    assignment.submission?.status === 'submitted' ? 'pending' :
                                    'not-submitted'
                                  }`}>
                                    {assignment.submission?.grade != null ? '✓' : '•'}
                                  </div>
                                  <div className="assignment-info">
                                    <h3 className="assignment-title">{assignment.title}</h3>
                                    <div className="assignment-meta">
                                      <span className="assignment-type-badge">
                                        {assignment.type}
                                      </span>
                                      <span className="assignment-meta-item">
                                        {assignment.max_points} points
                                      </span>
                                      <span className="assignment-meta-item">
                                        Weight: {(assignment.weight * 100).toFixed(0)}%
                                      </span>
                                      {assignment.due_date && (
                                        <span className="assignment-due">
                                          Due: {formatDate(assignment.due_date)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                {assignment.submission?.grade != null ? (
                                  <div className="assignment-grade-box">
                                    <div className={`assignment-grade-value ${
                                      getGradeClass((assignment.submission.grade / assignment.max_points) * 10)
                                    }`}>
                                      {assignment.submission.grade}
                                    </div>
                                    <div className="assignment-grade-details">
                                      / {assignment.max_points}
                                    </div>
                                    <div className="assignment-grade-percent">
                                      {((assignment.submission.grade / assignment.max_points) * 100).toFixed(0)}%
                                    </div>
                                  </div>
                                ) : assignment.submission?.status === 'submitted' ? (
                                  <div className="assignment-status-badge">
                                    ⏳ Pending
                                  </div>
                                ) : (
                                  <div className="assignment-status-badge not-submitted">
                                    Not Submitted
                                  </div>
                                )}
                              </div>
                            </div>
                            {assignment.submission?.feedback && (
                              <div className="assignment-feedback">
                                <div className="feedback-header">
                                  <span>💬</span>
                                  <div className="feedback-label">Feedback</div>
                                </div>
                                <div className="feedback-content">
                                  {assignment.submission.feedback}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
