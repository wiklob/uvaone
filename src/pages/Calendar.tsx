import { useCalendar } from '../hooks/useCalendar';
import CalendarHeader from '../components/calendar/CalendarHeader';
import MonthView from '../components/calendar/MonthView';
import WeekView from '../components/calendar/WeekView';
import DayView from '../components/calendar/DayView';
import AgendaView from '../components/calendar/AgendaView';
import './Calendar.css';

export default function Calendar() {
  const {
    currentDate,
    view,
    selectedDate,
    events,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    setView,
    selectDate,
    selectEvent
  } = useCalendar();

  return (
    <div className="page calendar-page">
      <div className="calendar-container">
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onPrevious={goToPrevMonth}
          onNext={goToNextMonth}
          onToday={goToToday}
          onViewChange={setView}
        />

        <div className="calendar-content">
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={events}
              selectedDate={selectedDate}
              onSelectDate={selectDate}
              onSelectEvent={selectEvent}
              onDayClick={(date) => {
                selectDate(date);
                setView('day');
              }}
            />
          )}
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onSelectEvent={selectEvent}
            />
          )}
          {view === 'day' && (
            <DayView
              currentDate={selectedDate || currentDate}
              events={events}
              onSelectEvent={selectEvent}
            />
          )}
          {view === 'agenda' && (
            <AgendaView
              currentDate={currentDate}
              events={events}
              onSelectEvent={selectEvent}
            />
          )}
        </div>
      </div>
    </div>
  );
}
