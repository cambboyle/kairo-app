export function startTimer(container) {
  let isTimerActive = false
  let timeLeft = 0
  let timerInterval
  let startTime = null
  let endTime = null
  let intervalId = null

  function formatTime(secs) {
    const minutes = String(Math.floor(secs / 60)).padStart(2, '0')
    const seconds = String(secs % 60).padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  function showStartButton() {
    container.innerHTML = `<button id="start-timer-btn">Start Timer</button>`
    document.getElementById('start-timer-btn').onclick = () => {
      console.log('This works')
      showTimerPopup()
    }
  }

  function showTimerPopup() {
    container.innerHTML = `
    <div class="modal"><label>Duration (minutes): <input id=timer-minutes type="number" min="1" value="25"></label><br>
    <button id="popup-start">Start</button>`
    document.getElementById('popup-start').onclick = () => {
      const mins = parseInt(document.getElementById('timer-minutes').value, 10)
      if (isNaN(mins) || mins < 1) {
        alert('Please enter a duration of at least 1 minutes.')
        return
      }
      startCountdown()
    }
  }

  function startCountdown() {
    const mins = parseInt(document.getElementById('timer-minutes').value, 10)
    isTimerActive = true
    startTime = new Date()
    timeLeft = mins * 60
    showTimerDisplay()
    intervalId = setInterval(() => {
      timeLeft--
      updateTimerDisplay()
      if (timeLeft <= 0) {
        clearInterval(intervalId)
        isTimerActive = false
        endTime = new Date()
      }
    })
  }

  function showTimerDisplay() {
    container.innerHTML = `
    <div>
        <h2>Timer</h2>
        <div id="timer-countdown">${formatTime(timeLeft)}</div>
    </div>`
  }

  function updateTimerDisplay() {
    const el = document.getElementById('timer-countdown')
    if (el) el.textContent = formatTime(timeLeft)
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
