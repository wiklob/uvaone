import type { ScheduleEvent, Assignment } from '../types/index';
import type { CalendarEvent } from '../types/calendar';

/**
 * Transforms a ScheduleEvent (recurring class) into CalendarEvents for a given month
 */
export function scheduleEventToCalendarEvents(
  scheduleEvent: ScheduleEvent,
  year: number,
  month: number
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map day index to actual dates in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    // Check if this day matches the schedule (0 = Sunday, 1 = Monday, etc.)
    if (dayOfWeek === scheduleEvent.day) {
      const [startHour, startMinute] = scheduleEvent.startTime.split(':').map(Number);
      const [endHour, endMinute] = scheduleEvent.endTime.split(':').map(Number);

      const startTime = new Date(year, month, day, startHour, startMinute);
      const endTime = new Date(year, month, day, endHour, endMinute);

      events.push({
        id: `${scheduleEvent.id}_${year}_${month}_${day}`,
        title: scheduleEvent.title,
        type: scheduleEvent.type as 'class' | 'office-hours',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location: scheduleEvent.location,
        color: scheduleEvent.color,
        isRecurring: true,
        recurrenceRule: 'WEEKLY'
      });
    }
  }

  return events;
}

/**
 * Transforms an Assignment into a CalendarEvent
 */
export function assignmentToCalendarEvent(assignment: Assignment): CalendarEvent {
  // Set due time to end of day (23:59)
  const dueDate = new Date(assignment.dueDate);
  dueDate.setHours(23, 59, 0, 0);

  // Also create a start time (beginning of day for all-day event feel)
  const startDate = new Date(assignment.dueDate);
  startDate.setHours(0, 0, 0, 0);

  return {
    id: `assignment_${assignment.id}`,
    title: assignment.title,
    type: assignment.type === 'exam' ? 'exam' : 'assignment',
    startTime: startDate.toISOString(),
    endTime: dueDate.toISOString(),
    courseCode: assignment.courseCode,
    description: `${assignment.type} for ${assignment.courseCode}`,
    color: getColorForAssignmentType(assignment.type),
    isRecurring: false,
    isAllDay: assignment.isAllDay ?? true
  };
}

/**
 * Get color based on assignment type
 */
function getColorForAssignmentType(type: 'assignment' | 'exam' | 'project'): string {
  switch (type) {
    case 'exam':
      return '#dc3545'; // Red/danger
    case 'project':
      return '#ff6b35'; // Orange
    case 'assignment':
      return '#17a2b8'; // Blue/info
    default:
      return '#666666';
  }
}

/**
 * Generates all calendar events for a given month from mockData
 */
export function generateMonthEvents(
  scheduleEvents: ScheduleEvent[],
  assignments: Assignment[],
  year: number,
  month: number
): CalendarEvent[] {
  const calendarEvents: CalendarEvent[] = [];

  // Add recurring class events
  scheduleEvents.forEach(scheduleEvent => {
    const classEvents = scheduleEventToCalendarEvents(scheduleEvent, year, month);
    calendarEvents.push(...classEvents);
  });

  // Add assignments that fall in this month
  assignments.forEach(assignment => {
    const assignmentDate = new Date(assignment.dueDate);
    if (assignmentDate.getFullYear() === year && assignmentDate.getMonth() === month) {
      calendarEvents.push(assignmentToCalendarEvent(assignment));
    }
  });

  return calendarEvents;
}
