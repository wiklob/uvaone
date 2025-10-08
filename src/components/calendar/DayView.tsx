import { useState, useEffect, useRef } from 'react';
import type { CalendarEvent } from '../../types/calendar';
import { formatTime, formatDate, parseISOToDate, isSameDay } from '../../utils/dateUtils';
import EventPreview from './EventPreview';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

export default function DayView({ currentDate, events, onSelectEvent }: DayViewProps) {
  const [previewEvent, setPreviewEvent] = useState<CalendarEvent | null>(null);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Filter events for the selected day
  const dayEvents = events.filter(event => {
    const eventDate = parseISOToDate(event.startTime);
    return isSameDay(eventDate, currentDate);
  });

  // Separate all-day and timed events
  const allDayEvents = dayEvents.filter(e => e.isAllDay);
  const timedEvents = dayEvents.filter(e => !e.isAllDay);

  // Sort timed events by start time
  const sortedEvents = [...timedEvents].sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  // Time slots from 12 AM to 11 PM (24 hours)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Scroll to 10 AM on mount
  useEffect(() => {
    if (gridContainerRef.current) {
      const scrollHeight = gridContainerRef.current.scrollHeight;
      const targetPosition = (10 / 24) * scrollHeight - 100; // 10 AM, offset by 100px for better view
      gridContainerRef.current.scrollTop = targetPosition;
    }
  }, []);

  const getEventPosition = (event: CalendarEvent) => {
    const startDate = parseISOToDate(event.startTime);
    const endDate = parseISOToDate(event.endTime);

    const startHour = startDate.getHours() + startDate.getMinutes() / 60;
    const endHour = endDate.getHours() + endDate.getMinutes() / 60;

    // Position relative to 12 AM
    const top = (startHour / 24) * 100;
    const height = ((endHour - startHour) / 24) * 100;

    return { top: `${top}%`, height: `${Math.max(height, 4)}%` };
  };

  return (
    <div className="day-view">
      {allDayEvents.length > 0 && (
        <div className="day-all-day-section">
          <div className="day-all-day-label">All Day Events</div>
          <div className="day-all-day-list">
            {allDayEvents.map(event => (
              <div
                key={event.id}
                className="day-all-day-event"
                style={{ backgroundColor: event.color }}
                onClick={(e) => {
                  setPreviewEvent(event);
                  setAnchorElement(e.currentTarget);
                  onSelectEvent(event);
                }}
              >
                <div className="day-all-day-event-title">{event.title}</div>
                {event.location && (
                  <div className="day-all-day-event-location">📍 {event.location}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="day-view-grid" ref={gridContainerRef}>
        <div className="day-time-column">
          {hours.map(hour => (
            <div key={hour} className="day-time-slot">
              <span className="day-time-label">
                {hour === 0 ? '12:00 AM' : hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
              </span>
            </div>
          ))}
        </div>

        <div className="day-events-column">
          <div className="day-hours-grid">
            {hours.map(hour => (
              <div key={hour} className="day-hour-slot"></div>
            ))}
          </div>

          <div className="day-events-container">
            {sortedEvents.map(event => {
              const position = getEventPosition(event);
              const startTime = parseISOToDate(event.startTime);
              const endTime = parseISOToDate(event.endTime);

              return (
                <div
                  key={event.id}
                  className="day-event"
                  style={{
                    backgroundColor: event.color,
                    top: position.top,
                    height: position.height
                  }}
                  onClick={(e) => {
                    setPreviewEvent(event);
                    setAnchorElement(e.currentTarget);
                    onSelectEvent(event);
                  }}
                >
                  <div className="day-event-time">
                    {formatTime(startTime)} - {formatTime(endTime)}
                  </div>
                  <div className="day-event-title">{event.title}</div>
                  {event.location && (
                    <div className="day-event-location">📍 {event.location}</div>
                  )}
                  {event.description && (
                    <div className="day-event-description">{event.description}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {dayEvents.length === 0 && (
        <div className="day-view-empty">
          <div className="empty-icon">📅</div>
          <div className="empty-message">No events scheduled for this day</div>
        </div>
      )}

      {previewEvent && anchorElement && (
        <EventPreview
          event={previewEvent}
          anchorElement={anchorElement}
          onClose={() => {
            setPreviewEvent(null);
            setAnchorElement(null);
          }}
        />
      )}
    </div>
  );
}
