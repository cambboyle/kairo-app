// Zen Settings - Minimal & Intentional
// Embodying Kanso (簡素) - Simplicity and Ma (間) - Purposeful Space

class ZenSettings {
  constructor() {
    this.modal = null
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    this.createModal()
    this.setupEventListeners()
    this.initialized = true
  }

  createModal() {
    this.modal = document.createElement('div')
    this.modal.className = 'zen-settings-overlay'
    this.modal.style.display = 'none'
    this.modal.setAttribute('role', 'dialog')
    this.modal.setAttribute('aria-modal', 'true')
    this.modal.setAttribute('aria-labelledby', 'zen-settings-title')

    this.modal.innerHTML = `
      <div class="zen-settings-modal">
        <div class="zen-settings-header">
          <h2 id="zen-settings-title" class="zen-settings-title">
            <span class="zen-settings-symbol">◎</span>
            Preferences
          </h2>
          <button class="zen-settings-close" aria-label="Close preferences">
            <span class="close-symbol">×</span>
          </button>
        </div>
        
        <div class="zen-settings-content">
          
          <!-- Theme Toggle - Most Essential -->
          <div class="zen-setting-group">
            <div class="zen-setting-item">
              <div class="zen-setting-label">
                <span class="zen-setting-icon">🌙</span>
                <span class="zen-setting-text">Dark Theme</span>
              </div>
              <button class="zen-toggle" data-setting="theme" aria-label="Toggle dark theme">
                <span class="zen-toggle-track">
                  <span class="zen-toggle-thumb"></span>
                </span>
              </button>
            </div>
          </div>

          <!-- Notifications - Essential for Flow -->
          <div class="zen-setting-group">
            <div class="zen-setting-item">
              <div class="zen-setting-label">
                <span class="zen-setting-icon">🔔</span>
                <span class="zen-setting-text">Session Notifications</span>
              </div>
              <button class="zen-toggle" data-setting="notifications" aria-label="Toggle session notifications">
                <span class="zen-toggle-track">
                  <span class="zen-toggle-thumb"></span>
                </span>
              </button>
            </div>
          </div>

          <!-- Sound - Minimal Feedback -->
          <div class="zen-setting-group">
            <div class="zen-setting-item">
              <div class="zen-setting-label">
                <span class="zen-setting-icon">🔊</span>
                <span class="zen-setting-text">Gentle Sounds</span>
              </div>
              <button class="zen-toggle" data-setting="sounds" aria-label="Toggle gentle sound feedback">
                <span class="zen-toggle-track">
                  <span class="zen-toggle-thumb"></span>
                </span>
              </button>
            </div>
          </div>

        </div>

        <!-- Simple Actions - Separated by Ma -->
        <div class="zen-settings-actions">
          <button class="zen-action-button export" data-action="export">
            <span class="zen-action-icon">↗</span>
            Export Sessions
          </button>
          <button class="zen-action-button reset" data-action="reset">
            <span class="zen-action-icon">○</span>
            Clear All Data
          </button>
        </div>
      </div>
    `

    document.body.appendChild(this.modal)
  }

