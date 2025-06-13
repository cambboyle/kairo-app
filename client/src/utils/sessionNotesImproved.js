// Enhanced Session Notes Manager for Kairo
// Provides a sophisticated note-taking experience during focus sessions

class EnhancedSessionNotesManager {
  constructor() {
    this.notes = ''
    this.isVisible = false
    this.notesContainer = null
    this.initialized = false
    this.autoSaveTimeout = null
    this.isTyping = false
    this.expandedMode = false
    this.templates = [
      {
        name: 'Goals',
        icon: '🎯',
        content: '🎯 Session Goals:\n• \n\n📝 Key Tasks:\n• \n\n💡 Ideas:\n• ',
      },
      {
        name: 'Progress',
        icon: '✅',
        content:
          '✅ Completed:\n• \n\n🚧 In Progress:\n• \n\n🔄 Next Steps:\n• ',
      },
      {
        name: 'Learning',
        icon: '📚',
        content:
          '📚 What I Learned:\n• \n\n❓ Questions:\n• \n\n🔗 Resources:\n• ',
      },
      {
        name: 'Reflection',
        icon: '💭',
        content:
          '💭 Thoughts:\n\n🌟 Wins:\n\n🎯 Focus Areas:\n\n🔄 Improvements:',
      },
    ]
  }

  init() {
    if (this.initialized) return
    this.createNotesInterface()
    this.setupEventListeners()
    this.setupKeyboardShortcuts()
    this.initialized = true
  }

  ensureInitialized() {
    if (!this.initialized) {
      this.init()
    }
  }

