import { fetchSessions } from '../utils/fetchSession'

async function deleteSession(sessionId, showHistory) {
  try {
    await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
    showHistory()
  } catch (err) {
    alert('Failed to delete session')
  }
}

export function sessionHistory(container) {
  async function showHistory() {
    container.innerHTML = `<div>Session history will be displayed here.</div>`
    try {
      const sessions = await fetchSessions()
      if (!sessions.length) {
        container.innerHTML = `<div>No sessions found!</div>`
        return
      }
      container.innerHTML = `
        <div class="history-container">
            <h3>Session History</h3>
            <ul class="history-list">
                ${sessions
                  .map(
                    (s) => `
                    <li class="history-item">
                        <strong class="history-type">${s.type}</strong> (${s.duration} min)
                        <strong>${new Date(s.startTime).toLocaleString()}</strong><br>
                        <strong>Reflection:</strong> ${s.reflection || '-'}
                        <button class="delete-session-btn" data-id="${s._id}">Delete</button>
                    </li>
                `,
                  )
                  .join('')}
            </ul>
        </div>
    `
      // Add event listeners for delete buttons
      container.querySelectorAll('.delete-session-btn').forEach((btn) => {
        btn.onclick = () =>
          deleteSession(btn.getAttribute('data-id'), showHistory)
      })
    } catch (err) {
      container.innerHTML = `<div>Error loading sessions.</div>`
    }
  }
  sessionHistory.showHistory = showHistory
  showHistory()
}
