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
        content: '🎯 Session Goals:\n• \n\n📝 Key Tasks:\n• \n\n💡 Ideas:\n• ',
      },
      {
        name: 'Progress',
        content:
          '✅ Completed:\n• \n\n🚧 In Progress:\n• \n\n🔄 Next Steps:\n• ',
      },
      {
        name: 'Learning',
        content:
          '📚 What I Learned:\n• \n\n❓ Questions:\n• \n\n🔗 Resources:\n• ',
      },
      {
        name: 'Reflection',
        content:
          '💭 Thoughts:\n\n🌟 Wins:\n\n🎯 Focus Areas:\n\n🔄 Improvements:',
      },
    ]
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
          <button class="notes-toggle-btn" title="Minimize notes" type="button">
            <span class="toggle-icon">−</span>
          </button>
        </div>
      </div>
      
      <div class="notes-content">
        <div class="notes-toolbar">
          <div class="formatting-tools">
            <button class="format-btn" data-format="bold" title="Bold (Ctrl+B)">
              <strong>B</strong>
            </button>
            <button class="format-btn" data-format="italic" title="Italic (Ctrl+I)">
              <em>I</em>
            </button>
            <button class="format-btn" data-format="list" title="Bullet list">
              • List
            </button>
            <button class="format-btn" data-format="heading" title="Heading">
              H1
            </button>
          </div>
          <div class="quick-actions">
            <button class="quick-action-btn" data-action="timestamp" title="Insert timestamp">
              🕐
            </button>
            <button class="quick-action-btn" data-action="divider" title="Insert divider">
              ⎯
            </button>
            <button class="quick-action-btn" data-action="clear" title="Clear notes">
              🗑️
            </button>
          </div>
        </div>
        
        <div class="notes-input-container">
          <textarea 
            class="enhanced-notes-textarea" 
            placeholder="Start typing your thoughts, insights, or observations...

