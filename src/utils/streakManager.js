// Session streak tracking utilities
// Tracks daily session completion streaks and statistics

class StreakManager {
  constructor() {
    this.streakKey = 'kairo-session-streak'
    this.statsKey = 'kairo-session-stats'
  }

  // Get current streak data
  getStreakData() {
    const defaultData = {
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,
      totalSessions: 0,
    }

    try {
      const stored = localStorage.getItem(this.streakKey)
      return stored ? { ...defaultData, ...JSON.parse(stored) } : defaultData
    } catch (error) {
      console.warn('Could not load streak data:', error)
      return defaultData
    }
  }

  // Update streak when a session is completed
  recordSessionCompletion(sessionDate = new Date()) {
    const streakData = this.getStreakData()
    const today = this.formatDate(sessionDate)
    const lastDate = streakData.lastSessionDate

    // If this is the first session today
    if (lastDate !== today) {
      if (lastDate === null) {
        // First session ever
        streakData.currentStreak = 1
      } else {
        const lastSessionDay = new Date(lastDate)
        const todayDay = new Date(today)
        const daysDifference = Math.floor(
          (todayDay - lastSessionDay) / (1000 * 60 * 60 * 24),
        )

        if (daysDifference === 1) {
          // Consecutive day - increment streak
          streakData.currentStreak += 1
        } else if (daysDifference > 1) {
          // Streak broken - reset to 1
          streakData.currentStreak = 1
        }
        // If daysDifference === 0, it's the same day, don't increment streak
      }

      streakData.lastSessionDate = today

      // Update longest streak if current is greater
      if (streakData.currentStreak > streakData.longestStreak) {
        streakData.longestStreak = streakData.currentStreak
      }
    }

    // Always increment total sessions
    streakData.totalSessions += 1

    this.saveStreakData(streakData)
    return streakData
  }

  // Check if streak is broken (should be called on app load)
  checkStreakStatus() {
    const streakData = this.getStreakData()
    if (!streakData.lastSessionDate) return streakData

    const today = this.formatDate(new Date())
    const lastDate = streakData.lastSessionDate
    const lastSessionDay = new Date(lastDate)
    const todayDay = new Date(today)
    const daysDifference = Math.floor(
      (todayDay - lastSessionDay) / (1000 * 60 * 60 * 24),
    )

    // If more than 1 day has passed, streak is broken
    if (daysDifference > 1) {
      streakData.currentStreak = 0
      this.saveStreakData(streakData)
    }

    return streakData
  }

  // Get session statistics
  getSessionStats() {
    const defaultStats = {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      byType: {},
    }

    try {
      const stored = localStorage.getItem(this.statsKey)
      return stored ? { ...defaultStats, ...JSON.parse(stored) } : defaultStats
    } catch (error) {
      console.warn('Could not load session stats:', error)
      return defaultStats
    }
  }

  // Record session statistics
  recordSessionStats(sessionType, sessionDate = new Date()) {
    const stats = this.getSessionStats()
    const today = this.formatDate(sessionDate)
    const currentDate = this.formatDate(new Date())

    // Check if this session is for today
    if (today === currentDate) {
      stats.today += 1
    }

    // Check if this session is within this week
    if (this.isWithinDays(sessionDate, 7)) {
      stats.thisWeek += 1
    }

    // Check if this session is within this month
    if (this.isWithinDays(sessionDate, 30)) {
      stats.thisMonth += 1
    }

    // Track by session type
    if (!stats.byType[sessionType]) {
      stats.byType[sessionType] = 0
    }
    stats.byType[sessionType] += 1

    this.saveSessionStats(stats)
    return stats
  }

  // Recalculate analytics based on current sessions (used after deletion)
  async recalculateAnalytics(sessions) {
    // Reset analytics data
    const defaultStreakData = {
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,
      totalSessions: 0,
    }

    const defaultStats = {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      byType: {},
    }

    if (!sessions || sessions.length === 0) {
      // No sessions left, reset everything
      this.saveStreakData(defaultStreakData)
      this.saveSessionStats(defaultStats)
      return { streakData: defaultStreakData, stats: defaultStats }
    }

    // Sort sessions by date
    const sortedSessions = sessions.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    )

    // Recalculate streak data
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let lastDate = null

    const sessionDates = new Set()

