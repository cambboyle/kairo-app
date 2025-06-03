// Toast Notification System for Kairo
// Provides beautiful, animated toast notifications with glassmorphism design

class ToastManager {
  constructor() {
    this.container = null
    this.toasts = new Map()
    this.init()
  }

  init() {
    // Create toast container if it doesn't exist
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div')
      this.container.id = 'toast-container'
      this.container.className = 'toast-container'
      document.body.appendChild(this.container)
      this.injectStyles()
    } else {
      this.container = document.getElementById('toast-container')
    }
  }

  // Create and show a toast notification
  show({
    message,
    type = 'info',
    duration = 4000,
    persistent = false,
    action = null,
  }) {
    const id = this.generateId()
    const toast = this.createToast({ id, message, type, action, persistent })

    this.container.appendChild(toast)
    this.toasts.set(id, toast)

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast-show')
    })

    // Auto-dismiss unless persistent
    if (!persistent && duration > 0) {
      setTimeout(() => {
        this.dismiss(id)
      }, duration)
    }

    return id
  }

  // Create toast element
  createToast({ id, message, type, action, persistent }) {
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.setAttribute('data-toast-id', id)

    const icon = this.getIcon(type)
    const closeBtn = persistent
      ? ''
      : `
      <button class="toast-close" onclick="toastManager.dismiss('${id}')" aria-label="Close notification">
        ✕
      </button>
    `

    const actionBtn = action
      ? `
      <button class="toast-action" onclick="${action.handler}">
        ${action.text}
      </button>
    `
      : ''

    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
        ${actionBtn}
      </div>
      ${closeBtn}
    `

    // Add click handler for close button
    const closeButton = toast.querySelector('.toast-close')
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation()
        this.dismiss(id)
      })
    }

    return toast
  }

  // Dismiss a specific toast
  dismiss(id) {
    const toast = this.toasts.get(id)
    if (!toast) return

    toast.classList.add('toast-hide')

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
      this.toasts.delete(id)
    }, 300)
  }

  // Dismiss all toasts
  dismissAll() {
    this.toasts.forEach((_, id) => this.dismiss(id))
  }

  // Get icon for toast type
  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      completion: '🎉',
      save: '💾',
      delete: '🗑️',
      timer: '⏰',
      focus: '🎯',
    }
    return icons[type] || 'ℹ️'
  }

  // Generate unique ID
  generateId() {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Inject CSS styles
  injectStyles() {
    if (document.getElementById('toast-styles')) return

    const style = document.createElement('style')
    style.id = 'toast-styles'
    style.textContent = `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 400px;
        pointer-events: none;
      }

      .toast {
        background: var(--surface-glass);
        backdrop-filter: var(--glass-backdrop);
        border: var(--glass-border);
        border-radius: var(--radius-md);
        padding: 16px;
        box-shadow: var(--shadow-intense);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        pointer-events: auto;
        position: relative;
        overflow: hidden;
        min-width: 300px;
        max-width: 400px;
      }

      .toast::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        opacity: 0.8;
      }

      .toast-success::before {
        background: linear-gradient(135deg, #00b894, #00cec9);
      }

      .toast-error::before {
        background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      }

      .toast-warning::before {
        background: linear-gradient(135deg, #fdcb6e, #f39c12);
      }

      .toast-info::before {
        background: var(--accent-gradient);
      }

      .toast-completion::before {
        background: var(--secondary-gradient);
      }

      .toast-save::before {
        background: var(--primary-gradient);
      }

      .toast-delete::before {
        background: linear-gradient(135deg, #ff7675, #d63031);
      }

      .toast-timer::before {
        background: var(--accent-gradient);
      }

      .toast-focus::before {
        background: var(--primary-gradient);
      }

      .toast-show {
        opacity: 1;
        transform: translateX(0);
      }

      .toast-hide {
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease-in;
      }

      .toast-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .toast-icon {
        font-size: 1.2rem;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .toast-message {
        flex: 1;
        color: var(--text-primary);
        font-size: 0.95rem;
        font-weight: 500;
        line-height: 1.4;
      }

      .toast-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        font-size: 14px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .toast-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      .toast-action {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: var(--text-primary);
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 600;
        margin-left: 8px;
        padding: 6px 12px;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .toast-action:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }

      /* Mobile responsive */
      @media (max-width: 480px) {
        .toast-container {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }

        .toast {
          min-width: unset;
          max-width: none;
        }
      }

      /* Keyboard focus styles */
      .toast-close:focus,
      .toast-action:focus {
        outline: 2px solid rgba(79, 172, 254, 0.8);
        outline-offset: 2px;
      }

      /* Animation for stacking */
      .toast:not(:last-child) {
        margin-bottom: 0;
      }
    `
    document.head.appendChild(style)
  }
}

// Create global toast manager instance
const toastManager = new ToastManager()

// Convenience functions for different toast types
export const toast = {
  success: (message, options = {}) =>
    toastManager.show({ message, type: 'success', ...options }),

  error: (message, options = {}) =>
    toastManager.show({ message, type: 'error', duration: 6000, ...options }),

  warning: (message, options = {}) =>
    toastManager.show({ message, type: 'warning', duration: 5000, ...options }),

  info: (message, options = {}) =>
    toastManager.show({ message, type: 'info', ...options }),

  completion: (message, options = {}) =>
    toastManager.show({
      message,
      type: 'completion',
      duration: 5000,
      ...options,
    }),

  save: (message, options = {}) =>
    toastManager.show({ message, type: 'save', ...options }),

  delete: (message, options = {}) =>
    toastManager.show({ message, type: 'delete', ...options }),

  timer: (message, options = {}) =>
    toastManager.show({ message, type: 'timer', ...options }),

  focus: (message, options = {}) =>
    toastManager.show({ message, type: 'focus', ...options }),

  // Custom toast with any type
  custom: (message, type, options = {}) =>
    toastManager.show({ message, type, ...options }),

  // Dismiss functions
  dismiss: (id) => toastManager.dismiss(id),
  dismissAll: () => toastManager.dismissAll(),
}

// Make toast manager available globally for close buttons
if (typeof window !== 'undefined') {
  window.toastManager = toastManager
}

export default toast
