import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopTabBar.css';

interface TopTabBarProps {
  selectedTab: string;
  courseId: string | 'all';
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'timeline', label: 'Timeline', icon: '📅' },
  { id: 'grades', label: 'Grades', icon: '📝' },
  { id: 'assignments', label: 'Assign', icon: '📚' },
  { id: 'materials', label: 'Matl', icon: '📄' },
  { id: 'announcements', label: 'Anno', icon: '📢' }
];

export default function TopTabBar({ selectedTab, courseId }: TopTabBarProps) {
  const navigate = useNavigate();
  const tabBarRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tabId: string) => {
    // Haptic feedback (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    // Navigate with slide animation
    const basePath = courseId === 'all'
      ? `/courses/${tabId === 'overview' ? 'all_courses' : tabId}`
      : `/course/${courseId}/${tabId}`;

    navigate(basePath);
  };

  // Animate indicator on tab change
  useEffect(() => {
    // Map 'all_courses' to 'overview'
    const normalizedTab = selectedTab === 'all_courses' ? 'overview' : selectedTab;
    const selectedIndex = tabs.findIndex(t => t.id === normalizedTab);

    if (selectedIndex === -1) return;

    if (indicatorRef.current && tabBarRef.current) {
      const tabWidth = tabBarRef.current.offsetWidth / tabs.length;
      const offset = selectedIndex * tabWidth;

      // Smooth spring animation
      indicatorRef.current.style.transform = `translateX(${offset}px)`;

      // Scroll active tab into view
      const activeTab = tabBarRef.current.children[0]?.children[selectedIndex] as HTMLElement;
      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }
    }
  }, [selectedTab]);

  // Map 'all_courses' to 'overview' for active state
  const normalizedSelectedTab = selectedTab === 'all_courses' ? 'overview' : selectedTab;

  return (
    <div className="top-tab-bar" ref={tabBarRef}>
      <div className="tab-bar-scroll">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${normalizedSelectedTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Sliding indicator */}
      <div
        ref={indicatorRef}
        className="tab-indicator"
      />
    </div>
  );
}
