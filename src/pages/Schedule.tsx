import { motion } from 'framer-motion';
import { scheduleEvents } from '../data/mockData';
import './Schedule.css';

export default function Schedule() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const getEventsForDay = (dayIndex: number) => {
    return scheduleEvents.filter(event => event.day === dayIndex + 1);
  };

  const getEventStyle = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const baseMinutes = 8 * 60; // 08:00

    const top = ((startMinutes - baseMinutes) / 60) * 80;
    const height = ((endMinutes - startMinutes) / 60) * 80;

    return { top: `${top}px`, height: `${height}px` };
  };

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1 className="page-title">My Schedule</h1>
          <p className="page-subtitle">Week of September 30 - October 4, 2025</p>
        </div>
        <div className="schedule-view-toggle">
          <button className="view-btn active">Week</button>
          <button className="view-btn">Month</button>
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

          {days.map((day, dayIndex) => (
            <div key={day} className="day-column">
              <div className="day-header">
                <div className="day-name">{day}</div>
                <div className="day-date">{dayIndex + 30}</div>
              </div>
              <div className="events-container">
                {hours.map(hour => (
                  <div key={hour} className="hour-slot"></div>
                ))}
                {getEventsForDay(dayIndex).map(event => (
                  <motion.div
                    key={event.id}
                    className="schedule-event"
                    style={{
                      ...getEventStyle(event.startTime, event.endTime),
                      background: event.color
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: dayIndex * 0.1 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                  >
                    <div className="event-title">{event.title}</div>
                    <div className="event-time">{event.startTime} - {event.endTime}</div>
                    <div className="event-location">{event.location}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
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
          <span>Class</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#28a745' }}></div>
          <span>Lab</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#17a2b8' }}></div>
          <span>Office Hours</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#ffc107' }}></div>
          <span>Event</span>
        </div>
      </motion.div>
    </div>
  );
}