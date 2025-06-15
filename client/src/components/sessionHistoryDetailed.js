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
              </div>
            </div>
            <div class="session-card-duration">
              <span class="duration-value">${session.duration}</span>
              <span class="duration-unit">min</span>
            </div>
            <button class="session-delete-btn" data-session-id="${session._id}" title="Delete session">
              <span class="delete-icon">×</span>
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
          
          ${
            session.mood
              ? `
          <div class="session-card-footer">
            <div class="session-mood">
              <span class="mood-label">Mood:</span>
              <span class="mood-value">${session.mood}</span>
            </div>
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
    if (document.getElementById('detailed-history-styles')) return

    const style = document.createElement('style')
    style.id = 'detailed-history-styles'
    style.textContent = `
      /* Detailed History Wrapper Styles */
      .detailed-history-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        max-width: 1000px;
        margin: 0 auto;
        background: var(--bg-primary);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }

      .detailed-history-controls {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        padding: var(--spacing-2xl);
        background: var(--surface);
        border-bottom: 1px solid var(--border-subtle);
        flex-wrap: wrap;
      }

      .history-filters,
      .history-sort {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .filter-label,
      .sort-label {
        font-weight: 500;
        color: var(--text-secondary);
        font-size: var(--text-sm);
        letter-spacing: var(--tracking-normal);
        font-family: var(--font-primary);
      }

      .filter-select,
      .sort-select {
        padding: var(--spacing-sm) var(--spacing-md);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--surface);
        color: var(--text-primary);
        font-size: var(--text-sm);
        min-width: 140px;
        transition: all var(--transition-fast);
        font-family: var(--font-primary);
        font-weight: 400;
      }

      .filter-select:hover,
      .sort-select:hover {
        border-color: var(--border-emphasis);
        box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
      }

      .filter-select:focus,
      .sort-select:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
      }

      .history-stats {
        margin-left: auto;
        color: var(--text-muted);
        font-size: var(--text-sm);
        font-weight: 500;
        padding: var(--spacing-xs) var(--spacing-sm);
        background: var(--bg-tertiary);
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
      }

      .detailed-history-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-lg);
        scrollbar-width: thin;
        scrollbar-color: var(--border-subtle) transparent;
      }

      .detailed-history-content::-webkit-scrollbar {
        width: 6px;
      }

      .detailed-history-content::-webkit-scrollbar-track {
        background: transparent;
      }

      .detailed-history-content::-webkit-scrollbar-thumb {
        background: var(--border-subtle);
        border-radius: 3px;
      }

      .detailed-history-content::-webkit-scrollbar-thumb:hover {
        background: var(--border-emphasis);
      }

      .detailed-sessions-grid {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl);
        padding: var(--spacing-md);
      }

      .detailed-session-card {
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        overflow: hidden;
        transition: all var(--transition-normal);
        position: relative;
        margin-bottom: var(--spacing-lg);
      }

      .detailed-session-card:hover {
        border-color: var(--border-emphasis);
        transform: translateY(-2px);
      }

      .session-card-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        padding: var(--spacing-2xl);
        position: relative;
        background: var(--surface);
        border-bottom: 1px solid var(--border-subtle);
      }

      .session-card-icon {
        font-size: var(--text-xl);
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-tertiary);
        color: var(--text-primary);
        border-radius: var(--radius-md);
        flex-shrink: 0;
        border: 1px solid var(--border-subtle);
      }

      .session-card-meta {
        flex: 1;
        min-width: 0;
      }

      .session-card-title {
        font-family: var(--font-serif);
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-xs) 0;
        letter-spacing: var(--tracking-tight);
        line-height: var(--leading-snug);
      }

      .session-card-datetime {
        display: flex;
        gap: var(--spacing-sm);
        font-size: var(--text-sm);
        color: var(--text-muted);
        font-variant-numeric: tabular-nums;
        font-family: var(--font-primary);
        font-weight: 400;
        letter-spacing: var(--tracking-normal);
      }

      .session-date::after {
        content: '•';
        margin-left: var(--spacing-xs);
        opacity: 0.5;
      }

      .session-card-duration {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-md);
        background: var(--bg-tertiary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        min-width: 64px;
      }

      .duration-value {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--text-primary);
        line-height: var(--leading-tight);
        font-variant-numeric: tabular-nums;
        font-family: var(--font-primary);
      }

      .duration-unit {
        font-size: var(--text-xs);
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wide);
        font-weight: 400;
        font-family: var(--font-primary);
      }

      .session-delete-btn {
        position: absolute;
        top: var(--spacing-lg);
        right: var(--spacing-lg);
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: var(--spacing-xs);
        border-radius: var(--radius-sm);
        font-size: var(--text-sm);
        opacity: 0;
        transition: all var(--transition-fast);
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .detailed-session-card:hover .session-delete-btn {
        opacity: 0.6;
      }

      .session-delete-btn:hover {
        background: var(--bg-tertiary);
        color: var(--text-secondary);
        opacity: 1;
      }

      .session-card-content {
        padding: var(--spacing-xl) var(--spacing-2xl) var(--spacing-2xl);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl);
      }

      .session-notes-section,
      .session-reflection-section {
        background: var(--bg-tertiary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: var(--spacing-lg);
        transition: border-color var(--transition-fast);
      }

      .session-notes-section:hover,
      .session-reflection-section:hover {
        border-color: var(--border-emphasis);
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--text-secondary);
        margin: 0 0 var(--spacing-md) 0;
        letter-spacing: var(--tracking-normal);
        font-family: var(--font-primary);
      }

      .section-icon {
        font-size: var(--text-sm);
        opacity: 0.8;
      }

      .section-content {
        color: var(--text-primary);
        line-height: var(--leading-relaxed);
        font-size: var(--text-sm);
        font-family: var(--font-primary);
        font-weight: 400;
        letter-spacing: var(--tracking-normal);
      }

      .notes-content {
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: var(--font-primary);
      }

      .reflection-content {
        font-style: italic;
        font-family: var(--font-serif);
        font-size: var(--text-sm);
        line-height: var(--leading-relaxed);
      }

      .session-card-footer {
        padding: var(--spacing-sm) var(--spacing-lg);
        background: var(--bg-tertiary);
        border-top: 1px solid var(--border-subtle);
      }

      .session-mood {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-sm);
      }

      .mood-label {
        color: var(--text-muted);
        font-weight: 500;
      }

      .mood-value {
        color: var(--text-primary);
        font-weight: 600;
        padding: 2px var(--spacing-xs);
        background: var(--primary-lighter);
        border-radius: var(--radius-xs);
        font-size: var(--text-xs);
      }

      .no-sessions {
        text-align: center;
        padding: var(--spacing-4xl) var(--spacing-2xl);
        color: var(--text-muted);
      }

      .no-sessions-icon {
        font-size: 3rem;
        margin-bottom: var(--spacing-xl);
        opacity: 0.6;
      }

      .no-sessions h3 {
        font-size: var(--text-lg);
        margin-bottom: var(--spacing-md);
        color: var(--text-secondary);
        font-family: var(--font-serif);
        font-weight: 600;
      }

      .no-sessions p {
        font-size: var(--text-sm);
        opacity: 0.8;
        font-family: var(--font-primary);
      }

      .loading {
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--text-muted);
        font-style: italic;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .detailed-history-controls {
          flex-direction: column;
          align-items: stretch;
          gap: var(--spacing-md);
        }

        .history-filters,
        .history-sort {
          justify-content: space-between;
        }

        .history-stats {
          margin-left: 0;
          text-align: center;
          order: -1;
        }

        .session-card-header {
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }

        .session-card-duration {
          order: -1;
          align-self: flex-start;
        }

        .session-delete-btn {
          position: static;
          opacity: 1;
          margin-left: auto;
        }
      }

      /* Dark Mode Adjustments */
      [data-theme='dark'] .detailed-history-wrapper {
        background: var(--stone-900);
      }

      [data-theme='dark'] .detailed-session-card {
        background: var(--surface);
        border-color: var(--border-subtle);
      }

      [data-theme='dark'] .session-card-header {
        background: var(--surface);
        border-bottom: 1px solid var(--border-subtle);
      }

      [data-theme='dark'] .session-card-icon {
        background: var(--bg-tertiary);
        color: var(--text-primary);
        border-color: var(--border-subtle);
      }

      [data-theme='dark'] .session-notes-section,
      [data-theme='dark'] .session-reflection-section {
        background: var(--bg-tertiary);
        border-color: var(--border-subtle);
      }
    `

    document.head.appendChild(style)
  }

  // Inject styles and initialize the component
  injectDetailedHistoryStyles()
  initializeDetailedHistory()

  return {
    refresh: loadSessions,
    updateStats: updateStatsDisplay,
  }
}
