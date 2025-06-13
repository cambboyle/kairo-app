// history.js - Japanese Zen Minimalism Design - Quick Summary View
import { fetchSessions } from '../utils/fetchSession'
import { getSessionIcon } from '../config/sessionConfig'
import { toast, showConfirmation } from '../utils/feedback'
import { recalculateAnalytics } from '../utils/streakManager'
import { createDetailedSessionHistory } from './sessionHistoryDetailed'

async function deleteSession(sessionId, showHistory) {
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
      console.warn('Could not update analytics after deletion:', analyticsError)
    }

    // Announce deletion to screen readers
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.className = 'sr-only'
    announcement.textContent =
      'Session deleted successfully and analytics updated'
    document.body.appendChild(announcement)
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement)
      }
    }, 2000)

    showHistory()
  } catch (err) {
    console.error('Delete error:', err)
    toast.error('Failed to delete session')

    // Announce error to screen readers
    const errorAnnouncement = document.createElement('div')
    errorAnnouncement.setAttribute('aria-live', 'assertive')
    errorAnnouncement.className = 'sr-only'
    errorAnnouncement.textContent =
      'Failed to delete session. Please try again.'
    document.body.appendChild(errorAnnouncement)
    setTimeout(() => {
      if (errorAnnouncement.parentNode) {
        errorAnnouncement.parentNode.removeChild(errorAnnouncement)
      }
    }, 3000)
  }
}

