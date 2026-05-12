'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // pixels to pull before triggering refresh
}

export function usePullToRefresh({ onRefresh, threshold = 80 }: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const touchStartY = useRef(0);
  const currentY = useRef(0);
  const scrollY = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only trigger if at the top of the scroll container
    const el = e.currentTarget as HTMLElement;
    if (el.scrollTop > 0) return;

    touchStartY.current = e.touches[0].clientY;
    scrollY.current = el.scrollTop;
    setIsPulling(false);
    setPullDistance(0);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Only single finger
    if (e.touches.length > 1) return;

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - touchStartY.current;

    // Only track downward pull when at top
    if (diff > 0 && scrollY.current === 0) {
      setIsPulling(true);
      // Apply resistance (easing)
      setPullDistance(Math.min(diff * 0.5, threshold));
      e.preventDefault();
    }
  }, [threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || pullDistance < threshold) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    // Trigger refresh
    setIsRefreshing(true);
    setPullDistance(threshold);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setIsPulling(false);
      setPullDistance(0);
    }
  }, [isPulling, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const el = document.querySelector('[data-pull-to-refresh]') as HTMLElement | null;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / threshold, 1);

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    progress,
    dataPullToRefresh: 'true',
  };
}
