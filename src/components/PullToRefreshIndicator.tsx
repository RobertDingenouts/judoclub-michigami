'use client';

import { RefreshCw, Check } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  progress: number; // 0 to 1
}

export function PullToRefreshIndicator({ isPulling, isRefreshing, progress }: PullToRefreshIndicatorProps) {
  if (!isPulling && !isRefreshing) return null;

  const classes = [
    'ptr-indicator',
    (isPulling || isRefreshing) ? 'ptr-visible' : '',
    isRefreshing ? 'ptr-refreshing' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {isRefreshing ? (
        <RefreshCw className="w-5 h-5" style={{ color: '#c00000' }} />
      ) : isPulling ? (
        progress >= 1 ? (
          <Check className="w-5 h-5" style={{ color: '#27ae60' }} />
        ) : (
          <RefreshCw className="w-5 h-5 text-gray-400" style={{ opacity: progress }} />
        )
      ) : null}
    </div>
  );
}
