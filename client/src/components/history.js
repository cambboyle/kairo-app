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
  }
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
            .map(
              (s, index) => `
              <div class="history-item" role="listitem" aria-describedby="session-${index}-details">
                <div class="history-content">
                  <div class="history-main">
                    <span class="history-icon" aria-hidden="true">${getSessionIcon(s.type)}</span>
                    <div class="history-info">
                      <div class="history-type">${s.type}</div>
                      <div class="history-date">${new Date(s.startTime).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div class="history-duration" aria-label="Duration">${s.duration} min</div>
                </div>
                <div id="session-${index}-details" class="sr-only">
                  ${s.type} session for ${s.duration} minutes on ${new Date(s.startTime).toLocaleDateString()}
                </div>
                <button 
                  class="history-delete-btn" 
                  data-id="${s._id}"
                  aria-label="Delete ${s.type} session from ${new Date(s.startTime).toLocaleDateString()}"
                  title="Delete this session"
                >
                  <span aria-hidden="true">×</span>
                  <span class="sr-only">Delete</span>
                </button>
              </div>
            `,
            )
            .join('')}
        </div>
      `

      // Add event listeners for delete buttons
      container.querySelectorAll('.history-delete-btn').forEach((btn) => {
        btn.onclick = () =>
          deleteSession(btn.getAttribute('data-id'), showHistory)
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
