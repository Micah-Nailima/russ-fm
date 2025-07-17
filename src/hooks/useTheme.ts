import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

/**
 * Hook to detect the current theme by checking if the document has the 'dark' class
 * This works with Tailwind CSS dark mode implementation
 */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check initial theme on mount
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    // Create observer to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setTheme(isDark ? 'dark' : 'light');
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Also listen for media query changes (system preference)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      // Only update if no explicit class is set
      if (!document.documentElement.classList.contains('dark') && 
          !document.documentElement.classList.contains('light')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    // Cleanup
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  return theme;
}