import { motion } from 'framer-motion';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useSchedule } from '../hooks/useSchedule';
import './Schedule.css';

export default function Schedule() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const hasAnimated = useRef(false);

  useEffect(() => {
    // Reset animation flag when week changes
    hasAnimated.current = false;

    // Mark as animated after initial render
    const timer = setTimeout(() => {
      hasAnimated.current = true;
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentWeekStart]);

  const weekEnd = useMemo(() => {
    const end = new Date(currentWeekStart);
    end.setDate(currentWeekStart.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [currentWeekStart]);

  const { events, loading, error } = useSchedule(currentWeekStart, weekEnd);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const getCourseColor = (courseCode: string) => {
    const colors = ['#0066cc', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1'];
    const hash = courseCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getEventsForDay = (dayIndex: number) => {
    const dayDate = new Date(currentWeekStart);
    dayDate.setDate(currentWeekStart.getDate() + dayIndex);

    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getFullYear() === dayDate.getFullYear() &&
        eventDate.getMonth() === dayDate.getMonth() &&
        eventDate.getDate() === dayDate.getDate()
      );
    });
  };

  const getEventStyle = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const startHour = start.getHours();
    const startMin = start.getMinutes();
    const endHour = end.getHours();
    const endMin = end.getMinutes();

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const baseMinutes = 8 * 60; // 08:00

    const top = ((startMinutes - baseMinutes) / 60) * 80;
    const height = ((endMinutes - startMinutes) / 60) * 80;

    return { top: `${top}px`, height: `${height}px` };
  };

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToToday = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  const formatWeekRange = () => {
    const start = currentWeekStart;
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 4); // Friday

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `${startStr} - ${endStr}`;
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'lecture': return '🎓';
      case 'lab': return '🧪';
      case 'tutorial': return '👨‍🏫';
      case 'seminar': return '💼';
      case 'exam': return '📝';
      case 'workshop': return '🔨';
      default: return '📚';
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading schedule...</div>
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1 className="page-title">My Schedule</h1>
          <p className="page-subtitle">Week of {formatWeekRange()}</p>
        </div>
        <div className="schedule-view-toggle">
          <button className="view-btn" onClick={goToPreviousWeek}>←</button>
          <button className="view-btn" onClick={goToToday}>Today</button>
          <button className="view-btn" onClick={goToNextWeek}>→</button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="schedule-container"
      >
        <div className="schedule-grid">
          <div className="time-column">
            <div className="time-header"></div>
            {hours.map(hour => (
              <div key={hour} className="time-slot">
                {hour}
              </div>
            ))}
          </div>

          {days.map((day, dayIndex) => {
            const dayDate = new Date(currentWeekStart);
            dayDate.setDate(currentWeekStart.getDate() + dayIndex);
            const isToday = new Date().toDateString() === dayDate.toDateString();

            return (
              <div key={day} className="day-column">
                <div className={`day-header ${isToday ? 'today' : ''}`}>
                  <div className="day-name">{day}</div>
                  <div className="day-date">{dayDate.getDate()}</div>
                </div>
                <div className="events-container">
                  {hours.map(hour => (
                    <div key={hour} className="hour-slot"></div>
                  ))}
                  {getEventsForDay(dayIndex).map(event => {
                    const color = getCourseColor(event.lesson.course.code);
                    return (
                      <motion.div
                        key={event.id}
                        className="schedule-event"
                        style={{
                          ...getEventStyle(event.start_time, event.end_time),
                          background: color
                        }}
                        initial={hasAnimated.current ? false : { scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: hasAnimated.current ? 0 : dayIndex * 0.1 }}
                        whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                        title={`${event.lesson.course.code} - ${event.lesson.title}\n${event.lesson.room?.facility?.name} ${event.lesson.room?.name}`}
                      >
                        <div className="event-title">
                          {getLessonIcon(event.lesson.type)} {event.lesson.course.code}
                        </div>
                        <div className="event-time">
                          {new Date(event.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} -{' '}
                          {new Date(event.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                        <div className="event-location">
                          {event.is_online ? (
                            <>🌐 Online</>
                          ) : event.lesson.room ? (
                            <>📍 {event.lesson.room.name}</>
                          ) : (
                            <>📍 TBA</>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="schedule-legend"
      >
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#0066cc' }}></div>
          <span>🎓 Lecture</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#28a745' }}></div>
          <span>🧪 Lab</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#17a2b8' }}></div>
          <span>👨‍🏫 Tutorial</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#ffc107' }}></div>
          <span>💼 Seminar</span>
        </div>
      </motion.div>
    </div>
  );
}
