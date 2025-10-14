import { useState, useEffect } from 'react';

export function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(() => {
    return window.matchMedia('(max-width: 768px)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return isMobile;
}
