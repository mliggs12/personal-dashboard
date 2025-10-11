import { useEffect, useRef, useState } from "react";

/**
 * Hook to manage auto-scrolling behavior for chat messages
 * Allows users to manually scroll up without being forced to the bottom
 */
export function useAutoScroll<T>(dependencies: T) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      // User scrolled up
      if (scrollTop < lastScrollTop.current && !isAtBottom) {
        setIsUserScrolling(true);
      }
      // User scrolled to bottom
      else if (isAtBottom) {
        setIsUserScrolling(false);
      }
      
      lastScrollTop.current = scrollTop;
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll only if user hasn't manually scrolled up
  useEffect(() => {
    if (!isUserScrolling && scrollRef.current) {
      const scrollElement = scrollRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [dependencies, isUserScrolling]);

  return { scrollRef, isUserScrolling, setIsUserScrolling };
}

