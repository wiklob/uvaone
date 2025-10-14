import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseSelector.css';

interface Course {
  id: string;
  code: string;
  title: string;
  ects: number;
}

interface CourseSelectorProps {
  selectedCourse: 'all' | string;
  courses: Course[];
  currentTab: string;
}

export default function CourseSelector({ selectedCourse, courses, currentTab }: CourseSelectorProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCourseData = selectedCourse === 'all'
    ? null
    : courses.find(c => c.id === selectedCourse);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCourseChange = (courseId: 'all' | string) => {
    setIsOpen(false);

    if (courseId === 'all') {
      // Map course-specific tabs to all-courses tabs
      const tabMapping: Record<string, string> = {
        'overview': 'all_courses',
        'timeline': 'timeline',
        'assignments': 'assignments',
        'grades': 'grades',
        'materials': 'materials',
        'announcements': 'announcements'
      };
      const mappedTab = tabMapping[currentTab] || 'all_courses';
      navigate(`/courses/${mappedTab}`);
    } else {
      // Map all-courses tabs to course-specific tabs
      const tabMapping: Record<string, string> = {
        'all_courses': 'overview',
        'timeline': 'timeline',
        'assignments': 'assignments',
        'grades': 'grades',
        'materials': 'materials',
        'announcements': 'announcements'
      };
      const mappedTab = tabMapping[currentTab] || 'overview';
      navigate(`/course/${courseId}/${mappedTab}`);
    }
  };

  return (
    <div className="course-selector-wrapper" ref={dropdownRef}>
      <div className="course-selector-header">
        {selectedCourse === 'all' ? (
          <>
            <h1 className="course-detail-code">ALL COURSES</h1>
            <h2 className="course-detail-title">Aggregate View</h2>
          </>
        ) : selectedCourseData ? (
          <>
            <h1 className="course-detail-code">{selectedCourseData.code}</h1>
            <h2 className="course-detail-title">{selectedCourseData.title}</h2>
          </>
        ) : null}

        <button
          className="course-selector-toggle"
          onClick={() => setIsOpen(!isOpen)}
          title="Switch course"
        >
          <span>Switch Course</span>
          <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="course-selector-dropdown">
          <div
            className={`course-selector-option ${selectedCourse === 'all' ? 'active' : ''}`}
            onClick={() => handleCourseChange('all')}
          >
            <div className="course-option-header">
              <span className="course-option-code">ALL</span>
              {selectedCourse === 'all' && <span className="check-icon">✓</span>}
            </div>
            <div className="course-option-title">All Courses - Aggregate View</div>
          </div>

          <div className="course-selector-divider" />

          {courses.map(course => (
            <div
              key={course.id}
              className={`course-selector-option ${selectedCourse === course.id ? 'active' : ''}`}
              onClick={() => handleCourseChange(course.id)}
            >
              <div className="course-option-header">
                <span className="course-option-code">{course.code}</span>
                {selectedCourse === course.id && <span className="check-icon">✓</span>}
              </div>
              <div className="course-option-title">{course.title}</div>
              <div className="course-option-meta">{course.ects} ECTS</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
