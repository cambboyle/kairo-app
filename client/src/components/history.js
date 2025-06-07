// history.js - Japanese Zen Minimalism Design
import { fetchSessions } from '../utils/fetchSession'
import { toast } from '../utils/toast'

function getSessionIcon(type) {
  switch (type) {
    case 'Deep Work':
      return '●'
    case 'Focus':
      return '○'
    case 'Break':
      return '◐'
    case 'Creative':
      return '◑'
    case 'Learning':
      return '◒'
    default:
      return '◯'
  }
}

async function deleteSession(sessionId, showHistory) {
  // Create a confirmation modal
  const modal = document.createElement('div')
  modal.className = 'delete-modal-overlay'
  modal.innerHTML = `
    <div class="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div class="delete-modal-header">
        <h3 id="delete-modal-title">Delete Session?</h3>
      </div>
      <div class="delete-modal-body">
        <p>Are you sure you want to delete this session? This action cannot be undone.</p>
      </div>
      <div class="delete-modal-actions">
        <button class="btn btn-danger" id="confirm-delete-btn">Delete</button>
        <button class="btn btn-secondary" id="cancel-delete-btn">Cancel</button>
      </div>
    </div>
  `
  document.body.appendChild(modal)
  // Focus the cancel button for accessibility
  setTimeout(() => {
    document.getElementById('cancel-delete-btn').focus()
  }, 0)

  // Handle confirm/cancel
  document.getElementById('confirm-delete-btn').onclick = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete session')
      toast.delete('Session deleted')
      // Announce deletion to screen readers
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.className = 'sr-only'
      announcement.textContent = 'Session deleted successfully'
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
    } finally {
      if (modal.parentNode) modal.parentNode.removeChild(modal)
    }
  }
  document.getElementById('cancel-delete-btn').onclick = () => {
    if (modal.parentNode) modal.parentNode.removeChild(modal)
  }
  // Keyboard accessibility: ESC closes modal
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal.parentNode) modal.parentNode.removeChild(modal)
    }
  })
}

export function sessionHistory(container) {
  async function showHistory() {
    container.innerHTML = `<div class="loading">Loading sessions...</div>`

    try {
      const sessions = await fetchSessions()

      if (!sessions.length) {
        container.innerHTML = `
          <div class="history-list">
            <div class="history-item" style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">
              <div>No sessions yet</div>
              <div style="font-size: var(--text-sm); margin-top: var(--spacing-sm);">Complete your first focus session to see your progress</div>
            </div>
          </div>
        `
        return
      }

      container.innerHTML = `
        <div class="history-list" role="list" aria-label="Session history">
          ${sessions
            .map((s, index) => {
              const hasReflection = s.reflection && s.reflection.trim()
              const reflectionId = `reflection-${index}`
              return `
                <div class="history-item${hasReflection ? ' has-reflection' : ''}" role="listitem" tabindex="${hasReflection ? '0' : '-1'}" aria-expanded="false" aria-controls="${hasReflection ? reflectionId : ''}" id="history-item-${index}">
                  <button class="history-row-main" tabindex="-1" aria-label="${s.type} session on ${new Date(s.startTime).toLocaleDateString()}${hasReflection ? ', expand to view reflection' : ''}" ${hasReflection ? '' : 'disabled'}>
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
                      hasReflection
                        ? `<div class="expansion-indicator" title="Click to view reflection">
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
                  hasReflection
                    ? `
                  <div id="${reflectionId}" class="reflection-row" style="display:none;">
                    <div class="reflection-content">${s.reflection.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
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
