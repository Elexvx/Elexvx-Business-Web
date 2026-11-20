import { useEffect, useRef, useState } from 'react';

export function useNearViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver !== 'function') {
      setIsNear(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsNear(true);
        observer.disconnect();
      },
      { rootMargin: '160px 0px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isNear };
}
