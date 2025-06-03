import { saveSession } from '../utils/saveSession'
import { sessionHistory } from './history'

export function setupThemeToggle() {
  const btn = document.querySelector('.theme-toggle')
  if (!btn) return
  btn.onclick = () => {
    const isLight = document.body.getAttribute('data-theme') === 'light'
    document.body.setAttribute('data-theme', isLight ? '' : 'light')
    btn.setAttribute('aria-pressed', String(!isLight))
    btn.title = isLight ? 'Switch to light mode' : 'Switch to dark mode'
  }
}

export function setTimerProgress(percent) {
  const circle = document.querySelector('.timer-circle')
  if (circle) {
    circle.style.setProperty('--progress', percent)
  }
}

export function startTimer(container) {
  let isTimerActive = false
  let timeLeft = 0
  let timerType
  let timerInterval
  let startTime = null
  let endTime = null
  let intervalId = null
  let isTimerPaused
  let isEnded = false

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
      <label>Duration (minutes): <input id=timer-minutes type="number" min="1" value="25"></label><br>
      <label>Timer Mode:
        <select id="timer-type">
          <option>Deep Work</option>
          <option>Shallow Work</option>
          <option>Short Break</option>
          <option>Long Break</option>
        </select>
      </label>
      <div>
        <button id="popup-start">Start</button>
        <button id="popup-cancel">Cancel</button>
      </div>
    </div>`
    document.getElementById('popup-start').onclick = () => {
      const mins = parseInt(document.getElementById('timer-minutes').value, 10)
      if (isNaN(mins) || mins < 1) {
        alert('Please enter a duration of at least 1 minutes.')
        return
      }
      isEnded = false
      startCountdown()
    }
    document.getElementById('popup-cancel').onclick = () => {
      showStartButton()
    }
  }

  function startCountdown() {
    const mins = parseInt(document.getElementById('timer-minutes').value, 10)
    timerType = document.getElementById('timer-type').value
    timeLeft = mins * 60
    isTimerActive = true
    startTime = new Date()
    showTimerDisplay()
    intervalId = setInterval(() => {
      timeLeft--
      updateTimerDisplay()
      if (timeLeft <= 0) {
        clearInterval(intervalId)
        isTimerActive = false
        isEnded = true
        endTime = new Date()
        showRefectionModal()
      }
    }, 1000)
  }

  // Modify showTimerDisplay to include the progress ring
  function showTimerDisplay() {
    const percent =
      (timeLeft /
        (timerType && timerType !== ''
          ? parseInt(
              document.getElementById('timer-minutes')?.value || 25,
              10,
            ) * 60
          : 1500)) *
        100 || 0
    container.innerHTML = `
      <div>
        <div class="timer-circle">
          <div class="timer-progress"></div>
          <div id="timer-mode">${timerType}</div>
          <div id="timer-countdown">${formatTime(timeLeft)}</div>
        </div>
        <div class="timer-buttons">
          <button id="timer-status">${isTimerActive ? 'Pause' : 'Resume'} Timer</button>
          <button id="timer-cancel">Cancel Timer</button>
        </div>
      </div>`
    setTimerProgress(percent)
    document.getElementById('timer-status').onclick = togglePauseTimer
    document.getElementById('timer-cancel').onclick = cancelTimer
  }

  function togglePauseTimer() {
    if (isTimerActive) {
      clearInterval(intervalId)
      isTimerActive = false
      showTimerDisplay()
    } else {
      isTimerActive = true
      intervalId = setInterval(() => {
        timeLeft--
        updateTimerDisplay()
        if (timeLeft <= 0) {
          clearInterval(intervalId)
          isTimerActive = false
          isEnded = true
          endTime = new Date()
          showRefectionModal()
        }
      }, 1000)
      showTimerDisplay()
    }
  }

  function cancelTimer() {
    clearInterval(intervalId)
    isTimerActive = false
    showStartButton()
  }

  function updateTimerDisplay() {
    const el = document.getElementById('timer-countdown')
    if (el) el.textContent = formatTime(timeLeft)
  }

  function showRefectionModal() {
    if (isEnded) {
      // Inject modal CSS if not present
      injectReflectionModalStyles()
      container.innerHTML = `
      <div id="reflectionModal" class="reflection-modal">
        <h3>How did this session go?</h3>
        <input type="text" placeholder="write your reflection here..." id="reflection-text">
        <div id="reflection-feedback" style="min-height:1.5em;"></div>
        <button id="saveButton" type="button">Save session</button>
        <button id="dontSaveButton" type="button">Don't save session</button>
      </div>
      `
      document.getElementById('saveButton').onclick = saveCurrentSession
      document.getElementById('dontSaveButton').onclick = showStartButton
    }
  }

  async function saveCurrentSession() {
    const saveBtn = document.getElementById('saveButton')
    const feedback = document.getElementById('reflection-feedback')
    saveBtn.disabled = true
    saveBtn.textContent = 'Saving...'
    feedback.textContent = ''
    const reflection = document.getElementById('reflection-text').value
    const sessionData = {
      duration: Math.max(1, Math.round((endTime - startTime) / 60000)),
      type: timerType,
      reflection,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    }
    try {
      await saveSession(sessionData)
      feedback.textContent = 'Session saved!'
      feedback.style.color = 'green'
      setTimeout(() => {
        showStartButton()
        const historyContainer = document.getElementById('history')
        if (sessionHistory.showHistory && historyContainer) {
          sessionHistory.showHistory.call(null, historyContainer)
        }
      }, 1000)
    } catch (err) {
      feedback.textContent = 'Error saving session.'
      feedback.style.color = 'red'
      saveBtn.disabled = false
      saveBtn.textContent = 'Save session'
    }
  }

  function injectReflectionModalStyles() {
    if (document.getElementById('reflection-modal-style')) return
    const style = document.createElement('style')
    style.id = 'reflection-modal-style'
    style.textContent = `
      .reflection-modal {
        background: #fff;
        color: #222;
        border-radius: 12px;
        box-shadow: 0 4px 32px rgba(0,0,0,0.18);
        max-width: 350px;
        margin: 80px auto;
        padding: 2em 1.5em 1.5em 1.5em;
        position: relative;
        z-index: 1001;
        text-align: center;
      }
      #reflectionModal input[type="text"] {
        width: 90%;
        padding: 0.5em;
        margin-bottom: 1em;
        border-radius: 6px;
        border: 1px solid #ccc;
        font-size: 1em;
      }
      #reflectionModal button {
        margin: 0.5em 0.5em 0 0.5em;
      }
      #reflection-feedback {
        font-size: 1em;
        margin-bottom: 0.5em;
        min-height: 1.5em;
      }
    `
    document.head.appendChild(style)
  }

  showStartButton()
}
// INSTRUCTIONS: To enable the theme toggle, add this button to your HTML (e.g. in index.html or as the first child of #app):
// <button class="theme-toggle" aria-pressed="false" title="Switch to light mode">🌙</button>
// Then call setupThemeToggle() once on page load.
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