export function sessionHistory(container) {
  const detailedHistory = createDetailedSessionHistory()
  
  async function showHistory() {
    container.innerHTML = `<div class="loading">Loading recent sessions...</div>`

    try {
      const allSessions = await fetchSessions()

      if (!allSessions.length) {
        container.innerHTML = `
          <div class="history-summary">
            <div class="no-sessions-placeholder">
              <div class="placeholder-icon">🎯</div>
              <h3>No sessions yet</h3>
              <p>Complete your first focus session to see your progress</p>
            </div>
          </div>
        `
        return
      }

      // Show only the last 5 sessions for quick summary
      const recentSessions = allSessions.slice(0, 5)
      const totalSessions = allSessions.length
      const totalTime = allSessions.reduce((sum, s) => sum + s.duration, 0)

      container.innerHTML = `
        <div class="history-summary">
          <div class="summary-header">
            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-value">${totalSessions}</span>
                <span class="stat-label">Sessions</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${Math.floor(totalTime / 60)}h ${totalTime % 60}m</span>
                <span class="stat-label">Total Time</span>
              </div>
            </div>
            <button class="view-all-btn" id="view-all-sessions">
              <span>View All</span>
              <span class="view-all-icon">→</span>
            </button>
          </div>
          
          <div class="recent-sessions" role="list" aria-label="Recent sessions">
            ${recentSessions
              .map((session, index) => {
                const sessionDate = new Date(session.startTime)
                const isToday = sessionDate.toDateString() === new Date().toDateString()
                const isYesterday = sessionDate.toDateString() === new Date(Date.now() - 86400000).toDateString()
                
                let displayDate
                if (isToday) {
                  displayDate = 'Today'
                } else if (isYesterday) {
                  displayDate = 'Yesterday'
                } else {
                  displayDate = sessionDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })
                }

                const displayTime = sessionDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })

                const hasContent = (session.notes && session.notes.trim()) || 
                                 (session.reflection && session.reflection.trim())

                return `
                  <div class="session-summary-item" role="listitem">
                    <div class="session-summary-main">
                      <div class="session-summary-icon">
                        ${getSessionIcon(session.type)}
                      </div>
                      <div class="session-summary-content">
                        <div class="session-summary-title">${session.type}</div>
                        <div class="session-summary-meta">
                          <span class="session-summary-date">${displayDate}</span>
                          <span class="session-summary-time">${displayTime}</span>
                          <span class="session-summary-duration">${session.duration}m</span>
                        </div>
                      </div>
                      ${hasContent ? `
                        <div class="session-summary-indicator" title="Has notes or reflection">
                          <span class="content-indicator">💭</span>
                        </div>
                      ` : ''}
                    </div>
                    <button class="session-summary-delete" 
                            data-session-id="${session._id}" 
                            title="Delete session"
                            aria-label="Delete ${session.type} session from ${displayDate}">
                      <span class="delete-icon">×</span>
                    </button>
                  </div>
                `
              })
              .join('')}
          </div>
          
          ${totalSessions > 5 ? `
            <div class="summary-footer">
              <button class="show-more-btn" id="show-more-sessions">
                <span>Show ${totalSessions - 5} more sessions</span>
                <span class="show-more-icon">↓</span>
              </button>
            </div>
          ` : ''}
        </div>
      `

      // Add event listeners
      const viewAllBtn = document.getElementById('view-all-sessions')
      if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
          detailedHistory.show()
        })
      }

      const showMoreBtn = document.getElementById('show-more-sessions')
      if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
          detailedHistory.show()
        })
      }

      // Add delete event listeners
      container.querySelectorAll('.session-summary-delete').forEach(deleteBtn => {
        const clickHandler = (e) => {
          e.stopPropagation()
          const sessionId = deleteBtn.getAttribute('data-session-id')
          deleteSession(sessionId, showHistory)
        }

        deleteBtn.addEventListener('click', clickHandler)
        deleteBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            clickHandler(e)
          }
        })
      })

      // Inject summary styles
      injectSummaryStyles()

    } catch (err) {
      console.error('Error loading sessions:', err)
      container.innerHTML = `
        <div class="history-summary">
          <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Could not load sessions</h3>
            <p>Please check your connection and try again.</p>
            <button class="retry-btn" onclick="this.closest('.history-section').querySelector('#history').firstElementChild.click()">
              Retry
            </button>
          </div>
        </div>
      `
    }
  }

  function injectSummaryStyles() {
    if (document.getElementById('history-summary-styles')) return

    const style = document.createElement('style')
    style.id = 'history-summary-styles'
    style.textContent = `
      .history-summary {
        background: var(--surface);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }

      .summary-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-lg);
        background: linear-gradient(135deg, var(--surface) 0%, var(--bg-tertiary) 100%);
        border-bottom: 1px solid var(--border-subtle);
      }

      .summary-stats {
        display: flex;
        gap: var(--spacing-lg);
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-xs);
      }

      .stat-value {
        font-size: var(--text-lg);
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1;
      }

      .stat-label {
        font-size: var(--text-xs);
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .view-all-btn,
      .show-more-btn {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--primary);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: 500;
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .view-all-btn:hover,
      .show-more-btn:hover {
        background: var(--primary-hover);
        transform: translateY(-1px);
      }

      .view-all-icon,
      .show-more-icon {
        font-size: var(--text-sm);
        transition: transform var(--transition-fast);
      }

      .view-all-btn:hover .view-all-icon {
        transform: translateX(2px);
      }

      .show-more-btn:hover .show-more-icon {
        transform: translateY(2px);
      }

      .recent-sessions {
        display: flex;
        flex-direction: column;
      }

      .session-summary-item {
        display: flex;
        align-items: center;
        padding: var(--spacing-md) var(--spacing-lg);
        border-bottom: 1px solid var(--border-subtle);
        transition: background-color var(--transition-fast);
        position: relative;
      }

      .session-summary-item:last-child {
        border-bottom: none;
      }

      .session-summary-item:hover {
        background: var(--bg-tertiary);
      }

      .session-summary-main {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        flex: 1;
        min-width: 0;
      }

      .session-summary-icon {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-lighter);
        border-radius: var(--radius-md);
        font-size: var(--text-lg);
        flex-shrink: 0;
      }

      .session-summary-content {
        flex: 1;
        min-width: 0;
      }

      .session-summary-title {
        font-weight: 600;
        color: var(--text-primary);
        font-size: var(--text-base);
        margin-bottom: var(--spacing-xs);
        line-height: 1.2;
      }

      .session-summary-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--text-sm);
        color: var(--text-muted);
      }

      .session-summary-meta > span:not(:last-child)::after {
        content: '•';
        margin-left: var(--spacing-sm);
        opacity: 0.5;
      }

      .session-summary-indicator {
        margin-left: var(--spacing-sm);
      }

      .content-indicator {
        font-size: var(--text-sm);
        opacity: 0.7;
      }

      .session-summary-delete {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: var(--spacing-xs);
        border-radius: var(--radius-sm);
        font-size: var(--text-lg);
        opacity: 0;
        transition: all var(--transition-fast);
        margin-left: var(--spacing-sm);
      }

      .session-summary-item:hover .session-summary-delete {
        opacity: 1;
      }

      .session-summary-delete:hover {
        background: var(--error-light);
        color: var(--error);
      }

      .summary-footer {
        padding: var(--spacing-md) var(--spacing-lg);
        background: var(--bg-tertiary);
        border-top: 1px solid var(--border-subtle);
        text-align: center;
      }

      .no-sessions-placeholder,
      .error-state {
        text-align: center;
        padding: var(--spacing-4xl) var(--spacing-lg);
        color: var(--text-muted);
      }

      .placeholder-icon,
      .error-icon {
        font-size: 3rem;
        margin-bottom: var(--spacing-lg);
        opacity: 0.5;
      }

      .no-sessions-placeholder h3,
      .error-state h3 {
        font-size: var(--text-xl);
        margin-bottom: var(--spacing-sm);
        color: var(--text-secondary);
      }

      .no-sessions-placeholder p,
      .error-state p {
        font-size: var(--text-base);
        margin-bottom: var(--spacing-lg);
      }

      .retry-btn {
        padding: var(--spacing-sm) var(--spacing-lg);
        background: var(--primary);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: 500;
        cursor: pointer;
        transition: background-color var(--transition-fast);
      }

      .retry-btn:hover {
        background: var(--primary-hover);
      }

      @media (max-width: 640px) {
        .summary-header {
          flex-direction: column;
          gap: var(--spacing-md);
          align-items: stretch;
        }

        .summary-stats {
          justify-content: center;
        }

        .session-summary-meta {
          flex-wrap: wrap;
        }

        .session-summary-meta > span:not(:last-child)::after {
          display: none;
        }
      }
    `

    document.head.appendChild(style)
  }

  // Initialize the history display
  showHistory()

  return {
    refresh: showHistory,
    showDetailed: () => detailedHistory.show()
  }
}

      container.innerHTML = `
        <div class="history-list" role="list" aria-label="Session history">
          ${sessions
            .map((s, index) => {
              const hasReflection = s.reflection && s.reflection.trim()
              const hasNotes = s.notes && s.notes.trim()
              const hasExpandableContent = hasReflection || hasNotes
              const reflectionId = `reflection-${index}`
              return `
                <div class="history-item${hasExpandableContent ? ' has-reflection' : ''}" role="listitem" tabindex="${hasExpandableContent ? '0' : '-1'}" aria-expanded="false" aria-controls="${hasExpandableContent ? reflectionId : ''}" id="history-item-${index}">
                  <button class="history-row-main" tabindex="-1" aria-label="${s.type} session on ${new Date(s.startTime).toLocaleDateString()}${hasExpandableContent ? ', expand to view details' : ''}" ${hasExpandableContent ? '' : 'disabled'}>
                    <span class="history-icon" aria-hidden="true">${getSessionIcon(s.type)}</span>
                    <div class="history-content">
                      <div class="history-session-type">${s.type}</div>
                      <div class="history-session-details">
                        <span class="history-session-date">${new Date(s.startTime).toLocaleDateString()}</span>
                        <span class="history-session-time" aria-label="Duration">${s.duration} min</span>
                      </div>
                    </div>
                  </button>
                  <div class="history-actions">
                    ${
                      hasExpandableContent
                        ? `<div class="expansion-indicator" title="Click to view details">
                      <span class="dropdown-arrow" aria-hidden="true">▼</span>
                    </div>`
                        : ''
                    }
                    <div 
                      class="delete-indicator" 
                      title="Delete this session"
                      data-id="${s._id}"
                      role="button"
                      tabindex="0"
                      aria-label="Delete ${s.type} session from ${new Date(s.startTime).toLocaleDateString()}"
                    >
                      <span class="delete-icon" aria-hidden="true">×</span>
                    </div>
                  </div>
                </div>
                ${
                  hasExpandableContent
                    ? `
                  <div id="${reflectionId}" class="reflection-row" style="display:none;">
                    ${
                      hasNotes
                        ? `
                      <div class="session-details-section">
                        <div class="session-details-header">
                          <span class="details-icon">📝</span>
                          <span class="details-title">Session Notes</span>
                        </div>
                        <div class="session-notes-content">${s.notes.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
                      </div>
                    `
                        : ''
                    }
                    ${
                      hasReflection
                        ? `
                      <div class="session-details-section">
                        <div class="session-details-header">
                          <span class="details-icon">💭</span>
                          <span class="details-title">Reflection</span>
                        </div>
                        <div class="reflection-content">${s.reflection.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                      </div>
                    `
                        : ''
                    }
                  </div>
                `
                    : ''
                }
              `
            })
            .join('')}
        </div>
      `

      // Add event listeners for delete indicators
      container
        .querySelectorAll('.delete-indicator')
        .forEach((deleteIndicator) => {
          const clickHandler = (e) => {
            e.stopPropagation()
            deleteSession(deleteIndicator.getAttribute('data-id'), showHistory)
          }

          deleteIndicator.addEventListener('click', clickHandler)
          deleteIndicator.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              clickHandler(e)
            }
          })
        })

      // Add event listeners for expansion indicators
      container
        .querySelectorAll('.expansion-indicator')
        .forEach((expansionIndicator, idx) => {
          const clickHandler = (e) => {
            e.stopPropagation()
            const item = expansionIndicator.closest('.history-item')
            const expanded = item.getAttribute('aria-expanded') === 'true'
            const reflectionDiv = document.getElementById(`reflection-${idx}`)
            item.setAttribute('aria-expanded', String(!expanded))
            if (reflectionDiv) {
              reflectionDiv.style.display = expanded ? 'none' : 'block'
            }
          }

          expansionIndicator.addEventListener('click', clickHandler)
          expansionIndicator.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              clickHandler(e)
            }
          })
        })

      // Add event listeners for toggling reflection on the button only (for accessibility)
      container
        .querySelectorAll('.history-item.has-reflection .history-row-main')
        .forEach((btn, idx) => {
          btn.addEventListener('click', function (e) {
            // Prevent toggle if any action button was clicked
            if (e.target.closest('.history-actions')) return
            const item = btn.closest('.history-item')
            const expanded = item.getAttribute('aria-expanded') === 'true'
            const reflectionDiv = document.getElementById(`reflection-${idx}`)
            item.setAttribute('aria-expanded', String(!expanded))
            if (reflectionDiv) {
              reflectionDiv.style.display = expanded ? 'none' : 'block'
            }
          })
          btn.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              btn.click()
            }
          })
        })
    } catch (err) {
      console.error('Error loading sessions:', err)
      container.innerHTML = `
        <div class="history-list">
          <div class="history-item" style="text-align: center; color: var(--text-muted);">
            Error loading sessions
          </div>
        </div>
      `
    }
  }

  // Add refresh method for external calls
  showHistory.refresh = showHistory

  showHistory()
  return { refresh: showHistory }
}
