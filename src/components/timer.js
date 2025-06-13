// timer.js - Japanese Zen Minimalism Design
import { saveSession } from '../utils/saveSession'
import { historyApi, analyticsApi } from '../main'
import { notifications } from '../utils/notifications'
import { toast } from '../utils/feedback'
import {
  recordSession,
  getStreakData,
  getStreakMessage,
} from '../utils/streakManager'
import {
  SESSION_TYPES,
  MOOD_OPTIONS,
  DURATION_PRESETS,
  getSessionIcon,
  getDefaultDuration,
} from '../config/sessionConfig'

export function startTimer(container) {
  console.log('startTimer called', container)
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

  function showWelcomeScreen() {
    // Get current streak data
    const streakData = getStreakData()
    const streakMessage = getStreakMessage(streakData)

    container.innerHTML = `
      <div class="timer-content">
        ${
          streakData.currentStreak > 0
            ? `
          <div class="streak-display" role="status" aria-live="polite">
            <div class="streak-counter">🔥 ${streakData.currentStreak} day streak</div>
            <div class="streak-message">${streakMessage}</div>
          </div>
        `
            : ''
        }
        <div class="timer-settings">
          <div class="setting-group">
            <label class="setting-label" for="timer-minutes">Duration (min)</label>
            <div class="duration-controls">
              <div class="duration-presets">
                ${DURATION_PRESETS.map(
                  (preset) => `
                  <button 
                    type="button" 
                    class="duration-preset-btn" 
                    data-duration="${preset.value}" 
                    aria-label="${preset.label} session"
                    ${preset.value === 25 ? 'data-selected="true"' : ''}
                  >
                    ${preset.label}
                  </button>
                `,
                ).join('')}
              </div>
              <input 
                id="timer-minutes" 
                type="number" 
                min="1" 
                max="120" 
                value="25" 
                class="setting-input duration-input" 
                aria-label="Session duration in minutes"
                placeholder="Custom"
              >
            </div>
          </div>
          
          <div class="setting-group">
            <label class="setting-label" for="timer-type">Session Type</label>
            <select 
              id="timer-type" 
              class="setting-input"
              style="width: 140px;"
              aria-label="Select focus session type"
            >
              ${Object.values(SESSION_TYPES)
                .map(
                  (type) => `
                <option value="${type.id}">${type.icon} ${type.name}</option>
              `,
                )
                .join('')}
            </select>
          </div>
        </div>
        <div class="timer-circle" role="timer" aria-live="polite">
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
    const typeSelect = document.getElementById('timer-type')
    const display = document.getElementById('timer-display')
    const presetButtons = document.querySelectorAll('.duration-preset-btn')

    minutesInput.addEventListener('input', () => {
      const mins = parseInt(minutesInput.value, 10) || 25
      display.textContent = formatTime(mins * 60)

      // Update preset button selection
      presetButtons.forEach((btn) => btn.removeAttribute('data-selected'))
      const matchingPreset = [...presetButtons].find(
        (btn) => parseInt(btn.getAttribute('data-duration')) === mins,
      )
      if (matchingPreset) {
        matchingPreset.setAttribute('data-selected', 'true')
      }
    })

    // Handle duration preset clicks
    presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const duration = btn.getAttribute('data-duration')
        if (duration && duration !== 'null') {
          minutesInput.value = duration
          display.textContent = formatTime(parseInt(duration) * 60)

          // Update visual selection
          presetButtons.forEach((b) => b.removeAttribute('data-selected'))
          btn.setAttribute('data-selected', 'true')
        } else {
          // Custom duration - focus input
          minutesInput.focus()
          minutesInput.select()
        }
      })
    })

    // Update duration when session type changes
    typeSelect.addEventListener('change', () => {
      const selectedType = typeSelect.value
      const defaultDuration = getDefaultDuration(selectedType)
      minutesInput.value = defaultDuration
      display.textContent = formatTime(defaultDuration * 60)

      // Update preset button selection
      presetButtons.forEach((btn) => btn.removeAttribute('data-selected'))
      const matchingPreset = [...presetButtons].find(
        (btn) =>
          parseInt(btn.getAttribute('data-duration')) === defaultDuration,
      )
      if (matchingPreset) {
        matchingPreset.setAttribute('data-selected', 'true')
      }
    })

    document.getElementById('start-btn').onclick = startSession
  }

  async function startSession() {
    console.log('startSession called')
    const mins =
      parseInt(document.getElementById('timer-minutes').value, 10) || 25
    timerType = document.getElementById('timer-type').value
    timeLeft = mins * 60
    isTimerActive = true
    isTimerPaused = false
    isEnded = false
    startTime = new Date()

    // Request notification permission if this is user's first session
    await notifications.requestNotificationPermission()

    // Play start sound and notify
    await notifications.notifySessionStart(timerType, mins)

    // Initialize session notes
    if (window.sessionNotesManager) {
      window.sessionNotesManager.onSessionStart()
    }

    // Show active timer UI
    container.innerHTML = `
      <div class="timer-content">
        <div class="timer-circle active" role="timer" aria-live="polite">
          <div class="timer-progress">
            <svg class="progress-ring" width="200" height="200">
              <circle
                class="progress-ring-circle"
                stroke="rgba(79, 86, 79, 0.2)"
                stroke-width="3"
                fill="transparent"
                r="95"
                cx="100"
                cy="100"
              />
              <circle
                class="progress-ring-progress"
                stroke="var(--primary)"
                stroke-width="3"
                fill="transparent"
                r="95"
                cx="100"
                cy="100"
                style="--progress: 0"
              />
            </svg>
          </div>
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

    // Start countdown
    const totalTime = timeLeft
    intervalId = setInterval(() => {
      if (!isTimerPaused && timeLeft > 0) {
        timeLeft--
        const display = document.getElementById('timer-display')
        const progressRing = document.querySelector('.progress-ring-progress')

        if (display) {
          display.textContent = formatTime(timeLeft)
        } // Update progress ring
        if (progressRing) {
          const progress = ((totalTime - timeLeft) / totalTime) * 100
          const circumference = 2 * Math.PI * 95 // radius = 95
          const offset = circumference * (1 - progress / 100)

          progressRing.style.strokeDasharray = circumference
          progressRing.style.strokeDashoffset = offset
          progressRing.style.setProperty('--progress', progress)

          console.log(
            `Timer progress: ${progress.toFixed(1)}% (${timeLeft}/${totalTime})`,
          )
        }

        // Check if timer is complete
        if (timeLeft === 0) {
          endSession(true)
        }
      }
    }, 1000)

    // Add event listeners
    const pauseBtn = document.getElementById('pause-btn')
    const stopBtn = document.getElementById('stop-btn')

    pauseBtn.onclick = async () => {
      isTimerPaused = !isTimerPaused
      pauseBtn.textContent = isTimerPaused ? 'Resume' : 'Pause'

      // Update timer circle class
      const circle = document.querySelector('.timer-circle')
      if (isTimerPaused) {
        circle.classList.remove('active')
        await notifications.notifySessionPause()
      } else {
        circle.classList.add('active')
      }

      toast.info(isTimerPaused ? 'Session paused' : 'Session resumed')
    }

    stopBtn.onclick = () => endSession(false)

    toast.timer(`${timerType} session started (${mins} min)`, 'timer')
  }

  function endSession(completed) {
    console.log('endSession called, completed:', completed)
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    isTimerActive = false
    isEnded = true
    endTime = new Date()

    // Handle session notes
    if (window.sessionNotesManager) {
      window.sessionNotesManager.onSessionEnd()
    }

    if (completed) {
      // Calculate duration for notification
      const duration = Math.max(1, Math.round((endTime - startTime) / 60000))
      // Notify session completion with sound and browser notification
      notifications.notifySessionComplete(timerType, duration)
      showRefectionModal()
    } else {
      // If session was stopped/cancelled, do not save
      container.innerHTML = `
        <div class="timer-content">
          <div class="timer-circle" role="timer" aria-live="polite">
            <div class="timer-display">—</div>
            <div class="timer-label">Stopped</div>
          </div>
          <div class="timer-controls">
            <button id="new-session-btn" class="control-btn primary">
              New Session
            </button>
          </div>
        </div>
      `
      document.getElementById('new-session-btn').onclick = showWelcomeScreen
      toast.info('Session stopped before completion. Not saved.')
      // Announce to screen readers
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'assertive')
      announcement.className = 'sr-only'
      announcement.textContent = `${timerType} session stopped`
      document.body.appendChild(announcement)
      setTimeout(() => {
        if (announcement.parentNode) {
          announcement.parentNode.removeChild(announcement)
        }
      }, 3000)
    }
  }

  // Initialize the timer
  showWelcomeScreen()

  function showRefectionModal() {
    console.log('showRefectionModal called')
    injectReflectionModalStyles()

    // Get session notes if available
    const sessionNotes = window.sessionNotesManager
      ? window.sessionNotesManager.onSessionSave()
      : ''

    container.innerHTML = `
      <div id="reflectionModal" class="reflection-modal" role="dialog" aria-labelledby="reflection-title" aria-describedby="reflection-description">
        <div class="reflection-header">
          <h3 id="reflection-title">🎯 Session Complete!</h3>
          <p id="reflection-description">How was your session? Share your thoughts and mood.</p>
        </div>
        
        ${
          sessionNotes
            ? `
        <div class="session-notes-summary">
          <div class="notes-summary-header">
            <span class="notes-icon">📝</span>
            <span class="notes-title">Your Session Notes</span>
          </div>
          <div class="notes-summary-content">
            <div class="notes-text">${sessionNotes}</div>
          </div>
        </div>
        `
            : ''
        }
        
        <div class="mood-selector-group">
          <label class="mood-label">How did this session feel?</label>
          <div class="mood-options" role="radiogroup" aria-labelledby="mood-label">
            ${MOOD_OPTIONS.map(
              (mood) => `
              <button 
                type="button" 
                class="mood-btn" 
                data-mood="${mood.id}"
                aria-label="${mood.label}"
                title="${mood.label}"
                style="--mood-color: ${mood.color}"
              >
                <span class="mood-icon">${mood.icon}</span>
                <span class="mood-text">${mood.label}</span>
              </button>
            `,
            ).join('')}
          </div>
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
    console.log(
      'Modal HTML rendered:',
      document.getElementById('reflectionModal'),
    )

    // Handle mood selection
    let selectedMood = null
    const moodButtons = document.querySelectorAll('.mood-btn')
    moodButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Clear previous selection
        moodButtons.forEach((b) => b.classList.remove('selected'))
        // Select current
        btn.classList.add('selected')
        selectedMood = btn.getAttribute('data-mood')

        // Update button states for accessibility
        moodButtons.forEach((b) => b.setAttribute('aria-checked', 'false'))
        btn.setAttribute('aria-checked', 'true')
      })
    })

    document.getElementById('saveButton').onclick = () =>
      saveCurrentSession(selectedMood)
    document.getElementById('dontSaveButton').onclick = () => {
      toast.info('Session skipped. Ready for your next focus session!')
      showWelcomeScreen()
    }
    document.getElementById('reflection-text').focus()
  }

  async function saveCurrentSession(selectedMood = null) {
    const saveBtn = document.getElementById('saveButton')
    const reflection = document.getElementById('reflection-text').value

    // Get session notes
    const sessionNotes = window.sessionNotesManager
      ? window.sessionNotesManager.onSessionSave()
      : ''

    saveBtn.disabled = true
    saveBtn.textContent = '💾 Saving...'
    // Calculate duration in minutes
    const duration = Math.max(1, Math.round((endTime - startTime) / 60000))
    const sessionData = {
      duration,
      type: timerType,
      reflection,
      notes: sessionNotes,
      mood: selectedMood,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    }
    try {
      await saveSession(sessionData)

      // Record session for streak tracking
      const { streakData } = recordSession(timerType, endTime)

      // Clean up session notes after successful save
      if (window.sessionNotesManager) {
        window.sessionNotesManager.cleanup()
      }

      // Show appropriate success message based on streak
      if (streakData.currentStreak > 1) {
        toast.save(`Session saved! 🔥 ${streakData.currentStreak} day streak!`)
      } else {
        toast.save(
          'Session saved successfully! Your progress has been recorded.',
        )
      }

      setTimeout(() => {
        showWelcomeScreen()
        if (historyApi && typeof historyApi.refresh === 'function') {
          historyApi.refresh()
        }
        if (analyticsApi && typeof analyticsApi.refresh === 'function') {
          analyticsApi.refresh()
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
      
      .session-notes-summary {
        background: var(--surface-subtle);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
        text-align: left;
      }
      
      .notes-summary-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        margin-bottom: var(--spacing-sm);
      }
      
      .notes-summary-header .notes-icon {
        color: var(--text-secondary);
        font-size: 1rem;
      }
      
      .notes-summary-header .notes-title {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .notes-summary-content {
        background: var(--surface-glass);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        padding: var(--spacing-sm);
      }
      
      .notes-text {
        color: var(--text-primary);
        font-size: 0.95rem;
        line-height: 1.5;
        white-space: pre-wrap;
        word-wrap: break-word;
        max-height: 80px;
        overflow-y: auto;
      }
      
      .mood-selector-group {
        margin-bottom: var(--spacing-lg);
        text-align: left;
      }
      
      .mood-label {
        display: block;
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--spacing-sm);
      }
      
      .mood-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--spacing-xs);
        margin-bottom: var(--spacing-md);
      }
      
      .mood-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        font-family: inherit;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .mood-btn:hover {
        background: rgba(var(--mood-color), 0.1);
        border-color: rgba(var(--mood-color), 0.3);
        color: var(--text-primary);
        transform: translateY(-1px);
      }
      
      .mood-btn.selected {
        background: rgba(var(--mood-color), 0.15);
        border-color: rgba(var(--mood-color), 0.5);
        color: var(--text-primary);
        box-shadow: 0 0 10px rgba(var(--mood-color), 0.3);
      }
      
      .mood-btn:focus {
        outline: 2px solid rgba(79, 172, 254, 0.5);
        outline-offset: 2px;
      }
      
      .mood-icon {
        font-size: 1.2rem;
        display: block;
      }
      
      .mood-text {
        font-weight: 500;
        font-size: 0.75rem;
        text-align: center;
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
}

// TIMER COMPONENT INSTRUCTIONS:
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
