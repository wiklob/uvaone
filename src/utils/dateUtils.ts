/**
 * Date utility functions for calendar operations
 */

export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function getFirstDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

export function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long' });
}

export function getYear(date: Date): number {
  return date.getFullYear();
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

export function startOfWeek(date: Date): Date {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day;
  return new Date(newDate.setDate(diff));
}

export function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  return addDays(start, 6);
}

export function getCalendarDays(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = getFirstDayOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const daysInPrevMonth = getDaysInMonth(new Date(year, month - 1));

  const days: Date[] = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, daysInPrevMonth - i));
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  // Next month days to complete the grid (6 weeks = 42 days)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function parseISOToDate(isoString: string): Date {
  return new Date(isoString);
}

export function getWeekDays(): string[] {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}
