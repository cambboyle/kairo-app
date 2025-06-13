// Notification utilities for Kairo
// Handles sound notifications, browser notifications, and user preferences

class NotificationManager {
  constructor() {
    this.audioContext = null
    this.soundEnabled = localStorage.getItem('kairo-sound-enabled') !== 'false'
    this.browserNotificationsEnabled = false
    this.initializeBrowserNotifications()
  }

  async initializeBrowserNotifications() {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        this.browserNotificationsEnabled = true
      } else if (Notification.permission !== 'denied') {
        // Will request permission when user first completes a session
        this.browserNotificationsEnabled = false
      }
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      this.browserNotificationsEnabled = permission === 'granted'
      return permission === 'granted'
    }
    return this.browserNotificationsEnabled
  }

  // Create a gentle bell sound using Web Audio API
  async createTimerSound(type = 'completion') {
    if (!this.soundEnabled) return

    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)()
      }

      const context = this.audioContext
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)

      // Create a gentle bell-like sound
      if (type === 'completion') {
        // Higher, more celebratory tone for completion
        oscillator.frequency.setValueAtTime(800, context.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(
          400,
          context.currentTime + 0.5,
        )
      } else if (type === 'start') {
        // Lower, focused tone for start
        oscillator.frequency.setValueAtTime(400, context.currentTime)
      } else if (type === 'pause') {
        // Mid-range tone for pause
        oscillator.frequency.setValueAtTime(600, context.currentTime)
      }

      oscillator.type = 'sine'

      // Gentle fade in/out envelope
      gainNode.gain.setValueAtTime(0, context.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        context.currentTime + 0.8,
      )

      oscillator.start(context.currentTime)
      oscillator.stop(context.currentTime + 0.8)
    } catch (error) {
      console.warn('Could not play sound:', error)
    }
  }

  showBrowserNotification(title, message, options = {}) {
    if (!this.browserNotificationsEnabled || !('Notification' in window)) {
      return null
    }

    try {
      const notification = new Notification(title, {
        body: message,
        icon: '/vite.svg', // Using the existing icon
        badge: '/vite.svg',
        silent: true, // We handle sound separately
        requireInteraction: false,
        ...options,
      })

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    } catch (error) {
      console.warn('Could not show notification:', error)
      return null
    }
  }

  async notifySessionComplete(sessionType, duration) {
    // Play completion sound
    await this.createTimerSound('completion')

    // Show browser notification
    const message = `Your ${duration} minute ${sessionType.toLowerCase()} session is complete!`
    this.showBrowserNotification('🎯 Kairo - Session Complete', message, {
      tag: 'session-complete',
    })
  }

  async notifySessionStart(sessionType, duration) {
    await this.createTimerSound('start')
  }

  async notifySessionPause() {
    await this.createTimerSound('pause')
  }

  // Enhanced session notifications with context
  async notifySessionReminder() {
    if (!this.browserNotificationsEnabled) return

    this.showBrowserNotification(
      '⏰ Kairo Reminder',
      'Ready for another focus session?',
      {
        tag: 'session-reminder',
        requireInteraction: false,
        actions: [
          { action: 'start', title: 'Start Session' },
          { action: 'later', title: 'Later' },
        ],
      },
    )
  }

  async notifyBreakSuggestion(sessionCount) {
    if (!this.browserNotificationsEnabled) return

    const breakType =
      sessionCount % 4 === 0 ? 'Long Break (15-30 min)' : 'Short Break (5 min)'

    this.showBrowserNotification(
      '☕ Time for a Break',
      `Consider taking a ${breakType} to recharge`,
      {
        tag: 'break-suggestion',
        requireInteraction: false,
      },
    )
  }

  async notifySessionMilestone(streak) {
    if (!this.browserNotificationsEnabled) return

    let message = ''
    if (streak === 7) message = 'One week streak! Amazing consistency 🌟'
    else if (streak === 30)
      message = "One month streak! You're building incredible habits 🚀"
    else if (streak % 10 === 0)
      message = `${streak} day streak! Keep up the momentum 🔥`
    else return

    this.showBrowserNotification('🎉 Milestone Achieved!', message, {
      tag: 'milestone',
      requireInteraction: true,
    })
  }

  // Settings methods
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled
    localStorage.setItem('kairo-sound-enabled', String(enabled))
  }

  getSoundEnabled() {
    return this.soundEnabled
  }

  getBrowserNotificationsEnabled() {
    return this.browserNotificationsEnabled
  }
}

// Create global instance
export const notifications = new NotificationManager()

// Convenience methods
export const playTimerSound = (type) => notifications.createTimerSound(type)
export const showNotification = (title, message, options) =>
  notifications.showBrowserNotification(title, message, options)
export const requestNotificationPermission = () =>
  notifications.requestNotificationPermission()
