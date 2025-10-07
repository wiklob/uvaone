import type { CalendarEvent } from '../../types/calendar';
import { isToday, isSameDay } from '../../utils/dateUtils';
import EventCard from './EventCard';

interface DayCellProps {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isSelected: boolean;
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent, element: HTMLElement) => void;
  onDayClick?: (date: Date) => void;
}

export default function DayCell({
  date,
  events,
  isCurrentMonth,
  isSelected,
  onSelectDate,
  onSelectEvent,
  onDayClick
}: DayCellProps) {
  const dayNumber = date.getDate();
  const isCurrentDay = isToday(date);

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  // Limit displayed events (show +N more if needed)
  const maxDisplayed = 3;
  const displayedEvents = sortedEvents.slice(0, maxDisplayed);
  const remainingCount = sortedEvents.length - maxDisplayed;

  return (
    <div
      className={`day-cell ${isCurrentMonth ? '' : 'other-month'} ${isCurrentDay ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={() => {
        onSelectDate(date);
        if (onDayClick) onDayClick(date);
      }}
    >
      <div className="day-number">{dayNumber}</div>
      <div className="day-events">
        {displayedEvents.map(event => (
          <div
            key={event.id}
            className="day-event-badge"
            onClick={(e) => {
              e.stopPropagation();
              onSelectEvent(event, e.currentTarget);
            }}
            title={event.title}
          >
            <span className="day-event-dot" style={{ backgroundColor: event.color }}></span>
            <span className="day-event-title">{event.title}</span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="day-event-more">
            +{remainingCount} more
          </div>
        )}
      </div>
    </div>
  );
}
