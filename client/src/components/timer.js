// timer.js - Japanese Zen Minimalism Design
import { saveSession } from '../utils/saveSession'
import { historyApi } from '../main'
import { toast } from '../utils/toast'

export function setupThemeToggle() {
  const btn = document.querySelector('.theme-toggle')
  if (!btn) return

  // Initialize theme state
  const currentTheme = document.body.getAttribute('data-theme') || 'light'
  btn.setAttribute('aria-pressed', String(currentTheme === 'dark'))
  btn.title =
    currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  btn.textContent = currentTheme === 'dark' ? '☀️' : '🌙'

  btn.onclick = () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark'
    const newTheme = isDark ? '' : 'dark'

    document.body.setAttribute('data-theme', newTheme)
    btn.setAttribute('aria-pressed', String(!isDark))
    btn.title = isDark ? 'Switch to dark mode' : 'Switch to light mode'
    btn.textContent = isDark ? '🌙' : '☀️'

    // Announce theme change to screen readers
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.className = 'sr-only'
    announcement.textContent = `Switched to ${isDark ? 'light' : 'dark'} mode`
    document.body.appendChild(announcement)

    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement)
      }
    }, 2000)

    // Save preference to localStorage
    localStorage.setItem('kairo-theme', newTheme || 'light')
  }

  // Load saved theme preference
  const savedTheme = localStorage.getItem('kairo-theme')
  if (savedTheme && savedTheme !== currentTheme) {
    btn.click()
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
  let isTimerPaused = false
  let isEnded = false

  function formatTime(secs) {
    const minutes = String(Math.floor(secs / 60)).padStart(2, '0')
    const seconds = String(secs % 60).padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  function updateProgressRing(percentage) {
    const circle = document.querySelector('.progress-ring__circle')
    if (circle) {
      const radius = circle.r.baseVal.value
      const circumference = radius * 2 * Math.PI
      const offset = circumference - (percentage / 100) * circumference

      circle.style.strokeDasharray = `${circumference} ${circumference}`
      circle.style.strokeDashoffset = offset
    }
  }

  function showWelcomeScreen() {
    container.innerHTML = `
      <div class="timer-content">
        <div class="timer-settings">
          <div class="setting-group">
            <label class="setting-label" for="timer-minutes">Duration (min)</label>
            <input 
              id="timer-minutes" 
              type="number" 
              min="1" 
              max="120" 
              value="25" 
              class="setting-input" 
              aria-label="Session duration in minutes"
            >
          </div>
          
          <div class="setting-group">
            <label class="setting-label" for="timer-type">Session Type</label>
            <select 
              id="timer-type" 
              class="setting-input"
              style="width: 140px;"
              aria-label="Select focus session type"
            >
              <option value="Focus">Focus</option>
              <option value="Deep Work">Deep Work</option>
              <option value="Break">Break</option>
              <option value="Creative">Creative</option>
              <option value="Learning">Learning</option>
            </select>
          </div>
        </div>
        <div class="timer-circle" role="timer" aria-live="polite">
          <svg class="progress-ring" width="206" height="206">
            <circle
              class="progress-ring__circle"
              stroke-width="3"
              fill="transparent"
              r="100"
              cx="103"
              cy="103"
            />
          </svg>
          <div class="timer-display" id="timer-display" aria-label="Timer display">25:00</div>
          <div class="timer-label">Ready to Begin</div>
        </div>
        <div class="timer-controls">
          <button id="start-btn" class="control-btn primary" aria-describedby="start-help">
            Start Session
          </button>
          <div id="start-help" class="sr-only">Begin your focus session</div>
        </div>
      </div>
    `

    // Update display when settings change
    const minutesInput = document.getElementById('timer-minutes')
    const display = document.getElementById('timer-display')

    minutesInput.addEventListener('input', () => {
      const mins = parseInt(minutesInput.value, 10) || 25
      display.textContent = formatTime(mins * 60)
    })

    // Initialize progress ring
    updateProgressRing(0)

    document.getElementById('start-btn').onclick = startSession
  }

  function startSession() {
    const mins =
      parseInt(document.getElementById('timer-minutes').value, 10) || 25
    timerType = document.getElementById('timer-type').value
    timeLeft = mins * 60
    const totalTime = timeLeft
    isTimerActive = true
    isTimerPaused = false
    isEnded = false
    startTime = new Date().toISOString()

    // Show active timer UI
    container.innerHTML = `
      <div class="timer-content">
        <div class="timer-circle active" role="timer" aria-live="polite">
          <svg class="progress-ring" width="206" height="206">
            <circle
              class="progress-ring__circle"
              stroke-width="3"
              fill="transparent"
              r="100"
              cx="103"
              cy="103"
            />
          </svg>
          <div class="timer-display" id="timer-display">${formatTime(timeLeft)}</div>
          <div class="timer-label">${timerType} Session</div>
        </div>
        <div class="timer-controls">
          <button id="pause-btn" class="control-btn" aria-describedby="pause-help">
            Pause
          </button>
          <button id="stop-btn" class="control-btn" aria-describedby="stop-help">
            Stop
          </button>
          <div id="pause-help" class="sr-only">Pause the current session</div>
          <div id="stop-help" class="sr-only">Stop and end the current session</div>
        </div>
      </div>
    `

    // Update progress ring
    updateProgressRing(0)

    // Start countdown
    intervalId = setInterval(() => {
      if (!isTimerPaused && timeLeft > 0) {
        timeLeft--
        const display = document.getElementById('timer-display')
        if (display) {
          display.textContent = formatTime(timeLeft)
        }

        // Update progress
        const progress = ((totalTime - timeLeft) / totalTime) * 100
        updateProgressRing(progress)

        // Check if timer is complete
        if (timeLeft === 0) {
          endSession(true)
        }
      }
    }, 1000)

    // Add event listeners
    const pauseBtn = document.getElementById('pause-btn')
    const stopBtn = document.getElementById('stop-btn')

    pauseBtn.onclick = () => {
      isTimerPaused = !isTimerPaused
      pauseBtn.textContent = isTimerPaused ? 'Resume' : 'Pause'

      // Update timer circle class
      const circle = document.querySelector('.timer-circle')
      if (isTimerPaused) {
        circle.classList.remove('active')
      } else {
        circle.classList.add('active')
      }

      toast.info(isTimerPaused ? 'Session paused' : 'Session resumed')
    }

    stopBtn.onclick = () => endSession(false)

    toast.timer(`${timerType} session started (${mins} min)`, 'timer')
  }

  function endSession(completed) {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }

    isTimerActive = false
    isEnded = true
    endTime = new Date().toISOString()

    const mins =
      parseInt(document.getElementById('timer-minutes')?.value, 10) || 25
    const totalTime = mins * 60
    const actualDuration = Math.max(0, totalTime - timeLeft)

    // Save session data
    if (actualDuration > 0) {
      const sessionData = {
        type: timerType,
        duration: Math.floor(actualDuration / 60),
        actualTime: actualDuration,
        completed,
        startTime,
        endTime,
        date: new Date().toLocaleDateString(),
      }

      saveSession(sessionData)
      if (historyApi && typeof historyApi.refresh === 'function') {
        historyApi.refresh()
      }
    }

    // Show completion screen
    container.innerHTML = `
      <div class="timer-content">
        <div class="timer-circle" role="timer" aria-live="polite">
          <svg class="progress-ring" width="206" height="206">
            <circle
              class="progress-ring__circle"
              stroke-width="3"
              fill="transparent"
              r="100"
              cx="103"
              cy="103"
            />
          </svg>
          <div class="timer-display">${completed ? '✓' : '—'}</div>
          <div class="timer-label">${completed ? 'Completed' : 'Stopped'}</div>
        </div>
        <div class="timer-controls">
          <button id="new-session-btn" class="control-btn primary">
            New Session
          </button>
        </div>
      </div>
    `

    // Set progress ring to complete if finished
    updateProgressRing(
      completed ? 100 : ((totalTime - timeLeft) / totalTime) * 100,
    )

    document.getElementById('new-session-btn').onclick = showWelcomeScreen

    // Show toast notification
    if (completed) {
      toast.completion(`${timerType} session completed! Great work.`)
    } else {
      toast.info(
        `Session stopped after ${Math.floor(actualDuration / 60)} minutes`,
      )
    }

    // Announce completion to screen readers
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'assertive')
    announcement.className = 'sr-only'
    announcement.textContent = completed
      ? `${timerType} session completed successfully`
      : `${timerType} session stopped`
    document.body.appendChild(announcement)

    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement)
      }
    }, 3000)
  }

  // Initialize the timer
  showWelcomeScreen()
}

