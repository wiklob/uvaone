import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, useMotionValue, type PanInfo } from 'framer-motion';
import './TopTabBar.css';

interface TopTabBarProps {
  selectedTab: string;
  courseId: string | 'all';
}

interface Tab {
  id: string;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: '' },
  { id: 'timeline', label: 'Timeline', icon: '' },
  { id: 'grades', label: 'Grades', icon: '' },
  { id: 'assignments', label: 'Assignments', icon: '' },
  { id: 'materials', label: 'Materials', icon: '' },
  { id: 'announcements', label: 'Announcements', icon: '' }
];

export default function TopTabBar({ selectedTab, courseId }: TopTabBarProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);

  // Track if animation is from user interaction to prevent double animations
  const isUserAnimatingRef = useRef(false);

  // Normalize 'all_courses' to 'overview'
  const normalizedTab = selectedTab === 'all_courses' ? 'overview' : selectedTab;

  // Derive current index from selectedTab prop - single source of truth
  const currentIndex = tabs.findIndex(tab => tab.id === normalizedTab);
  const controls = useAnimation();
  const x = useMotionValue(0);

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const snapToTab = useCallback(async (index: number, animate: boolean = true) => {
    if (!tabRefs.current[index] || containerWidth === 0) return;

    // Get the tab element
    const tabElement = tabRefs.current[index];
    if (!tabElement) return;

    // Get tab's position relative to its parent
    const tabRect = tabElement.getBoundingClientRect();
    const trackRect = trackRef.current?.getBoundingClientRect();

    if (!trackRect) return;

    // Calculate the tab's center position relative to the track
    const tabCenterInTrack = (tabRect.left - trackRect.left) + (tabRect.width / 2);

    // Calculate how much to move the track to center this tab
    const containerCenter = containerWidth / 2;
    const targetX = containerCenter - tabCenterInTrack;

    // Haptic feedback simulation
    if (animate && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    if (animate) {
      await controls.start({
        x: targetX,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 35,
          mass: 0.7,
        }
      });
    } else {
      controls.set({ x: targetX });
    }
  }, [containerWidth, controls, x]);

  // Snap to current tab when selectedTab changes or container resizes
  useEffect(() => {
    // Only snap if NOT from user interaction
    if (!isUserAnimatingRef.current && containerWidth > 0 && currentIndex !== -1) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        snapToTab(currentIndex, false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, containerWidth, snapToTab]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Calculate average tab width for determining how many tabs were crossed
    const averageTabWidth = 100; // Approximate width including gap

    // Calculate how many tabs to move based on drag distance
    const dragDistance = Math.abs(info.offset.x);
    const tabsCrossed = Math.floor(dragDistance / averageTabWidth);
    const remainder = (dragDistance % averageTabWidth) / averageTabWidth;

    // Determine final movement based on distance and velocity
    let tabsToMove = tabsCrossed;

    // If we're more than 40% into the next tab, or have high velocity, move to it
    if (remainder > 0.4 || Math.abs(info.velocity.x) > 200) {
      tabsToMove += 1;
    }

    // Apply direction
    const direction = info.offset.x > 0 ? -1 : 1;
    tabsToMove = tabsToMove * direction;

    // Calculate target index
    const targetIndex = Math.max(0, Math.min(tabs.length - 1, currentIndex + tabsToMove));

    if (targetIndex !== currentIndex) {
      // Mark as user animation
      isUserAnimatingRef.current = true;
      handleTabChange(tabs[targetIndex].id);

      // Always ensure proper centering with animation
      snapToTab(targetIndex, true).then(() => {
        // Reset after animation completes
        isUserAnimatingRef.current = false;
      });
    } else {
      // Always animate back to center
      snapToTab(currentIndex, true);
    }
  };

  const handleTabClick = (index: number) => {
    if (index !== currentIndex) {
      // Mark as user animation
      isUserAnimatingRef.current = true;
      handleTabChange(tabs[index].id);
      snapToTab(index).then(() => {
        // Reset after animation completes
        isUserAnimatingRef.current = false;
      });
    }
  };

  const handleTabChange = (tabId: string) => {
    // Navigate with slide animation
    const basePath = courseId === 'all'
      ? `/courses/${tabId === 'overview' ? 'all_courses' : tabId}`
      : `/course/${courseId}/${tabId}`;

    navigate(basePath);
  };

  return (
    <div
      ref={containerRef}
      className="top-tab-bar"
    >
      {/* Tab container */}
      <motion.div
        ref={trackRef}
        className="tab-bar-track"
        drag="x"
        dragElastic={0}
        dragConstraints={{ left: -Infinity, right: Infinity }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        whileTap={{ cursor: "grabbing" }}
      >
        {/* Small padding at start */}
        <div className="tab-spacer" />

        {tabs.map((tab, index) => {
          const isActive = index === currentIndex;
          const targetOpacity = isActive ? 1 : 0.6;

          return (
            <motion.button
              key={tab.id}
              ref={(el) => { tabRefs.current[index] = el; }}
              onClick={() => handleTabClick(index)}
              className="tab-item"
              initial={false}
              animate={{
                opacity: targetOpacity,
              }}
              transition={{
                opacity: {
                  duration: 0.2,
                  ease: "easeInOut"
                }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span
                className={`tab-label ${isActive ? 'active' : ''}`}
                style={{
                  fontWeight: isActive ? 700 : 600,
                }}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}

        {/* Small padding at end */}
        <div className="tab-spacer" />
      </motion.div>
    </div>
  );
}
