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
            placeholder="Start typing your thoughts, insights, or observations...&#10;&#10;💡 Tips:&#10;• Use Ctrl+B for **bold** text&#10;• Use Ctrl+I for *italic* text&#10;• Try templates for structured notes&#10;• Press Tab to access templates"
            aria-label="Session notes"
            rows="4"
            spellcheck="true"
          ></textarea>
          <div class="notes-formatting-toolbar">
            <div class="formatting-tools">
              <button class="format-btn" data-format="bold" title="Bold (Ctrl+B)" type="button">
                <strong>B</strong>
              </button>
              <button class="format-btn" data-format="italic" title="Italic (Ctrl+I)" type="button">
                <em>I</em>
              </button>
              <button class="format-btn" data-format="bullet" title="Add bullet point" type="button">•</button>
              <button class="format-btn" data-format="checkbox" title="Add checkbox" type="button">☐</button>
              <button class="format-btn" data-format="heading" title="Heading" type="button">H1</button>
            </div>
            <div class="quick-actions">
              <button class="quick-action-btn" data-action="timestamp" title="Insert timestamp" type="button">
                🕐
              </button>
              <button class="quick-action-btn" data-action="divider" title="Insert divider" type="button">
                ⎯
              </button>
              <button class="format-btn" data-format="arrow" title="Add arrow" type="button">→</button>
              <button class="format-btn" data-format="star" title="Add star" type="button">★</button>
            </div>
          </div>
        </div>
        
        <div class="notes-footer">
          <div class="typing-indicator" style="display: none;">
            <span class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
            <span class="typing-text">Typing...</span>
          </div>
          <div class="notes-hints">
            <span class="hint-text">Auto-saves every 2 seconds</span>
            <span class="hint-shortcut">Press Ctrl+B for bold, Tab for templates</span>
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
        this.applyFormatting(format)
      })
    })

    // Quick actions
    const quickActionBtns =
      this.notesContainer.querySelectorAll('.quick-action-btn')
    quickActionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action
        this.performQuickAction(action)
      })
    })

    // Clear notes
    clearBtn.addEventListener('click', () => {
      this.clearNotesWithConfirmation()
    })

    // Auto-save notes with debouncing and typing indicator
    textarea.addEventListener('input', (e) => {
      this.notes = e.target.value
      this.handleTyping()
      this.updateWordCount()
      this.scheduleAutoSave()
    })

    // Focus/blur events for better UX
    textarea.addEventListener('focus', () => {
      this.notesContainer.classList.add('notes-focused')
    })

    textarea.addEventListener('blur', () => {
      this.notesContainer.classList.remove('notes-focused')
      this.stopTyping()
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
      // Ctrl/Cmd + B for bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        this.applyFormatting('bold')
      }

      // Ctrl/Cmd + I for italic
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault()
        this.applyFormatting('italic')
      }

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

      // Tab for templates or indentation
      if (e.key === 'Tab') {
        e.preventDefault()
        const templatesDropdown = this.notesContainer.querySelector(
          '.notes-templates-dropdown',
        )
        const isTemplatesVisible = templatesDropdown.style.display !== 'none'

        if (isTemplatesVisible) {
          // If templates are visible, close them and insert indentation
          templatesDropdown.style.display = 'none'
          this.insertAtCursor('  ')
        } else {
          // Show templates
          templatesDropdown.style.display = 'block'
        }
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

  applyFormatting(format) {
    const textarea = this.notesContainer.querySelector(
      '.session-notes-textarea',
    )
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    let formattedText = ''

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`
        break
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`
        break
      case 'bullet':
        formattedText = selectedText
          ? selectedText
              .split('\n')
              .map((line) => (line.trim() ? `• ${line}` : line))
              .join('\n')
          : '• '
        break
      case 'checkbox':
        formattedText = '☐ '
        break
      case 'arrow':
        formattedText = '→ '
        break
      case 'star':
        formattedText = '★ '
        break
      case 'heading':
        formattedText = `# ${selectedText || 'Heading'}`
        break
    }

    // Replace selected text with formatted text
    const newValue =
      textarea.value.substring(0, start) +
      formattedText +
      textarea.value.substring(end)
    textarea.value = newValue
    this.notes = newValue

    // Update cursor position
    const newCursorPos = start + formattedText.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)

    this.updateWordCount()
    this.scheduleAutoSave()
    textarea.focus()
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

  autosave() {
    try {
      // Save to localStorage as backup
      localStorage.setItem('kairo-session-notes-temp', this.notes)
    } catch (error) {
      console.error('Failed to auto-save notes:', error)
      this.updateSaveStatus('error')
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
    if (this.notesTextarea) {
      this.notesTextarea.value = ''
      this.notesTextarea.focus()
      this.updateSaveStatus('cleared')
    }
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

  performQuickAction(action) {
    const textarea = this.notesContainer.querySelector(
      '.session-notes-textarea',
    )

    switch (action) {
      case 'timestamp':
        const timestamp = new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
        this.insertAtCursor(`[${timestamp}] `)
        break

      case 'divider':
        this.insertAtCursor('\n\n---\n\n')
        break

      case 'clear':
        if (confirm('Clear all notes? This cannot be undone.')) {
          textarea.value = ''
          this.notes = ''
          this.updateWordCount()
          this.scheduleAutoSave()
        }
        break
    }
  }

  handleTyping() {
    if (!this.isTyping) {
      this.isTyping = true
      this.showTypingIndicator()
    }

    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout)
    }

    // Set new timeout to hide typing indicator
    this.typingTimeout = setTimeout(() => {
      this.stopTyping()
    }, 1000)
  }

  stopTyping() {
    this.isTyping = false
    this.hideTypingIndicator()
    this.updateSaveStatus('saved')
  }

  showTypingIndicator() {
    const indicator = this.notesContainer.querySelector('.typing-indicator')
    if (indicator) {
      indicator.style.display = 'flex'
    }
  }

  hideTypingIndicator() {
    const indicator = this.notesContainer.querySelector('.typing-indicator')
    if (indicator) {
      indicator.style.display = 'none'
    }
  }

  scheduleAutoSave() {
    // Clear existing timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout)
    }

    // Show saving indicator
    this.updateSaveStatus('saving')

    // Schedule auto-save
    this.autoSaveTimeout = setTimeout(() => {
      this.autosave()
      this.updateSaveStatus('saved')
    }, 2000)
  }

  updateSaveStatus(status) {
    if (this.statusElement) {
      switch (status) {
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
