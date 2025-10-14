import { useState } from 'react';
import './MaterialCard.css';

export interface Material {
  id: string;
  title: string;
  type: 'book' | 'video' | 'article' | 'research_paper' | 'slides' | 'dataset' | 'software';
  description: string | null;
  url: string | null;
  availability: 'library' | 'open_access' | 'paywall' | 'university_license';
  isbn: string | null;
  authors: string | null;
  publication_year: number | null;
}

export interface CourseMaterial {
  id: string;
  course_id: string;
  material_id: string;
  required: boolean | null;
  order: number | null;
  material: Material;
  lesson?: {
    id: string;
    title: string;
  } | null;
  assignment?: {
    id: string;
    title: string;
  } | null;
  accessed?: boolean;
  last_accessed?: string | null;
}

interface MaterialCardProps {
  courseMaterial: CourseMaterial;
  onAccess?: (materialId: string) => void;
  onMarkAsRead?: (materialId: string) => void;
  courseId: string;
}

export default function MaterialCard({ courseMaterial, onMarkAsRead, courseId }: MaterialCardProps) {
  const { material, required, accessed, last_accessed, lesson, assignment } = courseMaterial;
  const [isExpanded, setIsExpanded] = useState(false);

  const getMaterialIcon = () => {
    switch (material.type) {
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

  const getAvailabilityIcon = () => {
    switch (material.availability) {
      case 'library': return '📚';
      case 'open_access': return '🌐';
      case 'paywall': return '🔒';
      case 'university_license': return '🎓';
      default: return '📖';
    }
  };

  const getAvailabilityText = () => {
    switch (material.availability) {
      case 'library': return 'Available at Library';
      case 'open_access': return 'Open Access';
      case 'paywall': return 'Paywall (Available via Library)';
      case 'university_license': return 'University License';
      default: return 'Unknown';
    }
  };

  const formatLastAccessed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffDays === 0) {
      if (diffHours === 0) return 'Just now';
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="material-timeline-item">
      <div
        className={`material-timeline-card ${isExpanded ? 'expanded' : ''} ${accessed ? 'accessed' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <div className="material-timeline-header-row">
          <div className="material-timeline-main-content">
            {/* Metadata row at top */}
            <div className="material-timeline-metadata">
              <span className="material-timeline-type-badge">
                {getMaterialIcon()} {material.type.replace('_', ' ').toUpperCase()}
              </span>
              <span className="meta-separator">•</span>
              <span className={`material-status-text ${required ? 'required' : 'optional'}`}>
                {required ? 'REQUIRED' : 'OPTIONAL'}
              </span>
              {material.publication_year && (
                <>
                  <span className="meta-separator">•</span>
                  <span>{material.publication_year}</span>
                </>
              )}
              {material.authors && (
                <>
                  <span className="meta-separator">•</span>
                  <span>{material.authors}</span>
                </>
              )}
              {accessed && (
                <>
                  <span className="meta-separator">•</span>
                  <span className="material-accessed-badge">✓ ACCESSED</span>
                </>
              )}
            </div>

            {/* Title */}
            <h4 className="material-timeline-title">{material.title}</h4>
          </div>

          {/* Expand button on the right */}
          <div className="material-timeline-actions">
            <button
              className="expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
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
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="material-timeline-expanded">
            {/* Description */}
            {material.description && (
              <p className="material-timeline-description">{material.description}</p>
            )}

            {/* Availability info */}
            <div className="material-availability-section">
              <div className="availability-row">
                <span className="availability-icon">{getAvailabilityIcon()}</span>
                <span className="availability-text">{getAvailabilityText()}</span>
              </div>
              {material.isbn && (
                <div className="material-meta-info">ISBN: {material.isbn}</div>
              )}
              {last_accessed && (
                <div className="material-meta-info">
                  👁️ Last accessed: {formatLastAccessed(last_accessed)}
                </div>
              )}
            </div>

            {/* Linked items */}
            {(lesson || assignment) && (
              <div className="material-linked-items">
                <span className="linked-label">📍 Linked to:</span>
                <div className="linked-tags">
                  {lesson && (
                    <a
                      href={`/course/${courseId}/lesson/${lesson.id}`}
                      className="linked-tag"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {lesson.title}
                    </a>
                  )}
                  {assignment && (
                    <a
                      href={`/course/${courseId}/assignment/${assignment.id}`}
                      className="linked-tag"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {assignment.title}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Quick action buttons */}
            <div className="material-quick-actions">
              <button className="quick-action-btn" onClick={(e) => { e.stopPropagation(); onMarkAsRead?.(material.id); }}>
                <div className="quick-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span>{accessed ? 'REVIEWED' : 'MARK AS READ'}</span>
              </button>
              <button className="quick-action-btn" onClick={(e) => e.stopPropagation()}>
                <div className="quick-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  </svg>
                </div>
                <span>SAVE</span>
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
                    <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                  </svg>
                </div>
                <span>SHARE</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