function showTimerPopup() {
  container.innerHTML = `
    <div class="timer-container">
      <div class="timer-setup">
        <div class="setup-header">
          <h3>⚙️ Configure Your Session</h3>
          <p>Customize your focus session for maximum productivity</p>
        </div>
        
        <div class="setup-grid">
          <label class="input-group">
            <span>⏱️ Duration</span>
            <input 
              id="timer-minutes" 
              type="number" 
              min="1" 
              max="120" 
              value="25" 
              class="timer-input" 
              placeholder="Minutes"
              aria-label="Session duration in minutes"
              aria-describedby="duration-help"
            >
            <div id="duration-help" class="sr-only">Enter session duration between 1 and 120 minutes</div>
          </label>
          
          <label class="input-group">
            <span>🎯 Focus Mode</span>
            <select 
              id="timer-type" 
              class="timer-select"
              aria-label="Select focus session type"
              aria-describedby="type-help"
            >
              <option value="Deep Work">🧠 Deep Work</option>
              <option value="Shallow Work">📝 Shallow Work</option>
              <option value="Short Break">☕ Short Break</option>
              <option value="Long Break">🌴 Long Break</option>
              <option value="Creative Time">🎨 Creative Time</option>
              <option value="Learning">📚 Learning</option>
            </select>
            <div id="type-help" class="sr-only">Choose the type of work or break session</div>
          </label>
        </div>
        
        <div class="timer-controls" role="group" aria-label="Session controls">
          <button id="popup-start" class="btn btn-primary" aria-describedby="start-help">
            <span aria-hidden="true">▶️</span>
            Begin Session
          </button>
          <button id="popup-cancel" class="btn btn-secondary" aria-describedby="cancel-help">
            <span aria-hidden="true">❌</span>
            Cancel
          </button>
          <div id="start-help" class="sr-only">Start the configured focus session</div>
          <div id="cancel-help" class="sr-only">Cancel setup and return to main screen</div>
        </div>
      </div>
    </div>`

  document.getElementById('popup-start').onclick = () => {
    const mins = parseInt(document.getElementById('timer-minutes').value, 10)
    if (isNaN(mins) || mins < 1) {
      toast.error('Please enter a duration of at least 1 minute.')
      // Focus back to input for accessibility
      document.getElementById('timer-minutes').focus()
      return
    }
    if (mins > 120) {
      toast.warning('Maximum session duration is 120 minutes.')
      document.getElementById('timer-minutes').focus()
      return
    }
    isEnded = false
    startCountdown()
  }
  document.getElementById('popup-cancel').onclick = () => {
    showWelcomeScreen()
  }

  // Focus management
  document.getElementById('timer-minutes').focus()
}

