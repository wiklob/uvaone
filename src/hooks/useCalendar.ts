import { useState, useEffect, useMemo } from 'react';
import type { CalendarEvent, CalendarView, CalendarFilters, CalendarState } from '../types/calendar';
import type { EventWithDetails, AssignmentWithSubmission } from '../types/database';
import { eventService } from '../services/eventService';
import { addMonths, addWeeks, addDays } from '../utils/dateUtils';
import { supabase } from '../lib/supabase';

// Demo user: Daan Peters (CS student)
const DEMO_USER_ID = '77777777-7777-7777-7777-777777777777';

export function useCalendar() {
  const [state, setState] = useState<CalendarState>({
    currentDate: new Date(),
    view: 'month',
    selectedDate: null,
    selectedEvent: null,
    filters: {
      showClasses: true,
      showAssignments: true,
      showExams: true,
      showPersonal: true,
      showOfficeHours: true
    }
  });

  const [personalEvents, setPersonalEvents] = useState<CalendarEvent[]>([]);
  const [dbEvents, setDbEvents] = useState<EventWithDetails[]>([]);
  const [dbAssignments, setDbAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Load personal events from localStorage
  useEffect(() => {
    const loadPersonalEvents = async () => {
      const events = await eventService.getEvents();
      setPersonalEvents(events);
    };
    loadPersonalEvents();
  }, []);

  // Load database events and assignments for current month
  useEffect(() => {
    loadDatabaseEvents();
  }, [state.currentDate]);

  const loadDatabaseEvents = async () => {
    try {
      setLoading(true);

      // Calculate date range for current view (with padding)
      const startDate = getViewStartDate(state.currentDate, state.view);
      const endDate = getViewEndDate(state.currentDate, state.view);

      // Fetch actual data from Supabase
      const [events, assignments] = await Promise.all([
        fetchDatabaseEvents(startDate, endDate),
        fetchDatabaseAssignments(startDate, endDate)
      ]);

      setDbEvents(events);
      setDbAssignments(assignments);
    } catch (error) {
      console.error('Error loading database events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert database events to calendar events
  const convertedDbEvents = useMemo(() => {
    return dbEvents.map(event => convertEventToCalendarEvent(event));
  }, [dbEvents]);

  // Convert assignments to calendar events
  const convertedAssignments = useMemo(() => {
    return dbAssignments.map(assignment => convertAssignmentToCalendarEvent(assignment));
  }, [dbAssignments]);

  // Combine all events
  const allEvents = useMemo(() => {
    return [...convertedDbEvents, ...convertedAssignments, ...personalEvents];
  }, [convertedDbEvents, convertedAssignments, personalEvents]);

  // Filter events based on active filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      switch (event.type) {
        case 'class':
          return state.filters.showClasses;
        case 'assignment':
          return state.filters.showAssignments;
        case 'exam':
          return state.filters.showExams;
        case 'personal':
          return state.filters.showPersonal;
        case 'office-hours':
          return state.filters.showOfficeHours;
        default:
          return true;
      }
    });
  }, [allEvents, state.filters]);

  // Navigation functions
  const goToNext = () => {
    setState(prev => {
      let newDate: Date;
      switch (prev.view) {
        case 'month':
          newDate = addMonths(prev.currentDate, 1);
          break;
        case 'week':
          newDate = addWeeks(prev.currentDate, 1);
          break;
        case 'day':
          newDate = addDays(prev.currentDate, 1);
          break;
        case 'agenda':
          newDate = addMonths(prev.currentDate, 1);
          break;
        default:
          newDate = prev.currentDate;
      }
      return { ...prev, currentDate: newDate };
    });
  };

  const goToPrevious = () => {
    setState(prev => {
      let newDate: Date;
      switch (prev.view) {
        case 'month':
          newDate = addMonths(prev.currentDate, -1);
          break;
        case 'week':
          newDate = addWeeks(prev.currentDate, -1);
          break;
        case 'day':
          newDate = addDays(prev.currentDate, -1);
          break;
        case 'agenda':
          newDate = addMonths(prev.currentDate, -1);
          break;
        default:
          newDate = prev.currentDate;
      }
      return { ...prev, currentDate: newDate };
    });
  };

  const goToToday = () => {
    setState(prev => ({
      ...prev,
      currentDate: new Date(),
      selectedDate: new Date()
    }));
  };

  const setView = (view: CalendarView) => {
    setState(prev => ({ ...prev, view }));
  };

  const selectDate = (date: Date | null) => {
    setState(prev => ({ ...prev, selectedDate: date }));
  };

  const selectEvent = (event: CalendarEvent | null) => {
    setState(prev => ({ ...prev, selectedEvent: event }));
  };

  const updateFilters = (filters: Partial<CalendarFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters }
    }));
  };

  // CRUD operations for personal events
  const createPersonalEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = await eventService.createEvent(event);
    setPersonalEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const updatePersonalEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    const updatedEvent = await eventService.updateEvent(id, updates);
    setPersonalEvents(prev =>
      prev.map(e => (e.id === id ? updatedEvent : e))
    );
    return updatedEvent;
  };

  const deletePersonalEvent = async (id: string) => {
    await eventService.deleteEvent(id);
    setPersonalEvents(prev => prev.filter(e => e.id !== id));
  };

  return {
    // State
    currentDate: state.currentDate,
    view: state.view,
    selectedDate: state.selectedDate,
    selectedEvent: state.selectedEvent,
    filters: state.filters,
    events: filteredEvents,
    loading,

    // Navigation
    goToNext,
    goToPrevious,
    goToToday,
    setView,
    selectDate,
    selectEvent,
    updateFilters,

    // CRUD
    createPersonalEvent,
    updatePersonalEvent,
    deletePersonalEvent
  };
}

