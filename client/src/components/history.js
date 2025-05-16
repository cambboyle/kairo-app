export async function renderHistory(container) {
  container.innerHTML = `
    <h2>History</h2><div div id="history-list">Loading...</div>
  `
  try {
    const res = await fetch('api/sessions')
    if (!res.ok) throw new Error('Failed to fetch sessions')
    const sessions = await res.json()

    if (sessions.length === 0) {
      container.querySelector('#history-list').textContent = 'No sessions yet.'
      return
    }

    container.querySelector('#history-list').innerHTML = `<ul>
        ${sessions
          .map(
            (s) => `<li>
              <strong>${s.type}</strong> — ${s.duration} min<br>
              <em>${new Date(s.startedAt).toLocaleString()}</em><br>
              Reflection: ${s.reflection || '—'}
            </li>`,
          )
          .join('')}
        </ul>
      `
  } catch (err) {
    container.querySelector('#history-list').textContent =
      'Error loading history.'
  }
}
