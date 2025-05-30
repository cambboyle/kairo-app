import { saveSession } from '../utils/saveSession'
import { sessionHistory } from './history'

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

  function showTimerDisplay() {
    container.innerHTML = `
      <div>
        <div class="timer-circle">
          <div id="timer-mode">${timerType}</div>
          <div id="timer-countdown">${formatTime(timeLeft)}</div>
        </div>
          <div class="timer-buttons">
            <button id="timer-status">${isTimerActive ? 'Pause' : 'Resume'} Timer</button>
            <button id="timer-cancel">Cancel Timer</button>
          </div>
      </div>`
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
          endedAt = new Date()
          showReflectionPrompt()
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
      container.innerHTML = `
      <div id="reflectionModal">
        <h3>How did this session go?</h3>
        <input type="text" placeholder="write your reflection here..." id="reflection-text">
        <button id="saveButton" type="button">Save session</button>
        <button id="dontSaveButton" type="button">Don't save session</button>
      </div>
      `
      document.getElementById('saveButton').onclick = saveCurrentSession
      document.getElementById('dontSaveButton').onclick = showStartButton
    }
  }

  async function saveCurrentSession() {
    console.log('Session saved')
    const reflection = document.getElementById('reflection-text').value
    const sessionData = {
      duration: Math.max(1, Math.round((endTime - startTime) / 60000)),
      type: timerType,
      reflection,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    }
    console.log('Saving session:', sessionData)
    try {
      await saveSession(sessionData)
      showStartButton()
      const historyContainer = document.getElementById('history')
      if (sessionHistory.showHistory && historyContainer) {
        sessionHistory.showHistory.call(null, historyContainer)
      }
    } catch (err) {
      container.innerHTML = `<div>Error saving session.</div>`
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
