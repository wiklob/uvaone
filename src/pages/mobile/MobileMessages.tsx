import MobileLayout from '../../components/mobile/MobileLayout';

export default function MobileMessages() {
  return (
    <MobileLayout>
      <div className="page">
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Messages</h2>
          <p>Messages feature coming soon!</p>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            Future features will include:
          </p>
          <ul style={{ textAlign: 'left', maxWidth: '300px', margin: '1rem auto', listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '0.5rem 0' }}>📨 Course discussions</li>
            <li style={{ padding: '0.5rem 0' }}>👨‍🏫 Instructor messages</li>
            <li style={{ padding: '0.5rem 0' }}>👥 Group chats</li>
            <li style={{ padding: '0.5rem 0' }}>📢 Announcements</li>
          </ul>
        </div>
      </div>
    </MobileLayout>
  );
}
