import { saveSession } from '../api/sessions.js'

export function renderReflection(container) {
  container.innerHTML = `
    <h2>Reflection</h2>
    <form id="reflection-form">
      <label>
        Duration (minutes):
        <input type="number" name="duration" required>
      </label><br>
      <label>
        Type:
        <select name="type" required>
          <option value="focus">Focus</option>
          <option value="short_break">Short Break</option>
          <option value="long_break">Long Break</option>
        </select>
      </label><br>
      <label>
        Reflection:
        <input type="text" name="reflection">
      </label><br>
      <button type="submit">Save Session</button>
    </form>
    <div id="reflection-message"></div>
  `

  const form = container.querySelector('#reflection-form')
  const message = container.querySelector('#reflection-message')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const data = new FormData(form)
    const sessionData = {
      duration: Number(data.get('duration')),
      type: data.get('type'),
      reflection: data.get('reflection'),
      startedAt: new Date().toISOString(), // For demo, use now
      endedAt: new Date().toISOString(), // For demo, use now
    }
    try {
      await saveSession(sessionData)
      message.textContent = 'Session saved!'
      form.reset()
    } catch (err) {
      message.textContent = 'Failed to save session.'
    }
  })
}
