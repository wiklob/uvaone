import type { CalendarEvent } from '../../types/calendar';
import { formatTime, parseISOToDate } from '../../utils/dateUtils';

interface EventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const startTime = parseISOToDate(event.startTime);
  const timeStr = formatTime(startTime);

  const getEventIcon = () => {
    switch (event.type) {
      case 'class':
        return '📚';
      case 'assignment':
        return '📝';
      case 'exam':
        return '🎯';
      case 'office-hours':
        return '👨‍🏫';
      case 'personal':
        return '📅';
      default:
        return '•';
    }
  };

  return (
    <div
      className="event-card"
      style={{ borderLeftColor: event.color }}
      onClick={onClick}
    >
      <div className="event-card-time">
        <span className="event-icon">{getEventIcon()}</span>
        {timeStr}
      </div>
      <div className="event-card-title">{event.title}</div>
      {event.location && (
        <div className="event-card-location">📍 {event.location}</div>
      )}
    </div>
  );
}
