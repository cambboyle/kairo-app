// Modern feedback system for Kairo
// Replaces outdated toast notifications with subtle, contextual feedback

class FeedbackManager {
  constructor() {
    this.activeMessages = new Map()
    this.injectStyles()
  }

  // Show subtle inline feedback message
  showMessage(element, message, type = 'info', duration = 3000) {
    const id = this.generateId()

    // Remove any existing message for this element
    this.clearElementMessages(element)

    const messageEl = this.createMessage(message, type)
    messageEl.setAttribute('data-feedback-id', id)

    // Find a suitable place to insert the message
    const container = this.findMessageContainer(element)
    container.appendChild(messageEl)

    this.activeMessages.set(id, messageEl)

    // Animate in
    requestAnimationFrame(() => {
      messageEl.classList.add('feedback-show')
    })

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismissMessage(id)
      }, duration)
    }

    return id
  }

  // Show temporary status update
  showStatus(message, type = 'info') {
    // Use browser notification for important status updates
    if (type === 'success' || type === 'error') {
      // For major feedback, we'll use the notification system
      if ('Notification' in window && Notification.permission === 'granted') {
        const icon = type === 'success' ? '✅' : '❌'
        new Notification(`${icon} Kairo`, {
          body: message,
          silent: true,
          tag: 'kairo-status',
        })
      }
    }

    // For less critical feedback, create a subtle temporary message
    const statusEl = document.createElement('div')
    statusEl.className = `feedback-status feedback-${type}`
    statusEl.textContent = message
    statusEl.setAttribute('role', 'status')
    statusEl.setAttribute('aria-live', 'polite')

    document.body.appendChild(statusEl)

    // Animate in
    requestAnimationFrame(() => {
      statusEl.classList.add('feedback-show')
    })

    // Remove after 2 seconds
    setTimeout(() => {
      statusEl.classList.remove('feedback-show')
      setTimeout(() => {
        if (statusEl.parentNode) {
          statusEl.parentNode.removeChild(statusEl)
        }
      }, 300)
    }, 2000)
  }

  // Show confirmation popup
  showConfirmation(
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
  ) {
    return new Promise((resolve) => {
      const modal = document.createElement('div')
      modal.className = 'feedback-modal-overlay'
      modal.innerHTML = `
        <div class="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
          <div class="feedback-modal-header">
            <h3 id="feedback-modal-title">${title}</h3>
          </div>
          <div class="feedback-modal-body">
            <p>${message}</p>
          </div>
          <div class="feedback-modal-actions">
            <button class="feedback-btn feedback-btn-danger" id="feedback-confirm-btn">${confirmText}</button>
            <button class="feedback-btn feedback-btn-secondary" id="feedback-cancel-btn">${cancelText}</button>
          </div>
        </div>
      `

      document.body.appendChild(modal)

      // Focus the cancel button for accessibility
      setTimeout(() => {
        document.getElementById('feedback-cancel-btn').focus()
      }, 0)

      // Handle confirm
      document.getElementById('feedback-confirm-btn').onclick = () => {
        if (modal.parentNode) modal.parentNode.removeChild(modal)
        resolve(true)
      }

      // Handle cancel
      document.getElementById('feedback-cancel-btn').onclick = () => {
        if (modal.parentNode) modal.parentNode.removeChild(modal)
        resolve(false)
      }

      // ESC key closes modal (cancel)
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (modal.parentNode) modal.parentNode.removeChild(modal)
          resolve(false)
        }
      })

      // Click outside closes modal (cancel)
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          if (modal.parentNode) modal.parentNode.removeChild(modal)
          resolve(false)
        }
      })
    })
  }

  createMessage(message, type) {
    const messageEl = document.createElement('div')
    messageEl.className = `feedback-message feedback-${type}`
    messageEl.setAttribute('role', 'status')
    messageEl.setAttribute('aria-live', 'polite')

    const icon = this.getTypeIcon(type)
    messageEl.innerHTML = `
      <span class="feedback-icon" aria-hidden="true">${icon}</span>
      <span class="feedback-text">${message}</span>
    `

    return messageEl
  }

  findMessageContainer(element) {
    // Try to find a suitable container near the element
    let container = element.closest(
      '.timer-content, .history-section, .settings-modal',
    )

    if (!container) {
      // Create a temporary container
      container = document.createElement('div')
      container.className = 'feedback-container'
      element.parentNode.insertBefore(container, element.nextSibling)
    }

    return container
  }

  clearElementMessages(element) {
    const container = this.findMessageContainer(element)
    const existingMessages = container.querySelectorAll('.feedback-message')
    existingMessages.forEach((msg) => {
      const id = msg.getAttribute('data-feedback-id')
      if (id) {
        this.dismissMessage(id)
      }
    })
  }

  dismissMessage(id) {
    const messageEl = this.activeMessages.get(id)
    if (messageEl) {
      messageEl.classList.remove('feedback-show')
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl)
        }
        this.activeMessages.delete(id)
      }, 300)
    }
  }

  getTypeIcon(type) {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      timer: '⏱️',
      save: '💾',
    }
    return icons[type] || icons.info
  }

  generateId() {
    return `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  injectStyles() {
    if (document.getElementById('feedback-styles')) return

    const style = document.createElement('style')
    style.id = 'feedback-styles'
    style.textContent = `
      .feedback-message {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm) var(--spacing-md);
        margin: var(--spacing-sm) 0;
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: 500;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-left: 3px solid;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .feedback-message.feedback-show {
        opacity: 1;
        transform: translateY(0);
      }

      .feedback-message.feedback-info {
        border-left-color: var(--primary);
        color: var(--text-primary);
      }

      .feedback-message.feedback-success {
        border-left-color: #10b981;
        color: #10b981;
      }

      .feedback-message.feedback-error {
        border-left-color: #ef4444;
        color: #ef4444;
      }

      .feedback-message.feedback-warning {
        border-left-color: #f59e0b;
        color: #f59e0b;
      }

      .feedback-message.feedback-timer {
        border-left-color: var(--accent);
        color: var(--accent);
      }

      .feedback-message.feedback-save {
        border-left-color: #8b5cf6;
        color: #8b5cf6;
      }

      .feedback-icon {
        font-size: var(--text-sm);
        opacity: 0.8;
      }

      .feedback-text {
        flex: 1;
      }

      .feedback-status {
        position: fixed;
        bottom: var(--spacing-lg);
        right: var(--spacing-lg);
        padding: var(--spacing-md) var(--spacing-lg);
        border-radius: var(--radius-lg);
        font-size: var(--text-sm);
        font-weight: 600;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1000;
        max-width: 300px;
        box-shadow: var(--shadow-intense);
        backdrop-filter: blur(20px);
      }

      .feedback-status.feedback-show {
        opacity: 1;
        transform: translateX(0);
      }

      .feedback-status.feedback-info {
        background: rgba(79, 86, 79, 0.9);
        color: white;
      }

      .feedback-status.feedback-success {
        background: rgba(16, 185, 129, 0.9);
        color: white;
      }

      .feedback-status.feedback-error {
        background: rgba(239, 68, 68, 0.9);
        color: white;
      }

      .feedback-container {
        margin: var(--spacing-sm) 0;
      }

      /* Dark mode adjustments */
      [data-theme='dark'] .feedback-message {
        background: rgba(0, 0, 0, 0.3);
        border-color: rgba(255, 255, 255, 0.1);
      }

      /* Responsive design */
      @media (max-width: 640px) {
        .feedback-status {
          bottom: var(--spacing-md);
          right: var(--spacing-md);
          left: var(--spacing-md);
          max-width: none;
        }
      }

      /* Accessibility */
      @media (prefers-reduced-motion: reduce) {
        .feedback-message,
        .feedback-status {
          transition: opacity 0.2s ease;
          transform: none;
        }

        .feedback-message.feedback-show,
        .feedback-status.feedback-show {
          transform: none;
        }
      }

      /* Confirmation Modal Styles */
      .feedback-modal-overlay {
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
        z-index: 10000;
        animation: fadeIn 0.2s ease-out;
      }

      /* Dark mode gets a stronger overlay */
      [data-theme='dark'] .feedback-modal-overlay {
        background: rgba(0, 0, 0, 0.75);
      }

      .feedback-modal {
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 0;
        min-width: 320px;
        max-width: 90vw;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .feedback-modal-header {
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--border);
      }

      .feedback-modal-header h3 {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--text-primary);
      }

      .feedback-modal-body {
        padding: var(--spacing-lg);
      }

      .feedback-modal-body p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .feedback-modal-actions {
        padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg);
        display: flex;
        gap: var(--spacing-sm);
        justify-content: flex-end;
      }

      .feedback-btn {
        padding: var(--spacing-sm) var(--spacing-md);
        border: none;
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 80px;
      }

      .feedback-btn-danger {
        background: #ef4444;
        color: white;
      }

      .feedback-btn-danger:hover {
        background: #dc2626;
      }

      .feedback-btn-secondary {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border);
      }

      .feedback-btn-secondary:hover {
        background: var(--bg-tertiary);
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideIn {
        from { 
          opacity: 0; 
          transform: scale(0.95) translateY(-10px); 
        }
        to { 
          opacity: 1; 
          transform: scale(1) translateY(0); 
        }
      }
    `

    document.head.appendChild(style)
  }
}

// Create global instance
export const feedback = new FeedbackManager()

// Convenience methods that match the old toast API for easy migration
export const showMessage = (element, message, type, duration) =>
  feedback.showMessage(element, message, type, duration)

export const showStatus = (message, type) => feedback.showStatus(message, type)

export const showConfirmation = (title, message, confirmText, cancelText) =>
  feedback.showConfirmation(title, message, confirmText, cancelText)

// Legacy toast API compatibility (for gradual migration)
export const toast = {
  info: (message) => feedback.showStatus(message, 'info'),
  success: (message) => feedback.showStatus(message, 'success'),
  error: (message) => feedback.showStatus(message, 'error'),
  warning: (message) => feedback.showStatus(message, 'warning'),
  timer: (message) => feedback.showStatus(message, 'timer'),
  save: (message) => feedback.showStatus(message, 'success'),
  delete: (message) => feedback.showStatus(message, 'success'),
}
