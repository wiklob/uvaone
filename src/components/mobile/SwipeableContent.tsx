import { useState, type ReactNode } from 'react';
import './SwipeableContent.css';

interface SwipeableContentProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export default function SwipeableContent({
  children,
  onSwipeLeft,
  onSwipeRight
}: SwipeableContentProps) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const minSwipeDistance = 75; // Min distance for swipe (increased for better UX)

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);

    // Update drag offset for visual feedback (with resistance)
    const offset = currentTouch - touchStart;
    // Add resistance: divide by 3 to make it feel more natural
    setDragOffset(Math.max(-100, Math.min(100, offset / 3)));
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }

    // Reset with animation
    setIsDragging(false);
    setDragOffset(0);
  };

  return (
    <div
      className="swipeable-content"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        transform: `translateX(${dragOffset}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'
      }}
    >
      {children}
    </div>
  );
}
