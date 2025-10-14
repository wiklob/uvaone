import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/mobile/MobileLayout';

export default function MobileServices() {
  const navigate = useNavigate();

  const services = [
    { icon: '📚', label: 'Library', path: '/library' },
    { icon: '🍽️', label: 'Dining', path: '/dining' },
    { icon: '🗺️', label: 'Campus Map', path: '/map' },
    { icon: '🎉', label: 'Events', path: '/events' },
    { icon: '📅', label: 'Calendar', path: '/calendar' },
    { icon: '📊', label: 'Grades', path: '/grades' },
    { icon: '👤', label: 'Profile', path: '/profile' },
    { icon: '⚙️', label: 'Settings', path: '/settings' }
  ];

  return (
    <MobileLayout>
      <div className="page">
        <div style={{ padding: '1rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem'
            }}
          >
            {services.map(service => (
              <button
                key={service.path}
                onClick={() => navigate(service.path)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1.5rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: '120px',
                  justifyContent: 'center',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span style={{ fontSize: '2.5rem' }}>{service.icon}</span>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  color: 'var(--text-primary)'
                }}>
                  {service.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
