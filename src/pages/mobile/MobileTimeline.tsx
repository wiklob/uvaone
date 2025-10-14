import MobileLayout from '../../components/mobile/MobileLayout';
import { useNavigate } from 'react-router-dom';

export default function MobileTimeline() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="page">
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Global Timeline</h2>
          <p>This shows the aggregated timeline from all courses.</p>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            To see course-specific timelines, navigate to a course and use the top tab bar.
          </p>
          <button
            onClick={() => navigate('/courses/timeline')}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Go to Course Timeline
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
