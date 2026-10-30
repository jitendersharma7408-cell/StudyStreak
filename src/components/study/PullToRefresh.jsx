import React, { useState, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY <= 0 && !refreshing) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current) return;
    const distance = e.touches[0].clientY - startY.current;
    if (distance > 0 && window.scrollY <= 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, 80));
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= 60 && !refreshing) {
      setRefreshing(true);
      setPullDistance(80);
      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, refreshing, onRefresh]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : 'none',
        transition: pulling.current ? 'none' : 'transform 0.3s ease'
      }}
    >
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{ height: pullDistance, opacity: pullDistance / 80 }}
      >
        <RefreshCw size={24} className={`text-study-accent ${refreshing ? 'animate-spin' : ''}`} />
      </div>
      {children}
    </div>
  );
}