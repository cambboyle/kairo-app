// Zen Session Notes - Simplified & Mindful
// Embodying Kanso (簡素) - Simplicity and Ma (間) - Negative Space

class ZenSessionNotes {
  constructor() {
    this.notes = ''
    this.isVisible = false
    this.container = null
    this.autoSaveTimeout = null
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    this.createInterface()
    this.setupEventListeners()
    this.initialized = true
  }

  createInterface() {
    this.container = document.createElement('div')
    this.container.className = 'zen-notes-container'
    this.container.style.display = 'none'
    this.container.innerHTML = `
      <div class="zen-notes-header">
        <div class="zen-notes-title">
          <span class="zen-notes-symbol">◦</span>
          <span>Session Reflection</span>
        </div>
        <button class="zen-notes-toggle" type="button" aria-label="Hide notes">
          <span class="toggle-symbol">−</span>
        </button>
      </div>
      
      <div class="zen-notes-content">
        <textarea 
          class="zen-notes-textarea"
          placeholder="What comes to mind?
          
Record thoughts, insights, or observations as they arise..."
          aria-label="Session notes and reflections"
          spellcheck="true"
        ></textarea>
        
        <div class="zen-notes-footer">
          <div class="zen-notes-status">
            <span class="character-count">0</span>
            <span class="save-indicator" title="Notes saved">○</span>
          </div>
        </div>
      </div>
    `

    // Insert after timer or in a designated area
    const timerContainer = document.querySelector('.timer-container')
    if (timerContainer) {
      timerContainer.parentNode.insertBefore(
        this.container,
        timerContainer.nextSibling,
      )
    } else {
      document.querySelector('.main-content').appendChild(this.container)
    }
  }

  setupEventListeners() {
    const textarea = this.container.querySelector('.zen-notes-textarea')
    const toggleBtn = this.container.querySelector('.zen-notes-toggle')
    const characterCount = this.container.querySelector('.character-count')
    const saveIndicator = this.container.querySelector('.save-indicator')

    // Toggle visibility
    toggleBtn.addEventListener('click', () => {
      if (this.isVisible) {
        this.hide()
      } else {
        this.show()
      }
    })

    // Auto-resize textarea
    textarea.addEventListener('input', () => {
      this.notes = textarea.value

      // Update character count
      characterCount.textContent = textarea.value.length

      // Auto-resize
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px'

      // Auto-save with gentle feedback
      this.scheduleAutoSave()
      this.showSaveIndicator(saveIndicator)
    })

    // Zen focus - minimal distraction
    textarea.addEventListener('focus', () => {
      this.container.classList.add('zen-focused')
    })

    textarea.addEventListener('blur', () => {
      this.container.classList.remove('zen-focused')
    })

    // Keyboard shortcuts for mindful interaction
    textarea.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + Enter to save and close
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        this.save()
        this.hide()
      }

      // Escape to close without saving
      if (e.key === 'Escape') {
        e.preventDefault()
        this.hide()
      }
    })
  }

  show() {
    if (!this.container) return

    this.isVisible = true
    this.container.style.display = 'block'
    this.container.classList.add('zen-emerge')

    const toggleBtn = this.container.querySelector(
      '.zen-notes-toggle .toggle-symbol',
    )
    toggleBtn.textContent = '−'

    // Focus textarea for immediate writing
    setTimeout(() => {
      const textarea = this.container.querySelector('.zen-notes-textarea')
      textarea.focus()
    }, 200)
  }

  hide() {
    if (!this.container) return

    this.isVisible = false
    this.container.classList.add('zen-fade-out')

    const toggleBtn = this.container.querySelector(
      '.zen-notes-toggle .toggle-symbol',
    )
    toggleBtn.textContent = '+'

    setTimeout(() => {
      this.container.style.display = 'none'
      this.container.classList.remove('zen-fade-out')
    }, 300)
  }

  scheduleAutoSave() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout)
    }

    this.autoSaveTimeout = setTimeout(() => {
      this.save()
    }, 2000) // Save after 2 seconds of inactivity
  }

  save() {
    try {
      localStorage.setItem('kairo-session-notes', this.notes)
      return true
    } catch (error) {
      console.warn('Could not save notes:', error)
      return false
    }
  }

  load() {
    try {
      const saved = localStorage.getItem('kairo-session-notes')
      if (saved) {
        this.notes = saved
        const textarea = this.container?.querySelector('.zen-notes-textarea')
        if (textarea) {
          textarea.value = saved
          // Trigger input event to update count and resize
          textarea.dispatchEvent(new Event('input'))
        }
      }
    } catch (error) {
      console.warn('Could not load notes:', error)
    }
  }

  showSaveIndicator(indicator) {
    if (!indicator) return

    indicator.textContent = '●'
    indicator.classList.add('zen-pulse')

    setTimeout(() => {
      indicator.textContent = '○'
      indicator.classList.remove('zen-pulse')
    }, 1500)
  }

  // Session lifecycle methods
  onSessionStart() {
    this.ensureInitialized()
    this.load()
    // Gently suggest note-taking after a moment
    setTimeout(() => {
      if (!this.isVisible && this.container) {
        this.container.classList.add('zen-gentle-pulse')
        setTimeout(() => {
          this.container.classList.remove('zen-gentle-pulse')
        }, 3000)
      }
    }, 30000) // After 30 seconds
  }

  onSessionEnd() {
    this.save()
    // Clear notes for next session
    setTimeout(() => {
      this.notes = ''
      const textarea = this.container?.querySelector('.zen-notes-textarea')
      if (textarea) {
        textarea.value = ''
        textarea.dispatchEvent(new Event('input'))
      }
    }, 5000) // Clear after 5 seconds
  }

  ensureInitialized() {
    if (!this.initialized) {
      this.init()
    }
  }

  // Get notes for session saving
  getNotes() {
    return this.notes.trim()
  }

  // Public API for integration
  toggle() {
    this.ensureInitialized()
    if (this.isVisible) {
      this.hide()
    } else {
      this.show()
    }
  }
}

