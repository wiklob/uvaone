import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { EventWithDetails } from '../types/database';

// Demo user: Daan Peters (CS student)
const DEMO_USER_ID = '77777777-7777-7777-7777-777777777777';

export function useSchedule(startDate: Date, endDate: Date) {
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduleEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate dates
      if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn('Invalid dates provided to useSchedule');
        setEvents([]);
        setLoading(false);
        return;
      }

      // Get user's enrolled courses
      const { data: enrollments, error: enrollError } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('user_id', DEMO_USER_ID)
        .eq('role', 'student')
        .eq('status', 'active');

      if (enrollError) {
        console.error('Error fetching enrollments:', enrollError);
        throw new Error(`Failed to fetch enrollments: ${enrollError.message}`);
      }

      if (!enrollments || enrollments.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      const courseIds = enrollments.map(e => e.course_id);

      // Fetch events for the date range
      const { data: dbEvents, error: eventsError } = await supabase
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

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw new Error(`Failed to fetch events: ${eventsError.message}`);
      }

      // Expand recurring events within the date range
      const expandedEvents = expandRecurringEvents(dbEvents || [], startDate, endDate);

      setEvents(expandedEvents);
      setError(null);
    } catch (err) {
      console.error('Error fetching schedule events:', err);
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchScheduleEvents();
  }, [fetchScheduleEvents]);

  return {
    events,
    loading,
    error,
    refresh: fetchScheduleEvents
  };
}

// Expand recurring events within date range
function expandRecurringEvents(
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
    while (currentDate.getTime() <= Math.min(recurrenceEnd.getTime(), endDate.getTime())) {
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