💡 Tips:
• Use Ctrl+B for **bold** text
• Use Ctrl+I for *italic* text  
• Try the template button for structured notes
• Your notes auto-save every few seconds"
            aria-label="Session notes"
            rows="6"
          ></textarea>
          <div class="notes-footer">
            <div class="typing-indicator" style="display: none;">
              <span class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
              <span class="typing-text">Typing...</span>
            </div>
            <div class="notes-shortcuts">
              <span class="shortcut-hint">💡 Press Tab for templates</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="template-dropdown" style="display: none;">
        <div class="template-header">
          <span class="template-title">Note Templates</span>
          <button class="template-close" title="Close templates">×</button>
        </div>
        <div class="template-list">
          ${this.templates
            .map(
              (template, index) => `
            <button class="template-item" data-template-index="${index}">
              <span class="template-name">${template.name}</span>
              <span class="template-preview">${template.content.substring(0, 50)}...</span>
            </button>
          `,
            )
            .join('')}
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
      '.enhanced-notes-textarea',
    )
    const toggleBtn = this.notesContainer.querySelector('.notes-toggle-btn')
    const expandBtn = this.notesContainer.querySelector('.notes-expand-btn')
    const templateBtn = this.notesContainer.querySelector('.notes-template-btn')
    const templateDropdown =
      this.notesContainer.querySelector('.template-dropdown')
    const templateClose = this.notesContainer.querySelector('.template-close')

    // Toggle visibility
    toggleBtn.addEventListener('click', () => {
      this.toggleVisibility()
    })

    // Expand/collapse notes
    expandBtn.addEventListener('click', () => {
      this.toggleExpandedMode()
    })

    // Template dropdown
    templateBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      this.toggleTemplateDropdown()
    })

    templateClose.addEventListener('click', () => {
      this.hideTemplateDropdown()
    })

    // Template selection
    this.notesContainer.querySelectorAll('.template-item').forEach((item) => {
      item.addEventListener('click', () => {
        const templateIndex = parseInt(item.getAttribute('data-template-index'))
        this.insertTemplate(templateIndex)
        this.hideTemplateDropdown()
      })
    })

    // Auto-save and typing detection
    textarea.addEventListener('input', (e) => {
      this.notes = e.target.value
      this.handleTyping()
      this.updateWordCount()
      this.scheduleAutoSave()
    })

    // Keyboard shortcuts
    textarea.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e)
    })

    // Formatting buttons
    this.notesContainer.querySelectorAll('.format-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const format = btn.getAttribute('data-format')
        this.applyFormatting(format)
      })
    })

    // Quick actions
    this.notesContainer.querySelectorAll('.quick-action-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action')
        this.performQuickAction(action)
      })
    })

    // Click outside to close template dropdown
    document.addEventListener('click', (e) => {
      if (!this.notesContainer.contains(e.target)) {
        this.hideTemplateDropdown()
      }
    })

    // Focus management
    textarea.addEventListener('focus', () => {
      this.notesContainer.classList.add('notes-focused')
    })

    textarea.addEventListener('blur', () => {
      this.notesContainer.classList.remove('notes-focused')
      this.stopTyping()
    })
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
  }

  showTypingIndicator() {
    const indicator = this.notesContainer.querySelector('.typing-indicator')
    indicator.style.display = 'flex'
  }

  hideTypingIndicator() {
    const indicator = this.notesContainer.querySelector('.typing-indicator')
    indicator.style.display = 'none'
  }

  scheduleAutoSave() {
    // Clear existing timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout)
    }

    // Show unsaved indicator
    this.updateSaveStatus('saving')

    // Schedule auto-save
    this.autoSaveTimeout = setTimeout(() => {
      this.autosave()
      this.updateSaveStatus('saved')
    }, 2000)
  }

  updateSaveStatus(status) {
    const saveStatus = this.notesContainer.querySelector('.save-status')
    if (status === 'saving') {
      saveStatus.textContent = '⋯'
      saveStatus.title = 'Saving...'
      saveStatus.style.opacity = '0.6'
    } else if (status === 'saved') {
      saveStatus.textContent = '✓'
      saveStatus.title = 'Auto-saved'
      saveStatus.style.opacity = '1'
    }
  }

  updateWordCount() {
    const wordCount = this.notesContainer.querySelector('.word-count')
    const words = this.notes
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
    wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`
  }

  toggleExpandedMode() {
    this.expandedMode = !this.expandedMode
    const expandBtn = this.notesContainer.querySelector('.notes-expand-btn')
    const expandIcon = expandBtn.querySelector('.expand-icon')

    if (this.expandedMode) {
      this.notesContainer.classList.add('notes-expanded')
      expandIcon.textContent = '⛶'
      expandBtn.title = 'Collapse notes'
    } else {
      this.notesContainer.classList.remove('notes-expanded')
      expandIcon.textContent = '⛶'
      expandBtn.title = 'Expand notes'
    }
  }

  toggleTemplateDropdown() {
    const dropdown = this.notesContainer.querySelector('.template-dropdown')
    const isVisible = dropdown.style.display !== 'none'

    if (isVisible) {
      this.hideTemplateDropdown()
    } else {
      this.showTemplateDropdown()
    }
  }

  showTemplateDropdown() {
    const dropdown = this.notesContainer.querySelector('.template-dropdown')
    dropdown.style.display = 'block'
    // Animate in
    requestAnimationFrame(() => {
      dropdown.classList.add('template-dropdown-show')
    })
  }

  hideTemplateDropdown() {
    const dropdown = this.notesContainer.querySelector('.template-dropdown')
    dropdown.classList.remove('template-dropdown-show')
    setTimeout(() => {
      dropdown.style.display = 'none'
    }, 200)
  }

  insertTemplate(templateIndex) {
    const template = this.templates[templateIndex]
    const textarea = this.notesContainer.querySelector(
      '.enhanced-notes-textarea',
    )
    const currentText = textarea.value
    const newText = currentText
      ? currentText + '\n\n' + template.content
      : template.content

    textarea.value = newText
    this.notes = newText
    this.updateWordCount()
    this.scheduleAutoSave()

    // Focus and position cursor at the end
    textarea.focus()
    textarea.setSelectionRange(newText.length, newText.length)
  }

  handleKeyboardShortcuts(e) {
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

    // Tab for template dropdown
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      this.showTemplateDropdown()
    }
  }

  applyFormatting(format) {
    const textarea = this.notesContainer.querySelector(
      '.enhanced-notes-textarea',
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
      case 'list':
        formattedText = selectedText
          ? selectedText
              .split('\n')
              .map((line) => (line.trim() ? `• ${line}` : line))
              .join('\n')
          : '• List item'
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

  performQuickAction(action) {
    const textarea = this.notesContainer.querySelector(
      '.enhanced-notes-textarea',
    )

    switch (action) {
      case 'timestamp':
        const timestamp = new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
        this.insertTextAtCursor(`[${timestamp}] `)
        break

      case 'divider':
        this.insertTextAtCursor('\n\n---\n\n')
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

  insertTextAtCursor(text) {
    const textarea = this.notesContainer.querySelector(
      '.enhanced-notes-textarea',
    )
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    const newValue =
      textarea.value.substring(0, start) + text + textarea.value.substring(end)
    textarea.value = newValue
    this.notes = newValue

    // Position cursor after inserted text
    const newCursorPos = start + text.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)

    this.updateWordCount()
    this.scheduleAutoSave()
    textarea.focus()
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
      toggleBtn.title = 'Minimize notes'
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
      }, 300)

      // Update toggle button
      const toggleBtn = this.notesContainer.querySelector('.notes-toggle-btn')
      const toggleIcon = toggleBtn.querySelector('.toggle-icon')
      toggleBtn.title = 'Show notes'
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

    // Focus on notes after a brief delay
    setTimeout(() => {
      const textarea = this.notesContainer.querySelector(
        '.enhanced-notes-textarea',
      )
      if (textarea) {
        textarea.focus()
      }
    }, 500)
  }

  // Called when timer stops
  onSessionEnd() {
    this.hideNotes()
    this.hideTemplateDropdown()
  }

  // Called when session is saved
  onSessionSave() {
    return this.notes.trim()
  }

  clearNotes() {
    this.notes = ''
    const textarea = this.notesContainer.querySelector(
      '.enhanced-notes-textarea',
    )
    if (textarea) {
      textarea.value = ''
      this.updateWordCount()
    }
  }

  setNotes(notes) {
    this.notes = notes || ''
    const textarea = this.notesContainer.querySelector(
      '.enhanced-notes-textarea',
    )
    if (textarea) {
      textarea.value = this.notes
      this.updateWordCount()
    }
  }

  autosave() {
    // Save to localStorage as backup
    localStorage.setItem('kairo-enhanced-session-notes-temp', this.notes)
  }

  restoreNotes() {
    // Restore from localStorage if available
    const saved = localStorage.getItem('kairo-enhanced-session-notes-temp')
    if (saved) {
      this.setNotes(saved)
    }
  }

  cleanup() {
    // Clean up temporary notes and timeouts
    localStorage.removeItem('kairo-enhanced-session-notes-temp')
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout)
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout)
    }
  }
}

// Create global instance
export const sessionNotesManager = new EnhancedSessionNotesManager()

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