// Export singleton instance
export const zenSessionNotes = new ZenSessionNotes()

// CSS Styles for Zen Notes
export function injectZenNotesStyles() {
  if (document.getElementById('zen-notes-styles')) return

  const style = document.createElement('style')
  style.id = 'zen-notes-styles'
  style.textContent = `
    /* Zen Session Notes - Minimal & Contemplative */
    .zen-notes-container {
      position: fixed;
      bottom: var(--spacing-xl);
      right: var(--spacing-xl);
      width: 320px;
      background: var(--surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-soft);
      z-index: 100;
      opacity: 0.95;
      backdrop-filter: blur(8px);
      transition: all var(--transition-normal);
    }

    .zen-notes-container.zen-focused {
      opacity: 1;
      box-shadow: var(--shadow-medium);
      border-color: var(--border-emphasis);
    }

    /* Header - Clean and minimal */
    .zen-notes-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-tertiary);
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    }

    .zen-notes-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-sm);
      color: var(--text-secondary);
      font-weight: 500;
      font-family: var(--font-primary);
    }

    .zen-notes-symbol {
      color: var(--text-muted);
      font-size: var(--text-base);
    }

    .zen-notes-toggle {
      background: transparent;
      border: none;
      width: 24px;
      height: 24px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .zen-notes-toggle:hover {
      background: var(--bg-primary);
      color: var(--text-secondary);
    }

    .toggle-symbol {
      font-size: var(--text-lg);
      line-height: 1;
    }

    /* Content area */
    .zen-notes-content {
      padding: var(--spacing-lg);
    }

    .zen-notes-textarea {
      width: 100%;
      min-height: 80px;
      max-height: 300px;
      border: none;
      outline: none;
      resize: none;
      font-family: var(--font-primary);
      font-size: var(--text-sm);
      line-height: var(--leading-relaxed);
      color: var(--text-primary);
      background: transparent;
      padding: 0;
      margin-bottom: var(--spacing-md);
    }

    .zen-notes-textarea::placeholder {
      color: var(--text-muted);
      opacity: 0.7;
      font-style: italic;
    }

    .zen-notes-textarea:focus {
      outline: none;
    }

    /* Footer */
    .zen-notes-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--spacing-sm);
      border-top: 1px solid var(--border-subtle);
    }

    .zen-notes-status {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    .character-count {
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
    }

    .save-indicator {
      font-size: var(--text-sm);
      color: var(--text-muted);
      transition: all var(--transition-fast);
    }

    .save-indicator.zen-pulse {
      animation: zen-gentle-pulse 1s ease-in-out;
      color: var(--primary);
    }

    /* Responsive behavior */
    @media (max-width: 768px) {
      .zen-notes-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        width: auto;
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        box-shadow: var(--shadow-large);
      }

      .zen-notes-textarea {
        min-height: 60px;
      }
    }

    /* Dark mode adjustments */
    [data-theme='dark'] .zen-notes-container {
      background: var(--surface);
      border-color: var(--border-subtle);
    }

    [data-theme='dark'] .zen-notes-header {
      background: var(--bg-secondary);
    }

    /* Gentle hint animation */
    .zen-notes-container.zen-gentle-pulse {
      animation: zen-gentle-pulse 2s ease-in-out 3;
    }
  `

  document.head.appendChild(style)
}
