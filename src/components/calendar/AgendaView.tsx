import { useState } from 'react';
import type { CalendarEvent } from '../../types/calendar';
import { formatTime, parseISOToDate, isToday, isSameDay, addDays } from '../../utils/dateUtils';
import EventPreview from './EventPreview';

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

export default function AgendaView({ events, onSelectEvent }: AgendaViewProps) {
  const [previewEvent, setPreviewEvent] = useState<CalendarEvent | null>(null);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);

  // Get events for the next 30 days
  const today = new Date();
  const futureEvents = events.filter(event => {
    const eventDate = parseISOToDate(event.startTime);
    return eventDate >= today;
  });

  // Sort by date and time
  const sortedEvents = [...futureEvents].sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  // Group events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  sortedEvents.forEach(event => {
    const eventDate = parseISOToDate(event.startTime);
    const dateKey = eventDate.toDateString();
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push(event);
  });

  const getDateLabel = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isSameDay(date, addDays(today, 1))) return 'Tomorrow';

    const daysDiff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const getEventTypeIcon = (type: string): string => {
    switch (type) {
      case 'class': return '📚';
      case 'assignment': return '📝';
      case 'exam': return '🎯';
      case 'office-hours': return '👨‍🏫';
      case 'personal': return '📅';
      default: return '•';
    }
  };

  return (
    <div className="agenda-view">
      <div className="agenda-header">
        <h3 className="agenda-title">Upcoming Events</h3>
        <div className="agenda-count">
          {sortedEvents.length} {sortedEvents.length === 1 ? 'event' : 'events'}
        </div>
      </div>

      <div className="agenda-list">
        {Object.entries(eventsByDate).length === 0 ? (
          <div className="agenda-empty">
            <div className="empty-icon">📅</div>
            <div className="empty-message">No upcoming events</div>
            <div className="empty-hint">Events you create will appear here</div>
          </div>
        ) : (
          Object.entries(eventsByDate).map(([dateKey, dayEvents]) => {
            const date = new Date(dateKey);
            const dateLabel = getDateLabel(date);
            const isCurrentDay = isToday(date);

            return (
              <div key={dateKey} className="agenda-day-section">
                <div className={`agenda-day-header ${isCurrentDay ? 'today' : ''}`}>
                  <div className="agenda-day-label">{dateLabel}</div>
                  <div className="agenda-day-date">
                    {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                <div className="agenda-day-events">
                  {dayEvents.map(event => {
                    const startTime = parseISOToDate(event.startTime);
                    const endTime = parseISOToDate(event.endTime);

                    return (
                      <div
                        key={event.id}
                        className="agenda-event"
                        onClick={(e) => {
                          setPreviewEvent(event);
                          setAnchorElement(e.currentTarget);
                          onSelectEvent(event);
                        }}
                      >
                        <div
                          className="agenda-event-indicator"
                          style={{ backgroundColor: event.color }}
                        ></div>

                        <div className="agenda-event-time">
                          {event.isAllDay ? (
                            <>
                              <div className="agenda-event-start">All Day</div>
                              <div className="agenda-event-duration"></div>
                            </>
                          ) : (
                            <>
                              <div className="agenda-event-start">{formatTime(startTime)}</div>
                              <div className="agenda-event-duration">
                                {Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))} min
                              </div>
                            </>
                          )}
                        </div>

                        <div className="agenda-event-details">
                          <div className="agenda-event-header">
                            <span className="agenda-event-icon">{getEventTypeIcon(event.type)}</span>
                            <span className="agenda-event-title">{event.title}</span>
                            {event.courseCode && (
                              <span className="agenda-event-course">{event.courseCode}</span>
                            )}
                          </div>

                          {event.location && (
                            <div className="agenda-event-location">
                              📍 {event.location}
                            </div>
                          )}

                          {event.description && (
                            <div className="agenda-event-description">
                              {event.description}
                            </div>
                          )}
                        </div>

                        <div className="agenda-event-type">
                          <span className="type-badge" style={{
                            backgroundColor: `${event.color}20`,
                            color: event.color
                          }}>
                            {event.type}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
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
