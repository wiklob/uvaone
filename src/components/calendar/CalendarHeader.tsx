import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarView } from '../../types/calendar';
import { getMonthName, getYear } from '../../utils/dateUtils';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
}

export default function CalendarHeader({
  currentDate,
  view,
  onPrevious,
  onNext,
  onToday,
  onViewChange
}: CalendarHeaderProps) {
  const monthName = getMonthName(currentDate);
  const year = getYear(currentDate);

  const getTitle = () => {
    if (view === 'day') {
      const weekday = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      const month = currentDate.toLocaleDateString('en-US', { month: 'long' });
      const day = currentDate.getDate();
      const year = currentDate.getFullYear();
      return `${weekday}, ${month} ${day}, ${year}`;
    }
    return `${monthName} ${year}`;
  };

  return (
    <div className="calendar-header">
      <div className="calendar-title-section">
        <h2 className="calendar-title">
          {getTitle()}
        </h2>
      </div>

      <div className="calendar-navigation">
        <button className="nav-btn" onClick={onPrevious} aria-label="Previous">
          <ChevronLeft size={20} />
        </button>
        <button className="today-btn" onClick={onToday}>
          Today
        </button>
        <button className="nav-btn" onClick={onNext} aria-label="Next">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="calendar-view-switcher">
        <button
          className={`view-btn ${view === 'month' ? 'active' : ''}`}
          onClick={() => onViewChange('month')}
        >
          Month
        </button>
        <button
          className={`view-btn ${view === 'week' ? 'active' : ''}`}
          onClick={() => onViewChange('week')}
        >
          Week
        </button>
        <button
          className={`view-btn ${view === 'day' ? 'active' : ''}`}
          onClick={() => onViewChange('day')}
        >
          Day
        </button>
        <button
          className={`view-btn ${view === 'agenda' ? 'active' : ''}`}
          onClick={() => onViewChange('agenda')}
        >
          Agenda
        </button>
      </div>
    </div>
  );
}
