import { saveSession } from '../api/sessions.js'

export function startTimer(container, showReflectionModal) {
  let timerActive = false
  let timeLeft = 0
  let intervalId = null
  let timerType = ''
  let sessions = []
  let startedAt = null
  let endedAt = null

  function formatTime(secs) {
    const minutes = String(Math.floor(secs / 60)).padStart(2, '0')
    const seconds = String(secs % 60).padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  function showStartButton() {
    container.innerHTML = `<button id="start-timer-btn">Start Timer</button>`
    document.getElementById('start-timer-btn').onclick = showTimerPopup
  }

  function showTimerPopup() {
    container.innerHTML = `
    <div class="modal">
      <label>Duration (minutes): <input id="timer-minutes" type="number" min="1" value="25"></label><br>
      <label>Type:
        <select id="timer-type">
          <option value="Focus">Focus</option>
          <option value="Break">Break</option>
        </select>
      </label><br>
      <button id="popup-start">Start</button>
      <button id="popup-cancel">Cancel</button>
    </div>
  `
    document.getElementById('popup-start').onclick = () => {
      const mins = parseInt(document.getElementById('timer-minutes').value, 10)
      if (isNaN(mins) || mins < 1) {
        alert('Please enter a duration of at least 1 minute.')
        return
      }
      startCountdown()
    }
    document.getElementById('popup-cancel').onclick = showStartButton
  }

  function startCountdown() {
    const mins = parseInt(document.getElementById('timer-minutes').value, 10)
    timerType = document.getElementById('timer-type').value
    timeLeft = mins * 60
    timerActive = true
    startedAt = new Date()
    showTimerDisplay()
    intervalId = setInterval(() => {
      timeLeft--
      updateTimerDisplay()
      if (timeLeft <= 0) {
        clearInterval(intervalId)
        timerActive = false
        endedAt = new Date()
        showReflectionPrompt()
      }
    }, 1000)
  }

  function showTimerDisplay() {
    container.innerHTML = `
      <div>
        <h2>${timerType} Timer</h2>
        <div id="timer-countdown">${formatTime(timeLeft)}</div>
        <button id="pause-timer-btn">${timerActive ? 'Pause' : 'Resume'}</button>
        <button id="cancel-timer-btn">Cancel</button>
      </div>
    `
    document.getElementById('pause-timer-btn').onclick = togglePauseTimer
    document.getElementById('cancel-timer-btn').onclick = cancelTimer
  }

  function togglePauseTimer() {
    if (timerActive) {
      clearInterval(intervalId)
      timerActive = false
      showTimerDisplay()
    } else {
      timerActive = true
      intervalId = setInterval(() => {
        timeLeft--
        updateTimerDisplay()
        if (timeLeft <= 0) {
          clearInterval(intervalId)
          timerActive = false
          endedAt = new Date()
          showReflectionPrompt()
        }
      }, 1000)
      showTimerDisplay()
    }
  }

  function cancelTimer() {
    clearInterval(intervalId)
    timerActive = false
    showStartButton()
  }

  function showReflectionPrompt() {
    container.innerHTML = `
      <div class="modal">
        <p>Session complete! Would you like to reflect and save this session?</p>
        <button id="reflect-yes">Yes</button>
        <button id="reflect-no">No</button>
      </div>
    `
    document.getElementById('reflect-yes').onclick = showReflectionPopup
    document.getElementById('reflect-no').onclick = showStartButton
  }

  function showReflectionPopup() {
    // Hide everything else by replacing container content
    container.innerHTML = `
      <div class="modal">
        <label>Reflection:<br>
          <textarea id="reflection-text" rows="3"></textarea>
        </label><br>
        <button id="save-reflection">Save</button>
        <button id="cancel-reflection">Cancel</button>
      </div>
    `
    document.getElementById('save-reflection').onclick = saveSessionAndReset
    document.getElementById('cancel-reflection').onclick = showStartButton
  }

  function updateTimerDisplay() {
    const el = document.getElementById('timer-countdown')
    if (el) el.textContent = formatTime(timeLeft)
  }

  async function saveSessionAndReset() {
    const reflection = document.getElementById('reflection-text').value
    const sessionData = {
      duration: Math.max(1, Math.round((endedAt - startedAt) / 60000)),
      type:
        timerType === 'Focus'
          ? 'focus'
          : timerType === 'Break'
            ? 'short_break'
            : 'long_break',
      reflection,
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
    }
    console.log('Saving session:', sessionData)
    try {
      await saveSession(sessionData)
      showStartButton()
    } catch (err) {
      container.innerHTML = '<div>Error saving session.</div>'
      setTimeout(showStartButton, 2000)
    }
  }
  showStartButton()
}

// 1. On page load, create and display a "Start Timer" button

// 2. When "Start Timer" is clicked:
// Show a popup/modal:
// - Input for duration (minutes)
// - Dropdown for timer type
// "Start" and "Cancel" buttons

// 3. If "Start" is clicked in the popup:
// Hide popup
// Set timerActive = true
// Set countdown to the selected duration in seconds
// Display timer type and countdown on main screen
// Start interval to decrease countdown every 1 second

// 4. If "Cancel" is clicked in the popup:
// Hide popup
// Do nothing

// 5. While timer is running:
// Update countdown display every second
// If countdown reaches 0:
// Stop interval
// Set timerActive = false
// Show popup asking if user wants to reflect and save session
// "Yes" & "No" buttons

// 6. If user clicks "Yes" on reflection popup:
// Show reflection popup:
// Text field for reflection
// "Save" and "Cancel" buttons

// 7. If "Save" is clicked:
// Save session data (type, duration, reflection, timestamp)
// Hide popup
// Reset timer display

// 8. If "Cancel" is clicked in reflection popup:
// Hide popup
// Reset time display

// 9. If user clicks "No" on reflection prompt:
// Hide popup
// Reset timer display