function startCountdown() {
  const mins = parseInt(document.getElementById('timer-minutes').value, 10)
  timerType = document.getElementById('timer-type').value
  timeLeft = mins * 60
  isTimerActive = true
  startTime = new Date()

  // Show toast for session start
  toast.focus(`${timerType} session started! Stay focused for ${mins} minutes.`)

  showTimerDisplay()
  intervalId = setInterval(() => {
    timeLeft--
    updateTimerDisplay()
    if (timeLeft <= 0) {
      clearInterval(intervalId)
      isTimerActive = false
      isEnded = true
      endTime = new Date()

      // Show completion toast
      toast.completion(
        `🎉 ${timerType} session completed! Time to reflect on your progress.`,
      )

      showRefectionModal()
    }
  }, 1000)
}

// Modify showTimerDisplay to include the progress ring
function showTimerDisplay() {
  const totalSeconds =
    parseInt(document.getElementById('timer-minutes')?.value || 25, 10) * 60
  // Fix: Progress should be how much is completed, not remaining
  const percent = ((totalSeconds - timeLeft) / totalSeconds) * 100 || 0

  // Add pulsing class if timer is active
  const circleClass = isTimerActive ? 'timer-circle active' : 'timer-circle'
  const statusText = isTimerActive ? 'Focus Mode' : 'Paused'
  const toggleButtonText = isTimerActive ? 'Pause Session' : 'Resume Session'
  const toggleButtonIcon = isTimerActive ? '⏸️' : '▶️'

  container.innerHTML = `
      <div class="timer-container">
        <div class="timer-circle-container">
          <div class="${circleClass}" style="--progress: ${percent}" role="progressbar" aria-valuenow="${Math.round(percent)}" aria-valuemin="0" aria-valuemax="100" aria-label="Session progress">
            <div class="timer-inner-content">
              <div class="timer-display" aria-live="polite" aria-atomic="true">${formatTime(timeLeft)}</div>
              <div class="timer-status-text" aria-live="polite">${statusText}</div>
            </div>
          </div>
        </div>
        
        <div class="timer-controls" role="group" aria-label="Timer controls">
          <button 
            id="timer-status" 
            class="btn ${isTimerActive ? 'btn-warning' : 'btn-primary'}"
            aria-label="${toggleButtonText}"
            aria-describedby="timer-status-help"
          >
            <span aria-hidden="true">${toggleButtonIcon}</span>
            ${toggleButtonText}
          </button>
          <button 
            id="timer-cancel" 
            class="btn btn-secondary"
            aria-label="End current session"
            aria-describedby="timer-cancel-help"
          >
            <span aria-hidden="true">🛑</span>
            End Session
          </button>
          <div id="timer-status-help" class="sr-only">
            ${isTimerActive ? 'Pause the current focus session' : 'Resume the paused focus session'}
          </div>
          <div id="timer-cancel-help" class="sr-only">End the current session and return to main screen</div>
        </div>
      </div>`
  setTimerProgress(percent)
  document.getElementById('timer-status').onclick = togglePauseTimer
  document.getElementById('timer-cancel').onclick = cancelTimer
}

