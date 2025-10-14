import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import MobileLayout from '../../components/mobile/MobileLayout';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  published_at?: string;
  priority?: string;
  author?: {
    first_name: string;
    last_name: string;
  };
  course?: {
    code: string;
  };
}

export default function MobileNotifications() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      // Fetch all enrolled courses
      const { data: enrolledCourses } = await supabase
        .from('course_enrollments')
        .select('course_id');

      const courseIds = enrolledCourses?.map(e => e.course_id) || [];

      // Fetch all announcements from enrolled courses
      const { data: announcementsData } = await supabase
        .from('announcement')
        .select(`
          *,
          author:user!author_id(first_name, last_name),
          course!inner(code)
        `)
        .in('course_id', courseIds)
        .eq('published', true)
        .order('published_at', { ascending: false });

      setAnnouncements(announcementsData || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
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
      <MobileLayout>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading notifications...</div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="page">
        <div style={{ padding: '1rem' }}>
          {announcements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
              <div>No notifications yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.map(announcement => (
                <div
                  key={announcement.id}
                  className="assignment-card"
                  style={{
                    padding: '1rem',
                    background: 'var(--surface)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>
                      {announcement.priority === 'urgent' ? '🚨' : announcement.priority === 'high' ? '📢' : '📌'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.125rem 0.375rem',
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }}
                        >
                          {announcement.course?.code}
                        </span>
                        {announcement.priority && announcement.priority !== 'normal' && (
                          <span
                            style={{
                              padding: '0.25rem 0.625rem',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              background: announcement.priority === 'urgent' ? '#dc3545' : '#fd7e14',
                              color: 'white',
                              textTransform: 'uppercase'
                            }}
                          >
                            {announcement.priority}
                          </span>
                        )}
                        <span style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                          {formatDate(announcement.published_at || announcement.created_at)}
                        </span>
                      </div>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{announcement.title}</h3>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {announcement.content}
                      </p>
                      {announcement.author && (
                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          By {announcement.author.first_name} {announcement.author.last_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
