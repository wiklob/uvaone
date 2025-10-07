import type { CalendarEvent } from '../../types/calendar';
import { formatTime, formatDate, parseISOToDate } from '../../utils/dateUtils';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EventPreviewProps {
  event: CalendarEvent;
  anchorElement: HTMLElement;
  onClose: () => void;
}

export default function EventPreview({ event, anchorElement, onClose }: EventPreviewProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const startTime = parseISOToDate(event.startTime);
  const endTime = parseISOToDate(event.endTime);

  useEffect(() => {
    const updatePosition = () => {
      const rect = anchorElement.getBoundingClientRect();
      const previewWidth = 320;
      const previewHeight = 400;
      const spacing = 8;

      let top = rect.top;
      let left = rect.right + spacing;

      // Check if it overflows right edge
      if (left + previewWidth > window.innerWidth) {
        left = rect.left - previewWidth - spacing;
      }

      // Check if it overflows bottom edge
      if (top + previewHeight > window.innerHeight) {
        top = window.innerHeight - previewHeight - spacing;
      }

      // Check if it overflows top edge
      if (top < spacing) {
        top = spacing;
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [anchorElement]);

  const getEventTypeIcon = (type: string): string => {
    switch (type) {
      case 'class': return '📚';
      case 'assignment': return '📝';
      case 'exam': return '🎯';
      case 'office-hours': return '👨‍🏫';
      case 'personal': return '📅';
      default: return '•';
    }
  };

  return (
    <>
      <div className="event-preview-modal" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
        <div className="event-preview-header">
          <div className="event-preview-title-row">
            <span className="event-preview-icon">{getEventTypeIcon(event.type)}</span>
            <h3 className="event-preview-title">{event.title}</h3>
          </div>
          <button className="event-preview-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="event-preview-body">
          <div className="event-preview-detail">
            <div className="event-preview-label">Date</div>
            <div className="event-preview-value">{formatDate(startTime)}</div>
          </div>

          <div className="event-preview-detail">
            <div className="event-preview-label">Time</div>
            <div className="event-preview-value">
              {event.isAllDay ? 'All Day' : `${formatTime(startTime)} - ${formatTime(endTime)}`}
            </div>
          </div>

          {event.location && (
            <div className="event-preview-detail">
              <div className="event-preview-label">Location</div>
              <div className="event-preview-value">📍 {event.location}</div>
            </div>
          )}

          {event.courseCode && (
            <div className="event-preview-detail">
              <div className="event-preview-label">Course</div>
              <div className="event-preview-value">{event.courseCode}</div>
            </div>
          )}

          {event.description && (
            <div className="event-preview-detail">
              <div className="event-preview-label">Description</div>
              <div className="event-preview-value">{event.description}</div>
            </div>
          )}

          <div className="event-preview-detail">
            <div className="event-preview-label">Type</div>
            <div className="event-preview-value">
              <span
                className="event-preview-type-badge"
                style={{
                  backgroundColor: `${event.color}20`,
                  color: event.color
                }}
              >
                {event.type}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