function getTimerEmoji(type) {
  const emojis = {
    'Deep Work': '🧠',
    'Shallow Work': '📝',
    'Short Break': '☕',
    'Long Break': '🌴',
    'Creative Time': '🎨',
    Learning: '📚',
  }
  return emojis[type] || '🎯'
}

function getMotivationalMessage(type) {
  const messages = {
    'Deep Work': "Dive deep into focused work. You've got this!",
    'Shallow Work': 'Tackle those quick tasks efficiently',
    'Short Break': 'Take a moment to recharge your mind',
    'Long Break': 'Relax and reset for the next session',
    'Creative Time': 'Let your creativity flow freely',
    Learning: 'Expand your knowledge and grow',
  }
  return messages[type] || 'Stay focused and productive'
}

function togglePauseTimer() {
  if (isTimerActive) {
    clearInterval(intervalId)
    isTimerActive = false
    toast.timer('Session paused. Take a breath and resume when ready.')
    showTimerDisplay()
  } else {
    isTimerActive = true
    toast.timer("Session resumed. Let's get back to focused work!")
    intervalId = setInterval(() => {
      timeLeft--
      updateTimerDisplay()
      if (timeLeft <= 0) {
        clearInterval(intervalId)
        isTimerActive = false
        isEnded = true
        endTime = new Date()
        toast.completion(
          `🎉 ${timerType} session completed! Time to reflect on your progress.`,
        )
        showRefectionModal()
      }
    }, 1000)
    showTimerDisplay()
  }
}

function cancelTimer() {
  clearInterval(intervalId)
  isTimerActive = false
  toast.info('Session cancelled. Ready to start a new one?')
  showWelcomeScreen()
}

function updateTimerDisplay() {
  // Update the timer display text
  const timerDisplayEl = document.querySelector('.timer-display')
  if (timerDisplayEl) {
    timerDisplayEl.textContent = formatTime(timeLeft)
  }

  // Update progress ring
  const totalSeconds =
    parseInt(document.getElementById('timer-minutes')?.value || 25, 10) * 60
  const percent = ((totalSeconds - timeLeft) / totalSeconds) * 100 || 0
  setTimerProgress(percent)
}

