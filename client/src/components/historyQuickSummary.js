// historyQuickSummary.js - Minimal session history for sidebar
import { fetchSessions } from '../utils/fetchSession'
import { getSessionIcon } from '../config/sessionConfig'
import { toast } from '../utils/feedback'

export function createQuickSummaryHistory(container) {
  async function showQuickSummary() {
    container.innerHTML = `<div class="loading">Loading recent sessions...</div>`

    try {
      const sessions = await fetchSessions()

      if (!sessions.length) {
        container.innerHTML = `
          <div class="quick-summary-empty">
            <div class="empty-icon">⏱️</div>
            <div class="empty-title">No sessions yet</div>
            <div class="empty-subtitle">Start your first focus session</div>
          </div>
        `
        return
      }

      // Show only the last 5 sessions for quick summary
      const recentSessions = sessions.slice(0, 5)

      container.innerHTML = `
        <div class="quick-summary-list" role="list" aria-label="Recent sessions">
          ${recentSessions
            .map(
              (session, index) => `
              <div class="quick-summary-item" role="listitem" data-session-id="${session._id}">
                <div class="summary-icon">${getSessionIcon(session.type)}</div>
                <div class="summary-content">
                  <div class="summary-type">${session.type}</div>
                  <div class="summary-meta">
                    <span class="summary-duration">${session.duration}m</span>
                    <span class="summary-date">${formatRelativeDate(session.startTime)}</span>
                  </div>
                </div>
                ${
                  session.notes || session.reflection
                    ? `
                  <div class="summary-indicator" title="Has notes or reflection">
                    <span class="indicator-dot"></span>
                  </div>
                `
                    : ''
                }
              </div>
            `,
            )
            .join('')}
        </div>
        <div class="quick-summary-footer">
          <button class="view-all-btn" type="button">
            <span class="view-all-icon">📊</span>
            <span class="view-all-text">View All Sessions</span>
          </button>
        </div>
      `

      // Add event listener for "View All" button
      const viewAllBtn = container.querySelector('.view-all-btn')
      viewAllBtn.addEventListener('click', () => {
        showDetailedHistory()
      })

      // Add hover effects for session items
      const summaryItems = container.querySelectorAll('.quick-summary-item')
      summaryItems.forEach((item) => {
        item.addEventListener('click', () => {
          const sessionId = item.dataset.sessionId
          showSessionDetails(sessionId)
        })
      })
    } catch (err) {
      console.error('Error loading quick summary:', err)
      container.innerHTML = `
        <div class="quick-summary-error">
          <div class="error-icon">⚠️</div>
          <div class="error-message">Failed to load sessions</div>
          <button class="retry-btn" onclick="showQuickSummary()">Retry</button>
        </div>
      `
    }
  }

  function formatRelativeDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now - date
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays}d ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  }

  function showDetailedHistory() {
    // Navigate to detailed history page/modal
    toast.info('Opening detailed session history...')

    // Create a modal with the detailed view
    const modal = document.createElement('div')
    modal.className = 'detailed-history-modal'
    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Session History</h2>
            <button class="modal-close" type="button" aria-label="Close detailed history">&times;</button>
          </div>
          <div class="modal-body" id="detailed-history-container">
            <div class="loading-detailed">
              <div class="loading-spinner"></div>
              <p>Loading detailed history...</p>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Add modal styles if not already present
    if (!document.getElementById('detailed-history-modal-styles')) {
      const style = document.createElement('style')
      style.id = 'detailed-history-modal-styles'
      style.textContent = `
        .loading-detailed {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
          gap: var(--spacing-md);
          color: var(--text-muted);
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-subtle);
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `
      document.head.appendChild(style)
    }

    const closeBtn = modal.querySelector('.modal-close')
    const backdrop = modal.querySelector('.modal-backdrop')

    const closeModal = () => {
      modal.remove()
    }

    closeBtn.addEventListener('click', closeModal)
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal()
    })

    // ESC key to close modal
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        closeModal()
        document.removeEventListener('keydown', handleEscKey)
      }
    }
    document.addEventListener('keydown', handleEscKey)

    // Load detailed history component
    import('./sessionHistoryDetailed.js')
      .then(({ createDetailedSessionHistory }) => {
        const detailedContainer = modal.querySelector(
          '#detailed-history-container',
        )
        try {
          const historyInstance =
            createDetailedSessionHistory(detailedContainer)
          console.log('Detailed history loaded successfully:', historyInstance)

          // Focus on the modal for accessibility
          setTimeout(() => {
            const firstFocusable = modal.querySelector(
              'button, select, input, [tabindex]',
            )
            if (firstFocusable) firstFocusable.focus()
          }, 100)
        } catch (error) {
          console.error('Error loading detailed history:', error)
          detailedContainer.innerHTML = `
            <div class="error-message" style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">
              <div style="font-size: 2rem; margin-bottom: var(--spacing-md);">⚠️</div>
              <h3 style="margin-bottom: var(--spacing-sm); color: var(--text-secondary);">Failed to load detailed history</h3>
              <p style="margin-bottom: var(--spacing-md);">There was an error loading your session history.</p>
              <button onclick="location.reload()" style="padding: var(--spacing-sm) var(--spacing-md); background: var(--primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer;">Refresh Page</button>
            </div>
          `
        }
      })
      .catch((error) => {
        console.error('Error importing detailed history module:', error)
        const detailedContainer = modal.querySelector(
          '#detailed-history-container',
        )
        detailedContainer.innerHTML = `
        <div class="error-message" style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: var(--spacing-md);">⚠️</div>
          <h3 style="margin-bottom: var(--spacing-sm); color: var(--text-secondary);">Module loading failed</h3>
          <p style="margin-bottom: var(--spacing-md);">Could not load the detailed history component.</p>
          <button onclick="location.reload()" style="padding: var(--spacing-sm) var(--spacing-md); background: var(--primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer;">Refresh Page</button>
        </div>
      `
      })
  }

  function showSessionDetails(sessionId) {
    // Show individual session details
    toast.info(`Opening session ${sessionId.slice(-8)}...`)
  }

  // Initialize the quick summary
  showQuickSummary()

  return {
    refresh: showQuickSummary,
    showDetailed: showDetailedHistory,
  }
}
