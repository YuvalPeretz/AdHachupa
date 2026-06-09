import { useEffect, useState } from 'react';

// NOTE: this threshold must stay in sync with $bp-desktop in
// src/styles/_breakpoints.scss (currently 1024px).
const DESKTOP_QUERY = '(min-width: 1024px)';

function getIsDesktop(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches;
}

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(getIsDesktop);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);

    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, []);

  return isDesktop;
}
