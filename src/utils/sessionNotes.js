// Session notes manager for Kairo
// Provides optional note-taking during focus sessions

class SessionNotesManager {
  constructor() {
    this.notes = ''
    this.isVisible = false
    this.notesContainer = null
    this.initialized = false
    // Don't init immediately - wait for DOM to be ready
  }

  init() {
    if (this.initialized) return
    this.createNotesInterface()
    this.setupEventListeners()
    this.initialized = true
  }

  ensureInitialized() {
    if (!this.initialized) {
      this.init()
    }
  }

  createNotesInterface() {
    // Create the notes container (initially hidden)
    this.notesContainer = document.createElement('div')
    this.notesContainer.className = 'session-notes-container'
    this.notesContainer.style.display = 'none'
    this.notesContainer.innerHTML = `
      <div class="session-notes-header">
        <span class="notes-icon">📝</span>
        <span class="notes-title">Session Notes</span>
        <button class="notes-toggle" aria-label="Hide notes" type="button">
          <span class="toggle-icon">−</span>
        </button>
      </div>
      <div class="session-notes-content">
        <textarea 
          class="session-notes-textarea" 
          placeholder="Quick thoughts, insights, or observations..."
          aria-label="Session notes"
          rows="3"
        ></textarea>
        <div class="notes-hint">
          <span class="hint-text">Notes are automatically saved with your session</span>
        </div>
      </div>
    `

    // Append to body initially, will be moved when timer starts
    document.body.appendChild(this.notesContainer)
  }

  attachToTimer() {
    // Move notes container to the active timer content area
    const timerContent = document.querySelector('.timer-content')
    if (
      timerContent &&
      this.notesContainer &&
      this.notesContainer.parentNode !== timerContent
    ) {
      timerContent.appendChild(this.notesContainer)
    }
  }

  setupEventListeners() {
    // Toggle visibility
    this.notesContainer
      .querySelector('.notes-toggle')
      .addEventListener('click', () => {
        this.toggleVisibility()
      })

    // Auto-save notes
    const textarea = this.notesContainer.querySelector(
      '.session-notes-textarea',
    )
    textarea.addEventListener('input', (e) => {
      this.notes = e.target.value
      this.autosave()
    })
  }

  showNotes() {
    if (!this.isVisible) {
      this.notesContainer.style.display = 'block'
      this.isVisible = true

      // Animate in
      requestAnimationFrame(() => {
        this.notesContainer.classList.add('notes-visible')
      })

      // Update toggle button
      const toggleBtn = this.notesContainer.querySelector('.notes-toggle')
      const toggleIcon = toggleBtn.querySelector('.toggle-icon')
      toggleBtn.setAttribute('aria-label', 'Hide notes')
      toggleIcon.textContent = '−'
    }
  }

  hideNotes() {
    if (this.isVisible) {
      this.notesContainer.classList.remove('notes-visible')

      // Hide after animation
      setTimeout(() => {
        this.notesContainer.style.display = 'none'
        this.isVisible = false
      }, 200)

      // Update toggle button
      const toggleBtn = this.notesContainer.querySelector('.notes-toggle')
      const toggleIcon = toggleBtn.querySelector('.toggle-icon')
      toggleBtn.setAttribute('aria-label', 'Show notes')
      toggleIcon.textContent = '+'
    }
  }

  toggleVisibility() {
    if (this.isVisible) {
      this.hideNotes()
    } else {
      this.showNotes()
    }
  }

  // Called when timer starts
  onSessionStart() {
    this.ensureInitialized()
    this.attachToTimer()
    this.clearNotes()
    this.showNotes()
  }

  // Called when timer stops
  onSessionEnd() {
    this.hideNotes()
  }

  // Called when session is saved
  onSessionSave() {
    return this.notes.trim()
  }

  clearNotes() {
    this.notes = ''
    const textarea = this.notesContainer.querySelector(
      '.session-notes-textarea',
    )
    textarea.value = ''
  }

  setNotes(notes) {
    this.notes = notes || ''
    const textarea = this.notesContainer.querySelector(
      '.session-notes-textarea',
    )
    textarea.value = this.notes
  }

  autosave() {
    // Save to localStorage as backup
    localStorage.setItem('kairo-session-notes-temp', this.notes)
  }

  restoreNotes() {
    // Restore from localStorage if available
    const saved = localStorage.getItem('kairo-session-notes-temp')
    if (saved) {
      this.setNotes(saved)
    }
  }

  cleanup() {
    // Clean up temporary notes
    localStorage.removeItem('kairo-session-notes-temp')
  }
}

// Create global instance
export const sessionNotesManager = new SessionNotesManager()

// Convenience functions
export const showSessionNotes = () => sessionNotesManager.showNotes()
export const hideSessionNotes = () => sessionNotesManager.hideNotes()
export const getSessionNotes = () => sessionNotesManager.onSessionSave()
export const setSessionNotes = (notes) => sessionNotesManager.setNotes(notes)
export const clearSessionNotes = () => sessionNotesManager.clearNotes()

// Session lifecycle hooks
export const onSessionStart = () => sessionNotesManager.onSessionStart()
export const onSessionEnd = () => sessionNotesManager.onSessionEnd()
export const onSessionSave = () => sessionNotesManager.onSessionSave()
