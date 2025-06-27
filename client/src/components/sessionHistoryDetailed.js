// sessionHistoryDetailed.js - Comprehensive session history view
import { fetchSessions } from '../utils/fetchSession'
import { getSessionIcon } from '../config/sessionConfig'
import { toast, showConfirmation } from '../utils/feedback'
import { recalculateAnalytics } from '../utils/streakManager'

export function createDetailedSessionHistory(container) {
  let currentSessions = []
  let filteredSessions = []
  let currentFilter = 'all'
  let currentSort = 'date-desc'

  async function deleteSession(sessionId) {
    const confirmed = await showConfirmation(
      'Delete Session?',
      'Are you sure you want to delete this session? This will remove it from your history and may affect your streak and analytics data. This action cannot be undone.',
      'Delete',
      'Cancel',
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete session')

      toast.delete('Session deleted and removed from analytics')

      // Recalculate analytics based on remaining sessions
      try {
        const remainingSessions = await fetchSessions()
        await recalculateAnalytics(remainingSessions)

        // Refresh analytics dashboard if it exists
        if (
          window.analyticsApi &&
          typeof window.analyticsApi.refresh === 'function'
        ) {
          window.analyticsApi.refresh()
        }
      } catch (analyticsError) {
        console.warn(
          'Could not update analytics after deletion:',
          analyticsError,
        )
      }

      // Refresh the detailed history
      await loadSessions()
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Failed to delete session')
    }
  }

  async function loadSessions() {
    try {
      currentSessions = await fetchSessions()
      applyFiltersAndSort()
      updateStatsDisplay()
    } catch (error) {
      console.error('Error loading sessions:', error)
      toast.error('Failed to load session history')
    }
  }

  function applyFiltersAndSort() {
    // Apply filters
    filteredSessions = currentSessions.filter((session) => {
      if (currentFilter === 'all') return true
      if (currentFilter === 'this-week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(session.startTime) >= weekAgo
      }
      if (currentFilter === 'this-month') {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return new Date(session.startTime) >= monthAgo
      }
      return session.type === currentFilter
    })

    // Apply sorting
    filteredSessions.sort((a, b) => {
      switch (currentSort) {
        case 'date-desc':
          return new Date(b.startTime) - new Date(a.startTime)
        case 'date-asc':
          return new Date(a.startTime) - new Date(b.startTime)
        case 'duration-desc':
          return b.duration - a.duration
        case 'duration-asc':
          return a.duration - b.duration
        case 'type':
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })

    renderSessions()
  }

  function renderSessions() {
    const contentContainer =
      container.querySelector('#detailed-history-content') ||
      container.querySelector('.detailed-history-content') ||
      container

    if (!filteredSessions.length) {
      contentContainer.innerHTML = `
        <div class="no-sessions">
          <div class="no-sessions-icon">📝</div>
          <h3>No sessions found</h3>
          <p>Try adjusting your filters or start a new focus session.</p>
        </div>
      `
      return
    }

    const sessionsHTML = filteredSessions
      .map((session, index) => {
        const hasReflection = session.reflection && session.reflection.trim()
        const hasNotes = session.notes && session.notes.trim()
        const sessionDate = new Date(session.startTime)
        const formattedDate = sessionDate.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
        const formattedTime = sessionDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })

        return `
        <div class="detailed-session-card" data-session-id="${session._id}">
          <div class="session-card-header">
            <div class="session-card-icon">
              ${getSessionIcon(session.type)}
            </div>
            <div class="session-card-meta">
              <h3 class="session-card-title">${session.type}</h3>
              <div class="session-card-datetime">
                <span class="session-date">${formattedDate}</span>
                <span class="session-time">${formattedTime}</span>
                ${session.mood ? `<span class="session-mood-compact">${session.mood}</span>` : ''}
              </div>
            </div>
            <div class="session-card-duration">
              <span class="duration-value">${session.duration}</span>
              <span class="duration-unit">min</span>
            </div>
            <button class="session-delete-btn" data-session-id="${session._id}" title="Delete this session" aria-label="Delete session: ${session.type} from ${formattedDate}">
              <span class="delete-icon" aria-hidden="true">×</span>
            </button>
          </div>
          
          ${
            hasNotes || hasReflection
              ? `
          <div class="session-card-content">
            ${
              hasNotes
                ? `
            <div class="session-notes-section">
              <h4 class="section-title">
                <span class="section-icon">📝</span>
                Session Notes
              </h4>
              <div class="section-content notes-content">
                ${session.notes.replace(/\n/g, '<br>')}
              </div>
            </div>
            `
                : ''
            }
            
            ${
              hasReflection
                ? `
            <div class="session-reflection-section">
              <h4 class="section-title">
                <span class="section-icon">💭</span>
                Reflection
              </h4>
              <div class="section-content reflection-content">
                ${session.reflection}
              </div>
            </div>
            `
                : ''
            }
          </div>
          `
              : ''
          }
        </div>
      `
      })
      .join('')

    contentContainer.innerHTML = `
      <div class="detailed-sessions-grid">
        ${sessionsHTML}
      </div>
    `

    // Add delete event listeners
    contentContainer.querySelectorAll('.session-delete-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const sessionId = btn.getAttribute('data-session-id')
        deleteSession(sessionId)
      })
    })
  }

  // Initialize the detailed history view
  function initializeDetailedHistory() {
    // Create the detailed history interface
    container.innerHTML = `
      <div class="detailed-history-wrapper">
        <div class="detailed-history-controls">
          <div class="history-filters">
            <label for="session-filter" class="filter-label">Filter:</label>
            <select id="session-filter" class="filter-select">
              <option value="all">All Sessions</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="Focus">Focus Sessions</option>
              <option value="Deep Work">Deep Work</option>
              <option value="Break">Breaks</option>
            </select>
          </div>
          
          <div class="history-sort">
            <label for="session-sort" class="sort-label">Sort by:</label>
            <select id="session-sort" class="sort-select">
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="duration-desc">Longest First</option>
              <option value="duration-asc">Shortest First</option>
              <option value="type">Session Type</option>
            </select>
          </div>
          
          <div class="history-stats">
            <span class="stats-text">Loading...</span>
          </div>
        </div>
        
        <div class="detailed-history-content" id="detailed-history-content">
          <div class="loading">Loading sessions...</div>
        </div>
      </div>
    `

    // Setup event listeners
    const filterSelect = container.querySelector('#session-filter')
    const sortSelect = container.querySelector('#session-sort')

    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value
        applyFiltersAndSort()
        updateStatsDisplay()
      })
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value
        applyFiltersAndSort()
      })
    }

    // Load sessions
    loadSessions()
  }

  function updateStatsDisplay() {
    const statsText = container.querySelector('.stats-text')
    if (statsText) {
      const totalMinutes = filteredSessions.reduce(
        (sum, s) => sum + s.duration,
        0,
      )
      const totalHours = Math.floor(totalMinutes / 60)
      const remainingMinutes = totalMinutes % 60

      let timeText = ''
      if (totalHours > 0) {
        timeText =
          remainingMinutes > 0
            ? `${totalHours}h ${remainingMinutes}m`
            : `${totalHours}h`
      } else {
        timeText = `${totalMinutes}m`
      }

      statsText.textContent = `${filteredSessions.length} sessions • ${timeText} total`
    }
  }

  function injectDetailedHistoryStyles() {
    // Styles are now handled by external CSS file: detailed-history-zen.css
    // No inline styles needed - embracing Kanso (simplicity)
    return
  }

  // Inject styles and initialize the component
  injectDetailedHistoryStyles()
  initializeDetailedHistory()

  return {
    refresh: loadSessions,
    updateStats: updateStatsDisplay,
  }
}