    // Group sessions by date and recalculate streaks
    sortedSessions.forEach((session) => {
      const sessionDate = this.formatDate(new Date(session.createdAt))
      sessionDates.add(sessionDate)
    })

    // Convert to sorted array of unique dates
    const uniqueDates = Array.from(sessionDates).sort()

    // Calculate streaks from unique dates
    for (let i = 0; i < uniqueDates.length; i++) {
      const currentDate = uniqueDates[i]

      if (i === 0) {
        tempStreak = 1
      } else {
        const prevDate = new Date(uniqueDates[i - 1])
        const currDate = new Date(currentDate)
        const daysDiff = Math.floor(
          (currDate - prevDate) / (1000 * 60 * 60 * 24),
        )

        if (daysDiff === 1) {
          tempStreak += 1
        } else {
          tempStreak = 1
        }
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }

      lastDate = currentDate
    }

    // Calculate current streak (from the end)
    if (uniqueDates.length > 0) {
      const today = this.formatDate(new Date())
      const lastSessionDate = uniqueDates[uniqueDates.length - 1]
      const daysSinceLastSession = Math.floor(
        (new Date(today) - new Date(lastSessionDate)) / (1000 * 60 * 60 * 24),
      )

      if (daysSinceLastSession <= 1) {
        // Calculate current streak from the end
        currentStreak = 1
        for (let i = uniqueDates.length - 2; i >= 0; i--) {
          const currDate = new Date(uniqueDates[i + 1])
          const prevDate = new Date(uniqueDates[i])
          const daysDiff = Math.floor(
            (currDate - prevDate) / (1000 * 60 * 60 * 24),
          )

          if (daysDiff === 1) {
            currentStreak += 1
          } else {
            break
          }
        }
      }
    }

    const newStreakData = {
      currentStreak,
      longestStreak,
      lastSessionDate: lastDate,
      totalSessions: sessions.length,
    }

    // Recalculate session stats
    const newStats = { ...defaultStats }
    const now = new Date()

    sessions.forEach((session) => {
      const sessionDate = new Date(session.createdAt)
      const sessionType = session.type

      // Today's sessions
      if (this.formatDate(sessionDate) === this.formatDate(now)) {
        newStats.today += 1
      }

      // This week's sessions
      if (this.isWithinDays(sessionDate, 7)) {
        newStats.thisWeek += 1
      }

      // This month's sessions
      if (this.isWithinDays(sessionDate, 30)) {
        newStats.thisMonth += 1
      }

      // By type
      if (!newStats.byType[sessionType]) {
        newStats.byType[sessionType] = 0
      }
      newStats.byType[sessionType] += 1
    })

    // Save recalculated data
    this.saveStreakData(newStreakData)
    this.saveSessionStats(newStats)

    return { streakData: newStreakData, stats: newStats }
  }

  // Helper methods
  formatDate(date) {
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  isWithinDays(date, days) {
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= days
  }

  saveStreakData(data) {
    try {
      localStorage.setItem(this.streakKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Could not save streak data:', error)
    }
  }

  saveSessionStats(data) {
    try {
      localStorage.setItem(this.statsKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Could not save session stats:', error)
    }
  }

  // Get streak message for display
  getStreakMessage(streakData) {
    if (streakData.currentStreak === 0) {
      return 'Start your focus streak today! 🌟'
    } else if (streakData.currentStreak === 1) {
      return 'Great start! Keep the momentum going 🔥'
    } else if (streakData.currentStreak < 7) {
      return `${streakData.currentStreak} day streak! You're building a habit 💪`
    } else if (streakData.currentStreak < 30) {
      return `Amazing ${streakData.currentStreak} day streak! You're on fire 🔥`
    } else {
      return `Incredible ${streakData.currentStreak} day streak! You're a focus master! 🏆`
    }
  }
}

// Create global instance
export const streakManager = new StreakManager()

// Convenience functions
export const recordSession = (sessionType, sessionDate) => {
  const streakData = streakManager.recordSessionCompletion(sessionDate)
  const stats = streakManager.recordSessionStats(sessionType, sessionDate)
  return { streakData, stats }
}

export const getStreakData = () => streakManager.checkStreakStatus()
export const getSessionStats = () => streakManager.getSessionStats()
export const getStreakMessage = (streakData) =>
  streakManager.getStreakMessage(streakData)
export const recalculateAnalytics = (sessions) =>
  streakManager.recalculateAnalytics(sessions)