// Helper functions
function getViewStartDate(currentDate: Date, view: CalendarView): Date {
  const date = new Date(currentDate);

  switch (view) {
    case 'month':
      // Start of month, extended to start of week
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      const dayOfWeek = date.getDay();
      date.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      return date;

    case 'week':
      // Start of week (Monday)
      date.setHours(0, 0, 0, 0);
      const day = date.getDay();
      date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
      return date;

    case 'day':
      date.setHours(0, 0, 0, 0);
      return date;

    case 'agenda':
      // Start of month
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return date;

    default:
      return date;
  }
}

function getViewEndDate(currentDate: Date, view: CalendarView): Date {
  const date = new Date(currentDate);

  switch (view) {
    case 'month':
      // End of month, extended to end of week
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
      date.setHours(23, 59, 59, 999);
      const dayOfWeek = date.getDay();
      date.setDate(date.getDate() + (dayOfWeek === 0 ? 0 : 7 - dayOfWeek));
      return date;

    case 'week':
      // End of week (Sunday)
      date.setHours(23, 59, 59, 999);
      const day = date.getDay();
      date.setDate(date.getDate() + (day === 0 ? 0 : 7 - day));
      return date;

    case 'day':
      date.setHours(23, 59, 59, 999);
      return date;

    case 'agenda':
      // End of month + 1 month
      date.setMonth(date.getMonth() + 2);
      date.setDate(0);
      date.setHours(23, 59, 59, 999);
      return date;

    default:
      return date;
  }
}