  setupEventListeners() {
    const closeBtn = this.modal.querySelector('.zen-settings-close')
    const toggles = this.modal.querySelectorAll('.zen-toggle')
    const actionButtons = this.modal.querySelectorAll('.zen-action-button')

    // Close modal
    closeBtn.addEventListener('click', () => this.hide())

    // Close on overlay click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide()
      }
    })

    // Keyboard navigation
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hide()
      }
    })

    // Toggle switches
    toggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const setting = toggle.dataset.setting
        this.handleToggle(setting, toggle)
      })
    })

    // Action buttons
    actionButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action
        this.handleAction(action)
      })
    })

    // Initialize toggle states
    this.updateToggleStates()
  }

  handleToggle(setting, toggleElement) {
    const isActive = toggleElement.classList.contains('zen-active')

    switch (setting) {
      case 'theme':
        if (window.toggleTheme) {
          window.toggleTheme()
        }
        break

      case 'notifications':
        const notificationsEnabled = !isActive
        localStorage.setItem('zen-notifications-enabled', notificationsEnabled)
        if (window.notifications) {
          window.notifications.setBrowserNotificationsEnabled(
            notificationsEnabled,
          )
        }
        break

      case 'sounds':
        const soundsEnabled = !isActive
        localStorage.setItem('zen-sounds-enabled', soundsEnabled)
        if (window.notifications) {
          window.notifications.setSoundEnabled(soundsEnabled)
        }
        break
    }

    // Update visual state
    toggleElement.classList.toggle('zen-active')

    // Gentle feedback
    toggleElement.classList.add('zen-toggle-feedback')
    setTimeout(() => {
      toggleElement.classList.remove('zen-toggle-feedback')
    }, 300)
  }

  handleAction(action) {
    switch (action) {
      case 'export':
        this.exportSessions()
        break

      case 'reset':
        this.confirmReset()
        break
    }
  }

  exportSessions() {
    try {
      const sessions = localStorage.getItem('sessions')
      if (!sessions) {
        this.showFeedback('No sessions to export', 'info')
        return
      }

      const data = JSON.parse(sessions)
      const csv = this.convertToCSV(data)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `kairo-sessions-${new Date().toISOString().split('T')[0]}.csv`
      a.click()

      URL.revokeObjectURL(url)
      this.showFeedback('Sessions exported', 'success')
    } catch (error) {
      this.showFeedback('Export failed', 'error')
    }
  }

  convertToCSV(sessions) {
    const headers = ['Date', 'Type', 'Duration (min)', 'Completed', 'Notes']
    const rows = sessions.map((session) => [
      new Date(session.date).toLocaleString(),
      session.type || 'Focus',
      Math.round(session.duration / 60),
      session.completed ? 'Yes' : 'No',
      (session.notes || '').replace(/"/g, '""'),
    ])

    return [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n')
  }

  confirmReset() {
    const confirmElement = document.createElement('div')
    confirmElement.className = 'zen-confirm-overlay'
    confirmElement.innerHTML = `
      <div class="zen-confirm-modal">
        <div class="zen-confirm-content">
          <div class="zen-confirm-icon">⚠</div>
          <h3>Clear all data?</h3>
          <p>This will permanently remove all your sessions, notes, and progress. This cannot be undone.</p>
        </div>
        <div class="zen-confirm-actions">
          <button class="zen-confirm-button cancel">Cancel</button>
          <button class="zen-confirm-button confirm">Clear Data</button>
        </div>
      </div>
    `

    document.body.appendChild(confirmElement)

    // Handle confirmation
    confirmElement.querySelector('.cancel').addEventListener('click', () => {
      confirmElement.remove()
    })

    confirmElement.querySelector('.confirm').addEventListener('click', () => {
      try {
        // Clear all Kairo data
        const keys = Object.keys(localStorage).filter(
          (key) =>
            key.startsWith('kairo') ||
            key.startsWith('sessions') ||
            key.startsWith('zen'),
        )
        keys.forEach((key) => localStorage.removeItem(key))

        this.showFeedback('All data cleared', 'info')
        confirmElement.remove()
        this.hide()

        // Refresh page to reset app state
        setTimeout(() => window.location.reload(), 1000)
      } catch (error) {
        this.showFeedback('Clear failed', 'error')
        confirmElement.remove()
      }
    })
  }

  updateToggleStates() {
    // Theme toggle
    const themeToggle = this.modal.querySelector('[data-setting="theme"]')
    if (document.body.getAttribute('data-theme') === 'dark') {
      themeToggle.classList.add('zen-active')
    }

    // Notifications toggle
    const notificationsToggle = this.modal.querySelector(
      '[data-setting="notifications"]',
    )
    const notificationsEnabled =
      localStorage.getItem('zen-notifications-enabled') !== 'false'
    if (notificationsEnabled) {
      notificationsToggle.classList.add('zen-active')
    }

    // Sounds toggle
    const soundsToggle = this.modal.querySelector('[data-setting="sounds"]')
    const soundsEnabled = localStorage.getItem('zen-sounds-enabled') !== 'false'
    if (soundsEnabled) {
      soundsToggle.classList.add('zen-active')
    }
  }

  showFeedback(message, type = 'info') {
    // Simple toast notification
    const toast = document.createElement('div')
    toast.className = `zen-toast zen-toast-${type}`
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => toast.classList.add('zen-toast-show'), 10)
    setTimeout(() => {
      toast.classList.remove('zen-toast-show')
      setTimeout(() => toast.remove(), 300)
    }, 2000)
  }

  show() {
    if (!this.modal) this.init()

    this.modal.style.display = 'flex'
    this.modal.classList.add('zen-emerge')
    this.updateToggleStates()

    // Focus close button for accessibility
    setTimeout(() => {
      this.modal.querySelector('.zen-settings-close').focus()
    }, 200)
  }

  hide() {
    if (!this.modal) return

    this.modal.classList.add('zen-fade-out')
    setTimeout(() => {
      this.modal.style.display = 'none'
      this.modal.classList.remove('zen-fade-out', 'zen-emerge')
    }, 300)
  }
}

