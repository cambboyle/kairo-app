// Session Notes Manager
// A simple and effective notes manager for tracking session notes

export class SessionNotesManager {
  constructor() {
    this.notesContainer = null
    this.notesTextarea = null
    this.statusElement = null
    this.isVisible = false
    this.saveTimeout = null
  }

  initialize(container) {
    if (!container) return false

    this.notesContainer = this.createNotesContainer()
    container.appendChild(this.notesContainer)

    this.notesTextarea = this.notesContainer.querySelector(
      '.session-notes-textarea',
    )
    this.statusElement = this.notesContainer.querySelector('.notes-status')

    this.setupEventListeners()
    return true
  }

  createNotesContainer() {
    const container = document.createElement('div')
    container.className = 'session-notes-container'
    container.innerHTML = `
      <div class="session-notes-header">
        <h3>Session Notes</h3>
        <div class="notes-status"></div>
      </div>
      <textarea 
        class="session-notes-textarea" 
        placeholder="Capture your thoughts, insights, or progress during this session..."
        rows="4"
      ></textarea>
      <div class="session-notes-actions">
        <button type="button" class="notes-clear-btn">Clear</button>
      </div>
    `
    return container
  }

  setupEventListeners() {
    if (this.notesTextarea) {
      this.notesTextarea.addEventListener('input', () => {
        this.debouncedAutoSave()
      })
    }

    const clearBtn = this.notesContainer.querySelector('.notes-clear-btn')
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearNotes()
      })
    }
  }

  debouncedAutoSave() {
    clearTimeout(this.saveTimeout)
    this.updateSaveStatus('typing')

    this.saveTimeout = setTimeout(() => {
      this.updateSaveStatus('saved')
    }, 1000)
  }

  updateSaveStatus(status) {
    if (this.statusElement) {
      switch (status) {
        case 'typing':
          this.statusElement.textContent = '✏️ Typing...'
          this.statusElement.className = 'notes-status typing'
          break
        case 'saving':
          this.statusElement.textContent = '💾 Saving...'
          this.statusElement.className = 'notes-status saving'
          break
        case 'saved':
          this.statusElement.textContent = '✓ Saved'
          this.statusElement.className = 'notes-status saved'
          break
        case 'cleared':
          this.statusElement.textContent = '🗑️ Cleared'
          this.statusElement.className = 'notes-status cleared'
          break
        default:
          this.statusElement.textContent = ''
          this.statusElement.className = 'notes-status'
      }
    }
  }

  onSessionStart() {
    this.clearNotes()
    this.showNotes()
  }

  onSessionEnd() {
    this.hideNotes()
  }

  showNotes() {
    if (this.notesContainer) {
      this.notesContainer.style.display = 'block'
      this.isVisible = true
      if (this.notesTextarea) {
        this.notesTextarea.focus()
      }
    }
  }

  hideNotes() {
    if (this.notesContainer) {
      this.notesContainer.style.display = 'none'
      this.isVisible = false
    }
  }

  clearNotes() {
    if (this.notesTextarea) {
      this.notesTextarea.value = ''
      this.notesTextarea.focus()
      this.updateSaveStatus('cleared')
    }
  }

  getNotes() {
    return this.notesTextarea ? this.notesTextarea.value.trim() : ''
  }

  setNotes(notes) {
    if (this.notesTextarea) {
      this.notesTextarea.value = notes || ''
    }
  }

  destroy() {
    if (this.notesContainer && this.notesContainer.parentNode) {
      this.notesContainer.parentNode.removeChild(this.notesContainer)
    }
    this.notesContainer = null
    this.notesTextarea = null
    this.statusElement = null
    this.isVisible = false
    clearTimeout(this.saveTimeout)
  }
}

// Global instance for convenience
const globalSessionNotesManager = new SessionNotesManager()

// Exported functions for external use
export const initializeSessionNotes = (container) =>
  globalSessionNotesManager.initialize(container)
export const enhancedSessionNotesManager = globalSessionNotesManager
export const showSessionNotes = () => globalSessionNotesManager.showNotes()
export const hideSessionNotes = () => globalSessionNotesManager.hideNotes()
export const clearSessionNotes = () => globalSessionNotesManager.clearNotes()
export const getSessionNotes = () => globalSessionNotesManager.getNotes()
export const setSessionNotes = (notes) =>
  globalSessionNotesManager.setNotes(notes)
export const onSessionStart = () => globalSessionNotesManager.onSessionStart()
export const onSessionEnd = () => globalSessionNotesManager.onSessionEnd()
