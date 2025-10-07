export type CalendarEventType = 'class' | 'assignment' | 'exam' | 'personal' | 'office-hours';

export type CalendarEvent = {
  id: string;
  title: string;
  type: CalendarEventType;
  startTime: string; // ISO format: "2025-01-08T10:00:00"
  endTime: string;
  location?: string;
  description?: string;
  courseCode?: string;
  color: string;
  isRecurring?: boolean;
  recurrenceRule?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recurrenceEndDate?: string;
  isAllDay?: boolean;
};

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export type CalendarFilters = {
  showClasses: boolean;
  showAssignments: boolean;
  showExams: boolean;
  showPersonal: boolean;
  showOfficeHours: boolean;
};

export type CalendarState = {
  currentDate: Date;
  view: CalendarView;
  selectedDate: Date | null;
  selectedEvent: CalendarEvent | null;
  filters: CalendarFilters;
};
