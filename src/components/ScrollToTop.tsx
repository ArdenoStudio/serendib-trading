import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset browser scroll on route change with a tiny delay
    // to allow exit animation to start, creating smoother perceived transition
    const scrollTimeout = setTimeout(() => {
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
    }, 16); // 1 frame delay for smoother feel

    // Handle same-page clicks for buttons and links
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link) {
        const href = link.getAttribute('href');
        if (href === pathname || href === window.location.origin + pathname || href === '#') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    
    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
