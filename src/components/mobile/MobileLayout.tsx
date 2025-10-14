import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import TopTabBar from './TopTabBar';
import SwipeableContent from './SwipeableContent';
import GlobalBottomNav from './GlobalBottomNav';
import './MobileLayout.css';

interface MobileLayoutProps {
  children: ReactNode;
  showTopTabBar?: boolean;
  selectedTab?: string;
  courseId?: string | 'all';
}

const tabs = ['overview', 'timeline', 'grades', 'assignments', 'materials', 'announcements'];

export default function MobileLayout({
  children,
  showTopTabBar = false,
  selectedTab,
  courseId
}: MobileLayoutProps) {
  const navigate = useNavigate();

  const handleSwipeLeft = () => {
    if (!showTopTabBar || !selectedTab || !courseId) return;

    // Map 'all_courses' to 'overview'
    const normalizedTab = selectedTab === 'all_courses' ? 'overview' : selectedTab;
    const currentIndex = tabs.indexOf(normalizedTab);

    if (currentIndex < tabs.length - 1) {
      const nextTab = tabs[currentIndex + 1];
      const basePath = courseId === 'all'
        ? `/courses/${nextTab === 'overview' ? 'all_courses' : nextTab}`
        : `/course/${courseId}/${nextTab}`;
      navigate(basePath);
    }
  };

  const handleSwipeRight = () => {
    if (!showTopTabBar || !selectedTab || !courseId) return;

    // Map 'all_courses' to 'overview'
    const normalizedTab = selectedTab === 'all_courses' ? 'overview' : selectedTab;
    const currentIndex = tabs.indexOf(normalizedTab);

    if (currentIndex > 0) {
      const prevTab = tabs[currentIndex - 1];
      const basePath = courseId === 'all'
        ? `/courses/${prevTab === 'overview' ? 'all_courses' : prevTab}`
        : `/course/${courseId}/${prevTab}`;
      navigate(basePath);
    }
  };

  return (
    <div className="mobile-layout">
      {/* Top Tab Bar - only on course pages */}
      {showTopTabBar && selectedTab && courseId && (
        <TopTabBar selectedTab={selectedTab} courseId={courseId} />
      )}

      {/* Swipeable Content Container */}
      {showTopTabBar ? (
        <SwipeableContent
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        >
          {children}
        </SwipeableContent>
      ) : (
        <div className="mobile-content">
          {children}
        </div>
      )}

      {/* Bottom Global Nav - always visible */}
      <GlobalBottomNav />
    </div>
  );
}
