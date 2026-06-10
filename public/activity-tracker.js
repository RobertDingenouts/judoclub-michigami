// Activity Tracker for Judoclub Michigami Leaderboard
// Tracks time spent on pages, user interactions, and sends to API

class ActivityTracker {
  constructor() {
    this.session = {
      sessionId: this.generateSessionId(),
      pageStartTime: Date.now(),
      lastActivityTime: Date.now(),
      activities: [],
      flushTimer: null,
    }

    this.FLUSH_INTERVAL = 30000 // 30 seconds
    this.MAX_DURATION_MS = 300000 // 5 min max per activity
    this.API_ENDPOINT = '/api/activity/track'
    this.PAGE_ACTIONS = {
      'exam-dashboard': ['view', 'video_play', 'technique_detail', 'scroll', 'filter_change'],
      'techniques': ['view', 'video_play', 'search', 'filter', 'scroll', 'category_click'],
      'cursus-japans': ['view', 'flashcard_flip', 'quiz_start', 'quiz_answer', 'quiz_complete', 'audio_play', 'level_complete'],
      'profile': ['view', 'edit'],
    }

    this.init()
  }

  generateSessionId() {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  }

  getCurrentPage() {
    const path = window.location.pathname
    if (path.includes('/examens') || path.includes('/exameneisen') || path.includes('/exam-dashboard')) {
      return 'exam-dashboard'
    }
    if (path.includes('/technieken') || path.includes('/techniques')) {
      return 'techniques'
    }
    if (path.includes('/cursus-japans') || path.includes('/japans')) {
      return 'cursus-japans'
    }
    if (path.includes('/leden/profiel') || path.includes('/profiel')) {
      return 'profile'
    }
    return 'other'
  }

  init() {
    if (typeof window === 'undefined') return

    document.addEventListener('visibilitychange', () => this.handleVisibilityChange())
    window.addEventListener('beforeunload', () => this.flush(true))

    let maxScroll = 0
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent
        if (scrollPercent % 25 === 0) {
          this.track('scroll', { scrollDepth: scrollPercent })
        }
      }
    })

    document.addEventListener('click', (e) => {
      const target = e.target
      if (target.matches('button, a, .clickable, [data-track-click]')) {
        const action = target.getAttribute('data-track-click') || 'click'
        this.track(action, { element: target.tagName, text: target.innerText?.slice(0, 50) })
      }
    })

    document.addEventListener('play', (e) => {
      if (e.target instanceof HTMLVideoElement) {
        this.track('video_play', { videoSrc: e.target.currentSrc })
      }
    }, true)

    document.addEventListener('play', (e) => {
      if (e.target instanceof HTMLAudioElement) {
        this.track('audio_play', { audioSrc: e.target.currentSrc })
      }
    }, true)

    this.startFlushTimer()
    this.track('view')
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.flush()
    } else {
      this.session.pageStartTime = Date.now()
      this.track('view')
    }
  }

  startFlushTimer() {
    if (this.session.flushTimer) {
      clearInterval(this.session.flushTimer)
    }
    this.session.flushTimer = setInterval(() => this.flush(), this.FLUSH_INTERVAL)
  }

  track(action, metadata) {
    const now = Date.now()
    const durationMs = Math.min(now - this.session.lastActivityTime, this.MAX_DURATION_MS)

    const page = this.getCurrentPage()

    if (page === 'other' && !this.PAGE_ACTIONS.other?.includes(action)) {
      return
    }

    const activity = {
      page,
      action,
      durationMs,
      metadata: metadata || {},
      sessionId: this.session.sessionId,
    }

    this.session.activities.push(activity)
    this.session.lastActivityTime = now
  }

  async flush(force = false) {
    if (this.session.activities.length === 0) return
    if (!force && this.session.activities.length < 3) return

    try {
      const activities = [...this.session.activities]
      this.session.activities = []

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(activities),
      })

      if (!response.ok) {
        console.warn('Activity tracking failed:', await response.text())
        this.session.activities.unshift(...activities)
      } else {
        const data = await response.json()
        if (data.pointsEarned > 0) {
          console.log('Earned ' + data.pointsEarned + ' points! Total: ' + data.newWeeklyPoints)
          this.showPointsNotification(data.pointsEarned)
        }
      }
    } catch (error) {
      console.error('Activity tracking error:', error)
    }
  }

  showPointsNotification(points) {
    const toast = document.createElement('div')
    toast.className = 'fixed bottom-4 right-4 bg-[#a90000] text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-up'
    toast.innerHTML = '<span class="font-bold">+' + points + ' punten!</span>'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  trackEvent(page, action, metadata) {
    this.track(action, { ...metadata, _customPage: page })
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.activityTracker = new ActivityTracker()
    })
  } else {
    window.activityTracker = new ActivityTracker()
  }
}

export { ActivityTracker }