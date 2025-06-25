// Zen Error Handling - Gentle & Natural Feedback
// Embodying Wabi-Sabi (beauty in imperfection) and Shizen (naturalness)

class ZenErrorHandler {
  constructor() {
    this.errorLog = []
    this.maxLogSize = 50
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    this.setupGlobalErrorHandling()
    this.injectStyles()
    this.initialized = true
  }

  setupGlobalErrorHandling() {
    // Gentle error logging
    window.addEventListener('error', (event) => {
      this.logError(
        'JavaScript Error',
        event.error?.message || event.message,
        event.error?.stack,
      )
      this.showGentleNotification(
        "Something unexpected happened, but we're handling it gracefully.",
        'info',
      )
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        'Promise Rejection',
        event.reason?.message || event.reason,
        event.reason?.stack,
      )
      this.showGentleNotification(
        'A background process encountered an issue, but your work continues.',
        'info',
      )
      event.preventDefault() // Prevent console spam
    })
  }

  logError(type, message, stack = null) {
    const error = {
      timestamp: new Date().toISOString(),
      type,
      message,
      stack,
      userAgent: navigator.userAgent,
    }

    this.errorLog.unshift(error)

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('kairo-error-log', JSON.stringify(this.errorLog))
    } catch (e) {
      // Storage full - clear old errors
      this.errorLog = this.errorLog.slice(0, 10)
      try {
        localStorage.setItem('kairo-error-log', JSON.stringify(this.errorLog))
      } catch (e2) {
        // Even basic storage failed - continue without logging
      }
    }
  }

  // Gentle user-facing error states
  showConnectionError(element, retryFn = null) {
    if (!element) return

    element.innerHTML = `
      <div class="zen-error-state zen-fade-in">
        <div class="zen-error-symbol">○</div>
        <h3>Connection Interrupted</h3>
        <p>Like ripples on water, this will pass. Your work is safe.</p>
        ${
          retryFn
            ? `
          <button class="zen-error-retry zen-ripple" onclick="(${retryFn.toString()})()">
            <span class="retry-symbol">↻</span>
            Try Again
          </button>
        `
            : ''
        }
      </div>
    `
  }

  showDataError(element, context = 'data') {
    if (!element) return

    element.innerHTML = `
      <div class="zen-error-state zen-fade-in">
        <div class="zen-error-symbol">◦</div>
        <h3>Something Isn't Quite Right</h3>
        <p>We couldn't load your ${context}, but this is just a temporary moment. Try refreshing the page.</p>
        <button class="zen-error-refresh zen-ripple" onclick="window.location.reload()">
          <span class="refresh-symbol">⟲</span>
          Refresh
        </button>
      </div>
    `
  }

  showEmptyState(element, message = 'Nothing here yet', action = null) {
    if (!element) return

    element.innerHTML = `
      <div class="zen-empty-state zen-fade-in">
        <div class="zen-empty-symbol">◯</div>
        <h3>Peaceful Emptiness</h3>
        <p>${message}</p>
        ${
          action
            ? `
          <button class="zen-empty-action zen-ripple" onclick="(${action.fn.toString()})()">
            <span class="action-symbol">${action.symbol || '+'}</span>
            ${action.text}
          </button>
        `
            : ''
        }
      </div>
    `
  }

  // Gentle notifications
  showGentleNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div')
    notification.className = `zen-notification zen-notification-${type}`

    const symbols = {
      info: '○',
      success: '●',
      warning: '◐',
      error: '◯',
    }

    notification.innerHTML = `
      <div class="zen-notification-content">
        <span class="zen-notification-symbol">${symbols[type] || symbols.info}</span>
        <span class="zen-notification-message">${message}</span>
      </div>
    `

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => notification.classList.add('zen-notification-show'), 10)

    // Auto-remove
    setTimeout(() => {
      notification.classList.remove('zen-notification-show')
      setTimeout(() => notification.remove(), 300)
    }, duration)

    return notification
  }

  // Form validation with zen approach
  validateForm(form, rules) {
    const errors = []
    const formData = new FormData(form)

    for (const [field, rule] of Object.entries(rules)) {
      const value = formData.get(field)
      const element = form.querySelector(`[name="${field}"]`)

      if (rule.required && (!value || value.trim() === '')) {
        errors.push({
          field,
          message: rule.requiredMessage || 'This field needs attention',
        })
        this.showFieldError(
          element,
          rule.requiredMessage || 'This field needs attention',
        )
      } else if (value && rule.validate && !rule.validate(value)) {
        errors.push({
          field,
          message: rule.message || 'Please check this field',
        })
        this.showFieldError(element, rule.message || 'Please check this field')
      } else {
        this.clearFieldError(element)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  showFieldError(element, message) {
    if (!element) return

    this.clearFieldError(element)

    element.classList.add('zen-field-error')

    const errorElement = document.createElement('div')
    errorElement.className = 'zen-field-error-message zen-fade-in'
    errorElement.textContent = message
    errorElement.setAttribute('role', 'alert')

    element.parentNode.insertBefore(errorElement, element.nextSibling)
  }

  clearFieldError(element) {
    if (!element) return

    element.classList.remove('zen-field-error')

    const errorElement = element.parentNode.querySelector(
      '.zen-field-error-message',
    )
    if (errorElement) {
      errorElement.remove()
    }
  }

  // Get error report for debugging
  getErrorReport() {
    return {
      timestamp: new Date().toISOString(),
      errors: this.errorLog,
      userAgent: navigator.userAgent,
      url: window.location.href,
      storage: {
        localStorage: this.getStorageSize('localStorage'),
        sessionStorage: this.getStorageSize('sessionStorage'),
      },
    }
  }

  getStorageSize(storageType) {
    try {
      const storage = window[storageType]
      let total = 0
      for (let key in storage) {
        if (storage.hasOwnProperty(key)) {
          total += key.length + storage[key].length
        }
      }
      return `${(total / 1024).toFixed(2)} KB`
    } catch (e) {
      return 'unavailable'
    }
  }

  injectStyles() {
    if (document.getElementById('zen-error-styles')) return

    const style = document.createElement('style')
    style.id = 'zen-error-styles'
    style.textContent = `
      /* Zen Error States - Gentle and Natural */
      .zen-error-state,
      .zen-empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: var(--spacing-4xl) var(--spacing-xl);
        color: var(--text-muted);
        min-height: 200px;
      }

      .zen-error-symbol,
      .zen-empty-symbol {
        width: 80px;
        height: 80px;
        border: 2px solid var(--border-emphasis);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-2xl);
        color: var(--text-muted);
        background: var(--surface);
        margin-bottom: var(--spacing-xl);
        position: relative;
      }

      .zen-error-symbol::before,
      .zen-empty-symbol::before {
        content: '';
        position: absolute;
        inset: -4px;
        border: 1px solid var(--border-subtle);
        border-radius: 50%;
        opacity: 0.3;
      }

      .zen-error-state h3,
      .zen-empty-state h3 {
        font-family: var(--font-serif);
        font-size: var(--text-lg);
        color: var(--text-secondary);
        margin: 0 0 var(--spacing-md) 0;
        font-weight: 600;
      }

      .zen-error-state p,
      .zen-empty-state p {
        font-size: var(--text-base);
        line-height: var(--leading-relaxed);
        color: var(--text-muted);
        margin: 0 0 var(--spacing-xl) 0;
        max-width: 300px;
      }

      .zen-error-retry,
      .zen-error-refresh,
      .zen-empty-action {
        background: transparent;
        border: 1px solid var(--border-emphasis);
        color: var(--text-secondary);
        padding: var(--spacing-md) var(--spacing-lg);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        cursor: pointer;
        transition: all var(--transition-normal);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-family: var(--font-primary);
      }

      .zen-error-retry:hover,
      .zen-error-refresh:hover,
      .zen-empty-action:hover {
        background: var(--bg-tertiary);
        border-color: var(--border-emphasis);
      }

      .retry-symbol,
      .refresh-symbol,
      .action-symbol {
        font-size: var(--text-base);
        opacity: 0.7;
      }

      /* Gentle Notifications */
      .zen-notification {
        position: fixed;
        top: var(--spacing-xl);
        right: var(--spacing-xl);
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-soft);
        z-index: 1100;
        opacity: 0;
        transform: translateX(100px);
        transition: all var(--transition-normal);
        max-width: 350px;
      }

      .zen-notification.zen-notification-show {
        opacity: 1;
        transform: translateX(0);
      }

      .zen-notification-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md) var(--spacing-lg);
      }

      .zen-notification-symbol {
        font-size: var(--text-base);
        color: var(--text-muted);
        flex-shrink: 0;
      }

      .zen-notification-message {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: var(--leading-relaxed);
      }

      .zen-notification-success .zen-notification-symbol {
        color: var(--primary);
      }

      .zen-notification-warning .zen-notification-symbol {
        color: var(--warning);
      }

      .zen-notification-error .zen-notification-symbol {
        color: var(--error);
      }

      /* Form Field Errors */
      .zen-field-error {
        border-color: var(--error) !important;
        box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.1) !important;
      }

      .zen-field-error-message {
        font-size: var(--text-xs);
        color: var(--error);
        margin-top: var(--spacing-xs);
        line-height: var(--leading-relaxed);
      }

      /* Responsive */
      @media (max-width: 640px) {
        .zen-notification {
          top: var(--spacing-lg);
          right: var(--spacing-lg);
          left: var(--spacing-lg);
          max-width: none;
        }

        .zen-error-state,
        .zen-empty-state {
          padding: var(--spacing-2xl) var(--spacing-lg);
        }

        .zen-error-symbol,
        .zen-empty-symbol {
          width: 60px;
          height: 60px;
          font-size: var(--text-xl);
        }
      }
    `

    document.head.appendChild(style)
  }
}

// Export singleton instance
export const zenErrorHandler = new ZenErrorHandler()

// Initialize on import
zenErrorHandler.init()
