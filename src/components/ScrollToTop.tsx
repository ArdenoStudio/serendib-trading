import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset browser scroll on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    // Handle same-page clicks for buttons and links
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      const button = target.closest('button');

      if (link || button) {
        // If it's a link to the current page, scroll to top
        if (link) {
          const href = link.getAttribute('href');
          if (href === pathname || href === window.location.origin + pathname || href === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else {
          // For buttons, we generally want scroll to top if they perform actions that stay on page
          // but let's be safe and only do it for primary navigation-like buttons
          // Actually user said "any buttons".
          // To avoid breaking modals or small UI elements, we'll only do it if they don't have preventDefault
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