// Export singleton instance
export const zenSettings = new ZenSettings()

// Create settings button in header
export function addZenSettingsButton() {
  const existing = document.getElementById('zen-settings-btn')
  if (existing) return

  const button = document.createElement('button')
  button.id = 'zen-settings-btn'
  button.className = 'zen-settings-button'
  button.setAttribute('aria-label', 'Open preferences')
  button.innerHTML = `
    <span class="zen-settings-icon">◎</span>
  `

  button.addEventListener('click', () => {
    zenSettings.show()
  })

  // Add to header
  const header = document.querySelector('.header')
  if (header) {
    header.appendChild(button)
  }
}

// CSS Styles for Zen Settings
export function injectZenSettingsStyles() {
  if (document.getElementById('zen-settings-styles')) return

  const style = document.createElement('style')
  style.id = 'zen-settings-styles'
  style.textContent = `
    /* Zen Settings Button - Minimal header integration */
    .zen-settings-button {
      background: transparent;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-normal);
      font-size: var(--text-lg);
    }

    .zen-settings-button:hover {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      transform: rotate(45deg);
    }

    .zen-settings-button:active {
      transform: rotate(45deg) scale(0.95);
    }

    /* Modal Overlay */
    .zen-settings-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--spacing-lg);
    }

    /* Modal Container */
    .zen-settings-modal {
      background: var(--surface);
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-large);
      width: 100%;
      max-width: 400px;
      max-height: 90vh;
      overflow: hidden;
    }

    /* Header */
    .zen-settings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-2xl) var(--spacing-2xl) var(--spacing-xl);
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-tertiary);
    }

    .zen-settings-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      font-family: var(--font-serif);
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .zen-settings-symbol {
      font-size: var(--text-lg);
      color: var(--text-muted);
    }

    .zen-settings-close {
      background: transparent;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-size: var(--text-xl);
    }

    .zen-settings-close:hover {
      background: var(--bg-primary);
      color: var(--text-secondary);
    }

    /* Content */
    .zen-settings-content {
      padding: var(--spacing-2xl);
    }

    .zen-setting-group {
      margin-bottom: var(--spacing-2xl);
    }

    .zen-setting-group:last-child {
      margin-bottom: 0;
    }

    .zen-setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg) 0;
      border-bottom: 1px solid var(--border-subtle);
    }

    .zen-setting-item:last-child {
      border-bottom: none;
    }

    .zen-setting-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .zen-setting-icon {
      font-size: var(--text-base);
      width: 24px;
      text-align: center;
      opacity: 0.7;
    }

    .zen-setting-text {
      font-size: var(--text-base);
      color: var(--text-primary);
      font-weight: 500;
    }

    /* Zen Toggle Switch */
    .zen-toggle {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 20px;
      transition: all var(--transition-normal);
    }

    .zen-toggle-track {
      display: block;
      width: 48px;
      height: 24px;
      background: var(--border-emphasis);
      border-radius: 12px;
      position: relative;
      transition: all var(--transition-normal);
    }

    .zen-toggle-thumb {
      display: block;
      width: 18px;
      height: 18px;
      background: var(--surface);
      border-radius: 50%;
      position: absolute;
      top: 3px;
      left: 3px;
      transition: all var(--transition-normal);
      box-shadow: var(--shadow-subtle);
    }

    .zen-toggle.zen-active .zen-toggle-track {
      background: var(--primary);
    }

    .zen-toggle.zen-active .zen-toggle-thumb {
      transform: translateX(24px);
    }

    .zen-toggle.zen-toggle-feedback {
      animation: zen-gentle-pulse 0.3s ease-out;
    }

    /* Actions Section */
    .zen-settings-actions {
      padding: var(--spacing-xl) var(--spacing-2xl) var(--spacing-2xl);
      border-top: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .zen-action-button {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      background: transparent;
      border: 1px solid var(--border-emphasis);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-normal);
      font-family: var(--font-primary);
      text-align: left;
    }

    .zen-action-button:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-emphasis);
    }

    .zen-action-button.reset {
      color: var(--error);
      border-color: rgba(239, 68, 68, 0.3);
    }

    .zen-action-button.reset:hover {
      background: rgba(239, 68, 68, 0.05);
      border-color: rgba(239, 68, 68, 0.5);
    }

    .zen-action-icon {
      font-size: var(--text-base);
      opacity: 0.7;
    }

    /* Confirmation Modal */
    .zen-confirm-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1100;
      padding: var(--spacing-lg);
    }

    .zen-confirm-modal {
      background: var(--surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-large);
      width: 100%;
      max-width: 350px;
      overflow: hidden;
    }

    .zen-confirm-content {
      padding: var(--spacing-2xl);
      text-align: center;
    }

    .zen-confirm-icon {
      font-size: 2.5rem;
      margin-bottom: var(--spacing-lg);
      opacity: 0.6;
    }

    .zen-confirm-content h3 {
      font-size: var(--text-lg);
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
      font-family: var(--font-serif);
    }

    .zen-confirm-content p {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: var(--leading-relaxed);
      margin: 0;
    }

    .zen-confirm-actions {
      display: flex;
      border-top: 1px solid var(--border-subtle);
    }

    .zen-confirm-button {
      flex: 1;
      padding: var(--spacing-lg);
      background: transparent;
      border: none;
      font-size: var(--text-base);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-family: var(--font-primary);
    }

    .zen-confirm-button.cancel {
      color: var(--text-secondary);
      border-right: 1px solid var(--border-subtle);
    }

    .zen-confirm-button.confirm {
      color: var(--error);
      font-weight: 500;
    }

    .zen-confirm-button:hover {
      background: var(--bg-tertiary);
    }

    /* Toast Notifications */
    .zen-toast {
      position: fixed;
      bottom: var(--spacing-xl);
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: var(--surface);
      color: var(--text-primary);
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-soft);
      border: 1px solid var(--border-subtle);
      font-size: var(--text-sm);
      z-index: 1200;
      opacity: 0;
      transition: all var(--transition-normal);
    }

    .zen-toast.zen-toast-show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    .zen-toast.zen-toast-error {
      border-color: rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.05);
    }

    .zen-toast.zen-toast-success {
      border-color: rgba(34, 197, 94, 0.3);
      background: rgba(34, 197, 94, 0.05);
    }

    /* Responsive Design */
    @media (max-width: 480px) {
      .zen-settings-modal {
        margin: var(--spacing-md);
        max-width: none;
      }

      .zen-settings-header,
      .zen-settings-content,
      .zen-settings-actions {
        padding: var(--spacing-lg);
      }

      .zen-setting-item {
        padding: var(--spacing-md) 0;
      }
    }

    /* Animation classes */
    .zen-settings-modal.zen-emerge {
      animation: zen-emerge 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .zen-settings-modal.zen-fade-out {
      animation: zen-fade-out 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
  `

  document.head.appendChild(style)
}