  createNotesInterface() {
    // Create the enhanced notes container
    this.notesContainer = document.createElement('div')
    this.notesContainer.className = 'enhanced-session-notes-container'
    this.notesContainer.style.display = 'none'
    this.notesContainer.innerHTML = `
      <div class="notes-header">
        <div class="notes-title-area">
          <span class="notes-icon">📝</span>
          <span class="notes-title">Session Notes</span>
          <div class="notes-status">
            <span class="word-count">0 words</span>
            <span class="save-status" title="Auto-saved">✓</span>
          </div>
        </div>
        <div class="notes-controls">
          <button class="notes-template-btn" title="Insert template" type="button">
            <span class="template-icon">📋</span>
          </button>
          <button class="notes-expand-btn" title="Expand notes" type="button">
            <span class="expand-icon">⛶</span>
          </button>
          <button class="notes-toggle-btn" title="Hide notes" type="button">
            <span class="toggle-icon">−</span>
          </button>
        </div>
      </div>
      
      <div class="notes-templates-dropdown" style="display: none;">
        <div class="templates-header">Quick Templates</div>
        <div class="templates-list">
          ${this.templates
            .map(
              (template) => `
            <button class="template-option" data-template="${template.name}" type="button">
              <span class="template-emoji">${template.icon}</span>
              <span class="template-name">${template.name}</span>
            </button>
          `,
            )
            .join('')}
        </div>
      </div>

      <div class="notes-content">
        <div class="notes-editor">
          <textarea 
            class="session-notes-textarea" 
            placeholder="Start typing your thoughts, ideas, or observations...&#10;&#10;Tip: Use templates for structured notes"
            aria-label="Session notes"
            rows="4"
            spellcheck="true"
          ></textarea>
          <div class="notes-formatting-toolbar">
            <button class="format-btn" data-format="bullet" title="Add bullet point" type="button">•</button>
            <button class="format-btn" data-format="checkbox" title="Add checkbox" type="button">☐</button>
            <button class="format-btn" data-format="arrow" title="Add arrow" type="button">→</button>
            <button class="format-btn" data-format="star" title="Add star" type="button">★</button>
          </div>
        </div>
        
        <div class="notes-footer">
          <div class="notes-hints">
            <span class="hint-text">Auto-saves every 2 seconds</span>
            <span class="hint-shortcut">Press Ctrl+Enter to add bullet</span>
          </div>
          <div class="notes-actions">
            <button class="clear-notes-btn" title="Clear all notes" type="button">
              <span class="clear-icon">🗑️</span>
            </button>
          </div>
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
    const textarea = this.notesContainer.querySelector(
      '.session-notes-textarea',
    )
    const templateBtn = this.notesContainer.querySelector('.notes-template-btn')
    const expandBtn = this.notesContainer.querySelector('.notes-expand-btn')
    const toggleBtn = this.notesContainer.querySelector('.notes-toggle-btn')
    const clearBtn = this.notesContainer.querySelector('.clear-notes-btn')
    const templatesDropdown = this.notesContainer.querySelector(
      '.notes-templates-dropdown',
    )

    // Toggle visibility
    toggleBtn.addEventListener('click', () => {
      this.toggleVisibility()
    })

    // Expand/collapse
    expandBtn.addEventListener('click', () => {
      this.toggleExpandedMode()
    })

    // Templates dropdown
    templateBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      const isVisible = templatesDropdown.style.display !== 'none'
      templatesDropdown.style.display = isVisible ? 'none' : 'block'
    })

    // Template selection
    const templateOptions =
      this.notesContainer.querySelectorAll('.template-option')
    templateOptions.forEach((option) => {
      option.addEventListener('click', () => {
        const templateName = option.dataset.template
        this.insertTemplate(templateName)
        templatesDropdown.style.display = 'none'
      })
    })

    // Formatting toolbar
    const formatBtns = this.notesContainer.querySelectorAll('.format-btn')
    formatBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const format = btn.dataset.format
        this.insertFormatting(format)
      })
    })

    // Clear notes
    clearBtn.addEventListener('click', () => {
      this.clearNotesWithConfirmation()
    })

    // Auto-save notes with debouncing
    textarea.addEventListener('input', (e) => {
      this.notes = e.target.value
      this.isTyping = true
      this.updateStatus('typing')
      this.debouncedAutoSave()
      this.updateWordCount()
    })

    // Focus/blur events for better UX
    textarea.addEventListener('focus', () => {
      this.notesContainer.classList.add('notes-focused')
    })

    textarea.addEventListener('blur', () => {
      this.notesContainer.classList.remove('notes-focused')
      this.isTyping = false
      this.updateStatus('saved')
    })

    // Close templates dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.notesContainer.contains(e.target)) {
        templatesDropdown.style.display = 'none'
      }
    })
  }

  setupKeyboardShortcuts() {
    const textarea = this.notesContainer.querySelector(
      '.session-notes-textarea',
    )

    textarea.addEventListener('keydown', (e) => {
      // Ctrl+Enter for bullet points
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        this.insertAtCursor('• ')
      }

      // Ctrl+Shift+Enter for checkboxes
      if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        this.insertAtCursor('☐ ')
      }

      // Tab for indentation
      if (e.key === 'Tab') {
        e.preventDefault()
        this.insertAtCursor('  ')
      }
    })
  }

  insertAtCursor(text) {
    const textarea = this.notesContainer.querySelector(
      '.session-notes-textarea',
    )
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value

    textarea.value = value.substring(0, start) + text + value.substring(end)
    textarea.selectionStart = textarea.selectionEnd = start + text.length
    textarea.focus()

    // Trigger input event for auto-save
    textarea.dispatchEvent(new Event('input'))
  }

  insertFormatting(format) {
    const formatMap = {
      bullet: '• ',
      checkbox: '☐ ',
      arrow: '→ ',
      star: '★ ',
    }

    const text = formatMap[format] || ''
    if (text) {
      this.insertAtCursor(text)
    }
  }

  insertTemplate(templateName) {
    const template = this.templates.find((t) => t.name === templateName)
    if (!template) return

    const textarea = this.notesContainer.querySelector(
      '.session-notes-textarea',
    )
    const currentValue = textarea.value
    const newValue = currentValue
      ? currentValue + '\n\n' + template.content
      : template.content

    textarea.value = newValue
    textarea.focus()

    // Move cursor to first bullet point
    const firstBulletIndex = newValue.indexOf('• ') + 2
    if (firstBulletIndex > 1) {
      textarea.setSelectionRange(firstBulletIndex, firstBulletIndex)
    }

    // Trigger input event for auto-save
    textarea.dispatchEvent(new Event('input'))
  }

  toggleExpandedMode() {
    this.expandedMode = !this.expandedMode
    const expandBtn = this.notesContainer.querySelector('.notes-expand-btn')
    const expandIcon = expandBtn.querySelector('.expand-icon')

    if (this.expandedMode) {
      this.notesContainer.classList.add('notes-expanded')
      expandIcon.textContent = '⛷'
      expandBtn.title = 'Collapse notes'
    } else {
      this.notesContainer.classList.remove('notes-expanded')
      expandIcon.textContent = '⛶'
      expandBtn.title = 'Expand notes'
    }
  }

  updateWordCount() {
    const wordCountEl = this.notesContainer.querySelector('.word-count')
    const words = this.notes
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    const count = this.notes.trim() === '' ? 0 : words.length
    wordCountEl.textContent = `${count} word${count === 1 ? '' : 's'}`
  }

  updateStatus(status) {
    const statusEl = this.notesContainer.querySelector('.save-status')

    switch (status) {
      case 'typing':
        statusEl.textContent = '⋯'
        statusEl.title = 'Typing...'
        statusEl.className = 'save-status typing'
        break
      case 'saving':
        statusEl.textContent = '💾'
        statusEl.title = 'Saving...'
        statusEl.className = 'save-status saving'
        break
      case 'saved':
        statusEl.textContent = '✓'
        statusEl.title = 'Auto-saved'
        statusEl.className = 'save-status saved'
        break
      case 'error':
        statusEl.textContent = '⚠️'
        statusEl.title = 'Save failed'
        statusEl.className = 'save-status error'
        break
    }
  }

  debouncedAutoSave() {
    clearTimeout(this.autoSaveTimeout)
    this.autoSaveTimeout = setTimeout(() => {
      this.autosave()
    }, 2000)
  }

  autosave() {
    if (!this.isTyping) return

    this.updateStatus('saving')

    try {
      // Save to localStorage as backup
      localStorage.setItem('kairo-session-notes-temp', this.notes)

      setTimeout(() => {
        this.updateStatus('saved')
      }, 500)
    } catch (error) {
      console.error('Failed to auto-save notes:', error)
      this.updateStatus('error')
    }
  }

  clearNotesWithConfirmation() {
    if (!this.notes.trim()) return

    const confirmed = confirm(
      'Are you sure you want to clear all notes? This action cannot be undone.',
    )
    if (confirmed) {
      this.clearNotes()
    }
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
      const toggleBtn = this.notesContainer.querySelector('.notes-toggle-btn')
      const toggleIcon = toggleBtn.querySelector('.toggle-icon')
      toggleBtn.setAttribute('title', 'Hide notes')
      toggleIcon.textContent = '−'

      // Focus textarea for immediate typing
      setTimeout(() => {
        const textarea = this.notesContainer.querySelector(
          '.session-notes-textarea',
        )
        textarea.focus()
      }, 300)
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
      const toggleBtn = this.notesContainer.querySelector('.notes-toggle-btn')
      const toggleIcon = toggleBtn.querySelector('.toggle-icon')
      toggleBtn.setAttribute('title', 'Show notes')
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
    this.updateStatus('saved')
  }

  // Called when timer stops
  onSessionEnd() {
    this.hideNotes()
    // Keep expanded mode for potential review
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
    this.updateWordCount()
    this.updateStatus('saved')
  }

  setNotes(notes) {
    this.notes = notes || ''
    const textarea = this.notesContainer.querySelector(
      '.session-notes-textarea',
    )
    textarea.value = this.notes
    this.updateWordCount()
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
    this.expandedMode = false
    this.notesContainer.classList.remove('notes-expanded')
  }
}

// Create global instance
export const enhancedSessionNotesManager = new EnhancedSessionNotesManager()

// Convenience functions
export const showSessionNotes = () => enhancedSessionNotesManager.showNotes()
export const hideSessionNotes = () => enhancedSessionNotesManager.hideNotes()
export const getSessionNotes = () => enhancedSessionNotesManager.onSessionSave()
export const setSessionNotes = (notes) =>
  enhancedSessionNotesManager.setNotes(notes)
export const clearSessionNotes = () => enhancedSessionNotesManager.clearNotes()

// Session lifecycle hooks
export const onSessionStart = () => enhancedSessionNotesManager.onSessionStart()
export const onSessionEnd = () => enhancedSessionNotesManager.onSessionEnd()
export const onSessionSave = () => enhancedSessionNotesManager.onSessionSave()
