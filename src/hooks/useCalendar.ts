import { useState, useEffect, useMemo } from 'react';
import type { CalendarEvent, CalendarView, CalendarFilters, CalendarState } from '../types/calendar';
import { scheduleEvents, assignments } from '../data/mockData';
import { generateMonthEvents } from '../utils/eventTransformers';
import { eventService } from '../services/eventService';
import { addMonths } from '../utils/dateUtils';

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

  // Load personal events from localStorage
  useEffect(() => {
    const loadPersonalEvents = async () => {
      const events = await eventService.getEvents();
      setPersonalEvents(events);
    };
    loadPersonalEvents();
  }, []);

  // Generate system events (classes, assignments) for current month
  const systemEvents = useMemo(() => {
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    return generateMonthEvents(scheduleEvents, assignments, year, month);
  }, [state.currentDate]);

  // Combine all events
  const allEvents = useMemo(() => {
    return [...systemEvents, ...personalEvents];
  }, [systemEvents, personalEvents]);

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
  const goToNextMonth = () => {
    setState(prev => ({
      ...prev,
      currentDate: addMonths(prev.currentDate, 1)
    }));
  };

  const goToPrevMonth = () => {
    setState(prev => ({
      ...prev,
      currentDate: addMonths(prev.currentDate, -1)
    }));
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

    // Navigation
    goToNextMonth,
    goToPrevMonth,
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
