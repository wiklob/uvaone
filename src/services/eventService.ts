import type { CalendarEvent } from '../types/calendar';

/**
 * Event Service Interface
 * This abstraction allows easy swapping between localStorage and database (Supabase)
 */
export interface EventService {
  getEvents(): Promise<CalendarEvent[]>;
  getEvent(id: string): Promise<CalendarEvent | null>;
  createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>;
  updateEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteEvent(id: string): Promise<void>;
  getEventsByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
}

/**
 * LocalStorage Implementation
 * Stores user's personal events in browser localStorage
 */
class LocalStorageEventService implements EventService {
  private readonly STORAGE_KEY = 'uva_user_events';

  private getStoredEvents(): CalendarEvent[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private setStoredEvents(events: CalendarEvent[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
  }

  async getEvents(): Promise<CalendarEvent[]> {
    return this.getStoredEvents();
  }

  async getEvent(id: string): Promise<CalendarEvent | null> {
    const events = this.getStoredEvents();
    return events.find(e => e.id === id) || null;
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const events = this.getStoredEvents();
    const newEvent: CalendarEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    events.push(newEvent);
    this.setStoredEvents(events);
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const events = this.getStoredEvents();
    const index = events.findIndex(e => e.id === id);

    if (index === -1) {
      throw new Error(`Event with id ${id} not found`);
    }

    const updatedEvent = { ...events[index], ...updates };
    events[index] = updatedEvent;
    this.setStoredEvents(events);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    const events = this.getStoredEvents();
    const filtered = events.filter(e => e.id !== id);
    this.setStoredEvents(filtered);
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const events = this.getStoredEvents();
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }
}

// Export the current implementation
// To switch to Supabase later, just create SupabaseEventService and swap here
export const eventService: EventService = new LocalStorageEventService();