function getCourseColor(courseCode: string): string {
  const colors = ['#0066cc', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1'];
  const hash = courseCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function convertEventToCalendarEvent(event: EventWithDetails): CalendarEvent {
  const lessonType = event.lesson.type;
  let calendarType: CalendarEvent['type'] = 'class';

  if (lessonType === 'exam') {
    calendarType = 'exam';
  } else if (lessonType === 'tutorial') {
    calendarType = 'office-hours';
  }

  return {
    id: event.id,
    title: `${event.lesson.course.code}: ${event.lesson.title}`,
    type: calendarType,
    startTime: event.start_time,
    endTime: event.end_time,
    location: event.is_online
      ? (event.online_link || 'Online')
      : event.lesson.room
      ? `${event.lesson.room.facility?.name} ${event.lesson.room.name}`
      : 'TBA',
    description: event.description || undefined,
    courseCode: event.lesson.course.code,
    color: getCourseColor(event.lesson.course.code),
    isRecurring: event.is_recurring,
    recurrenceRule: event.recurrence_rule || undefined,
    recurrenceEndDate: event.recurrence_end_date || undefined,
    isAllDay: false
  };
}

function convertAssignmentToCalendarEvent(assignment: AssignmentWithSubmission): CalendarEvent {
  const submission = assignment.submission?.[0];
  const isSubmitted = submission && submission.status !== 'draft';

  return {
    id: `assignment-${assignment.id}`,
    title: `${assignment.course?.code}: ${assignment.title}`,
    type: assignment.type === 'exam' ? 'exam' : 'assignment',
    startTime: assignment.due_date!,
    endTime: assignment.due_date!,
    description: assignment.description || undefined,
    courseCode: assignment.course?.code,
    color: assignment.course ? getCourseColor(assignment.course.code) : '#6c757d',
    isAllDay: true,
    isRecurring: false
  };
}

// Database fetch functions
async function fetchDatabaseEvents(startDate: Date, endDate: Date): Promise<EventWithDetails[]> {
  // Get user's enrolled courses
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('course_id')
    .eq('user_id', DEMO_USER_ID)
    .eq('role', 'student')
    .eq('status', 'active');

  if (!enrollments || enrollments.length === 0) return [];

  const courseIds = enrollments.map(e => e.course_id);

  // Fetch all events for user's courses (we'll filter recurring events client-side)
  const { data: events, error } = await supabase
    .from('event')
    .select(`
      *,
      lesson!inner(
        *,
        course!inner(*),
        room(
          *,
          facility(*)
        )
      )
    `)
    .in('lesson.course_id', courseIds)
    .order('start_time', { ascending: true });

  if (error) throw error;

  // Expand recurring events for the date range
  return expandRecurringEventsForCalendar(events || [], startDate, endDate);
}

async function fetchDatabaseAssignments(startDate: Date, endDate: Date): Promise<AssignmentWithSubmission[]> {
  // Get user's enrolled courses
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('course_id')
    .eq('user_id', DEMO_USER_ID)
    .eq('role', 'student')
    .eq('status', 'active');

  if (!enrollments || enrollments.length === 0) return [];

  const courseIds = enrollments.map(e => e.course_id);

  const { data: assignments, error } = await supabase
    .from('assignment')
    .select(`
      *,
      course(*),
      submission(*)
    `)
    .in('course_id', courseIds)
    .eq('published', true)
    .gte('due_date', startDate.toISOString())
    .lte('due_date', endDate.toISOString())
    .eq('submission.user_id', DEMO_USER_ID)
    .order('due_date', { ascending: true });

  if (error) throw error;

  return (assignments || []).map(a => ({
    ...a,
    submission: Array.isArray(a.submission) ? a.submission : (a.submission ? [a.submission] : [])
  })) as AssignmentWithSubmission[];
}

// Expand recurring events for calendar
function expandRecurringEventsForCalendar(
  events: EventWithDetails[],
  startDate: Date,
  endDate: Date
): EventWithDetails[] {
  const expanded: EventWithDetails[] = [];

  events.forEach(event => {
    if (!event.is_recurring) {
      // Only include non-recurring events if they're in range
      const eventDate = new Date(event.start_time);
      if (eventDate >= startDate && eventDate <= endDate) {
        expanded.push(event);
      }
      return;
    }

    // Generate recurring instances
    const eventStart = new Date(event.start_time);
    const recurrenceEnd = event.recurrence_end_date
      ? new Date(event.recurrence_end_date)
      : endDate;

    let currentDate = new Date(eventStart);

    // Start from the first occurrence within or before the range
    while (currentDate > startDate && currentDate.getTime() > new Date(event.start_time).getTime()) {
      currentDate = getPreviousOccurrence(currentDate, event.recurrence_rule!);
    }

    // Generate instances within range
    while (currentDate <= Math.min(recurrenceEnd.getTime(), endDate.getTime())) {
      if (currentDate >= startDate) {
        const instanceStartTime = new Date(currentDate);
        const instanceEndTime = new Date(currentDate);

        const originalStart = new Date(event.start_time);
        const originalEnd = new Date(event.end_time);

        instanceStartTime.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);
        instanceEndTime.setHours(originalEnd.getHours(), originalEnd.getMinutes(), 0, 0);

        expanded.push({
          ...event,
          id: `${event.id}-${instanceStartTime.toISOString()}`,
          start_time: instanceStartTime.toISOString(),
          end_time: instanceEndTime.toISOString()
        });
      }

      currentDate = getNextOccurrence(currentDate, event.recurrence_rule!);
    }
  });

  return expanded.sort((a, b) =>
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
}

function getNextOccurrence(date: Date, rule: string): Date {
  const next = new Date(date);

  switch (rule) {
    case 'DAILY':
      next.setDate(next.getDate() + 1);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + 7);
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1);
      break;
  }

  return next;
}

function getPreviousOccurrence(date: Date, rule: string): Date {
  const prev = new Date(date);

  switch (rule) {
    case 'DAILY':
      prev.setDate(prev.getDate() - 1);
      break;
    case 'WEEKLY':
      prev.setDate(prev.getDate() - 7);
      break;
    case 'MONTHLY':
      prev.setMonth(prev.getMonth() - 1);
      break;
  }

  return prev;
}