function showRefectionModal() {
  if (isEnded) {
    // Inject modal CSS if not present
    injectReflectionModalStyles()
    container.innerHTML = `
      <div id="reflectionModal" class="reflection-modal" role="dialog" aria-labelledby="reflection-title" aria-describedby="reflection-description">
        <div class="reflection-header">
          <h3 id="reflection-title">🎯 Session Complete!</h3>
          <p id="reflection-description">How did this ${timerType.toLowerCase()} session go?</p>
        </div>
        <div class="reflection-input-group">
          <label for="reflection-text">💭 Your Reflection</label>
          <input 
            type="text" 
            placeholder="What went well? Any insights or challenges?" 
            id="reflection-text" 
            class="reflection-input"
            aria-describedby="reflection-help"
            maxlength="500"
          >
          <div id="reflection-help" class="sr-only">Optional: Share your thoughts about this session (maximum 500 characters)</div>
        </div>
        <div class="reflection-actions" role="group" aria-label="Session completion actions">
          <button 
            id="saveButton" 
            type="button" 
            class="btn btn-primary"
            aria-describedby="save-help"
          >
            <span aria-hidden="true">💾</span>
            Save Session
          </button>
          <button 
            id="dontSaveButton" 
            type="button" 
            class="btn btn-secondary"
            aria-describedby="skip-help"
          >
            <span aria-hidden="true">❌</span>
            Skip & Continue
          </button>
          <div id="save-help" class="sr-only">Save this session with your reflection to your history</div>
          <div id="skip-help" class="sr-only">Skip saving and continue without recording this session</div>
        </div>
      </div>
      `
    document.getElementById('saveButton').onclick = saveCurrentSession
    document.getElementById('dontSaveButton').onclick = () => {
      toast.info('Session skipped. Ready for your next focus session!')
      showWelcomeScreen()
    }

    // Focus management for accessibility
    document.getElementById('reflection-text').focus()

    // Keyboard navigation support
    const modal = document.getElementById('reflectionModal')
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toast.info('Session skipped. Ready for your next focus session!')
        showStartButton()
      }
    })
  }
}

async function saveCurrentSession() {
  const saveBtn = document.getElementById('saveButton')
  const reflection = document.getElementById('reflection-text').value

  saveBtn.disabled = true
  saveBtn.textContent = '💾 Saving...'

  const sessionData = {
    duration: Math.max(1, Math.round((endTime - startTime) / 60000)),
    type: timerType,
    reflection,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  }

  try {
    await saveSession(sessionData)
    toast.save('Session saved successfully! Your progress has been recorded.')

    setTimeout(() => {
      showWelcomeScreen()
      const historyContainer = document.getElementById('history')
      if (sessionHistory.showHistory && historyContainer) {
        sessionHistory.showHistory.call(null, historyContainer)
      }
    }, 1000)
  } catch (err) {
    toast.error(
      'Failed to save session. Please check your connection and try again.',
    )
    saveBtn.disabled = false
    saveBtn.innerHTML = '<span>💾</span>Save Session'
  }
}

function injectReflectionModalStyles() {
  if (document.getElementById('reflection-modal-style')) return
  const style = document.createElement('style')
  style.id = 'reflection-modal-style'
  style.textContent = `
      .reflection-modal {
        background: var(--surface-glass);
        backdrop-filter: var(--glass-backdrop);
        border: var(--glass-border);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        max-width: 500px;
        margin: 0 auto;
        box-shadow: var(--shadow-intense);
        position: relative;
        overflow: hidden;
        text-align: center;
      }
      
      .reflection-modal::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--secondary-gradient);
        opacity: 0.8;
      }
      
      .reflection-header {
        margin-bottom: var(--spacing-lg);
      }
      
      .reflection-header h3 {
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: var(--spacing-xs);
        background: var(--secondary-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .reflection-header p {
        color: var(--text-secondary);
        font-size: 1rem;
        margin: 0;
      }
      
      .reflection-input-group {
        margin-bottom: var(--spacing-lg);
        text-align: left;
      }
      
      .reflection-input-group label {
        display: block;
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--spacing-xs);
      }
      
      .reflection-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        border: var(--glass-border);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        color: var(--text-primary);
        font-family: inherit;
        font-size: 1rem;
        backdrop-filter: var(--glass-backdrop);
        transition: all 0.3s ease;
        box-sizing: border-box;
      }
      
      .reflection-input:focus {
        outline: none;
        border: 1px solid rgba(79, 172, 254, 0.5);
        background: rgba(79, 172, 254, 0.1);
        box-shadow: 0 0 20px rgba(79, 172, 254, 0.2);
      }
      
      .reflection-input::placeholder {
        color: var(--text-muted);
        font-style: italic;
      }
      
      .reflection-feedback {
        min-height: 1.5em;
        margin-bottom: var(--spacing-md);
        font-weight: 500;
        font-size: 0.95rem;
      }
      
      .reflection-actions {
        display: flex;
        gap: var(--spacing-sm);
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .reflection-actions .btn {
        min-width: 140px;
        flex: 1;
        max-width: 200px;
      }
      
      @media (max-width: 480px) {
        .reflection-modal {
          margin: var(--spacing-sm);
          padding: var(--spacing-lg);
        }
        
        .reflection-actions {
          flex-direction: column;
        }
        
        .reflection-actions .btn {
          width: 100%;
          max-width: none;
        }
      }
    `
  document.head.appendChild(style)
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
