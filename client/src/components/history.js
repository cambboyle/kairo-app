import { fetchSessions } from '../utils/fetchSession'

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
                    </li>
                `,
                  )
                  .join('')}
            </ul>
        </div>
    `
    } catch (err) {
      container.innerHTML = `<div>Error loading sessions.</div>`
    }
  }
  sessionHistory.showHistory = showHistory
  showHistory()
}
