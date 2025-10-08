import { useState, useEffect, useRef } from 'react';
import type { CalendarEvent } from '../../types/calendar';
import { startOfWeek, addDays, formatTime, parseISOToDate, isSameDay } from '../../utils/dateUtils';
import EventPreview from './EventPreview';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onDayClick?: (date: Date) => void;
}

export default function WeekView({ currentDate, events, onSelectEvent, onDayClick }: WeekViewProps) {
  const [previewEvent, setPreviewEvent] = useState<CalendarEvent | null>(null);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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

  // Separate all-day and timed events
  const allDayEvents = events.filter(e => e.isAllDay);
  const timedEvents = events.filter(e => !e.isAllDay);

  // Group timed events by day
  const eventsByDay = timedEvents.reduce((acc, event) => {
    const eventDate = new Date(event.startTime);
    const dayIndex = weekDays.findIndex(day => isSameDay(day, eventDate));
    if (dayIndex !== -1) {
      if (!acc[dayIndex]) acc[dayIndex] = [];
      acc[dayIndex].push(event);
    }
    return acc;
  }, {} as Record<number, CalendarEvent[]>);

  // Group all-day events by day
  const allDayEventsByDay = allDayEvents.reduce((acc, event) => {
    const eventDate = new Date(event.startTime);
    const dayIndex = weekDays.findIndex(day => isSameDay(day, eventDate));
    if (dayIndex !== -1) {
      if (!acc[dayIndex]) acc[dayIndex] = [];
      acc[dayIndex].push(event);
    }
    return acc;
  }, {} as Record<number, CalendarEvent[]>);

  const getEventPosition = (event: CalendarEvent) => {
    const startDate = parseISOToDate(event.startTime);
    const endDate = parseISOToDate(event.endTime);

    const startHour = startDate.getHours() + startDate.getMinutes() / 60;
    const endHour = endDate.getHours() + endDate.getMinutes() / 60;

    // Position relative to 12 AM (start of grid)
    const top = (startHour / 24) * 100;
    const height = ((endHour - startHour) / 24) * 100;

    return { top: `${top}%`, height: `${height}%` };
  };

  return (
    <div className="week-view">
      <div className="week-header">
        <div className="time-column-header"></div>
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="week-day-header"
            onClick={() => onDayClick?.(day)}
            style={{ cursor: onDayClick ? 'pointer' : 'default' }}
          >
            <div className="week-day-name">
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="week-day-date">{day.getDate()}</div>
          </div>
        ))}
      </div>

      {allDayEvents.length > 0 && (
        <div className="week-all-day-section">
          <div className="week-all-day-label">All Day</div>
          <div className="week-all-day-events">
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className="week-all-day-column">
                {allDayEventsByDay[dayIndex]?.map(event => (
                  <div
                    key={event.id}
                    className="week-all-day-event"
                    style={{ backgroundColor: event.color }}
                    onClick={(e) => {
                      setPreviewEvent(event);
                      setAnchorElement(e.currentTarget);
                      onSelectEvent(event);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="week-grid-container" ref={gridContainerRef}>
        <div className="week-time-column">
          {hours.map(hour => (
            <div key={hour} className="time-slot">
              {hour === 0 ? '12:00 AM' : hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
            </div>
          ))}
        </div>

        <div className="week-days-grid">
          {weekDays.map((day, dayIndex) => (
            <div key={dayIndex} className="week-day-column">
              <div className="week-day-hours">
                {hours.map(hour => (
                  <div key={hour} className="hour-slot"></div>
                ))}
              </div>
              <div className="week-day-events">
                {eventsByDay[dayIndex]?.map(event => {
                  const position = getEventPosition(event);
                  return (
                    <div
                      key={event.id}
                      className="week-event"
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
                      <div className="week-event-title">{event.title}</div>
                      {event.location && (
                        <div className="week-event-location">{event.location}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
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
