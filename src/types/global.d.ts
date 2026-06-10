// Type declarations for global window extensions

declare global {
  interface Window {
    activityTracker: {
      trackEvent: (page: string, action: string, metadata?: Record<string, any>) => void
    } | undefined
  }
}

export {}