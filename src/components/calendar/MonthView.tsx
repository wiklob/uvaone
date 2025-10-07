import { useState } from 'react';
import type { CalendarEvent } from '../../types/calendar';
import { getCalendarDays, getWeekDays, isSameDay } from '../../utils/dateUtils';
import DayCell from './DayCell';
import EventPreview from './EventPreview';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onDayClick?: (date: Date) => void;
}

export default function MonthView({
  currentDate,
  events,
  selectedDate,
  onSelectDate,
  onSelectEvent,
  onDayClick
}: MonthViewProps) {
  const [previewEvent, setPreviewEvent] = useState<CalendarEvent | null>(null);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const calendarDays = getCalendarDays(currentDate);
  const weekDays = getWeekDays();

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const eventDate = new Date(event.startTime);
    const dateKey = eventDate.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  return (
    <div className="month-view">
      <div className="weekday-header">
        {weekDays.map(day => (
          <div key={day} className="weekday-label">
            {day}
          </div>
        ))}
      </div>
      <div className="month-grid">
        {calendarDays.map((date, index) => {
          const dateKey = date.toDateString();
          const dayEvents = eventsByDate[dateKey] || [];
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

          return (
            <DayCell
              key={index}
              date={date}
              events={dayEvents}
              isCurrentMonth={isCurrentMonth}
              isSelected={isSelected}
              onSelectDate={onSelectDate}
              onSelectEvent={(event, element) => {
                setPreviewEvent(event);
                setAnchorElement(element);
                onSelectEvent(event);
              }}
              onDayClick={onDayClick}
            />
          );
        })}
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
