// Keyboard shortcuts manager for Kairo
// Provides intuitive keyboard navigation for power users

class KeyboardManager {
  constructor() {
    this.shortcuts = new Map()
    this.isEnabled = true
    this.currentContext = 'global'
    this.init()
  }

  init() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    this.registerGlobalShortcuts()
    this.showShortcutsOnFirstVisit()
  }

  registerGlobalShortcuts() {
    // Timer controls
    this.register('Space', {
      action: () => this.triggerTimerAction(),
      description: 'Start/Pause timer',
      context: 'global',
    })

    this.register('Escape', {
      action: () => this.stopTimer(),
      description: 'Stop current session',
      context: 'global',
    })

    // Settings and help
    this.register('cmd+,', {
      action: () => this.openSettings(),
      description: 'Open settings',
      context: 'global',
    })

    this.register('ctrl+,', {
      action: () => this.openSettings(),
      description: 'Open settings',
      context: 'global',
    })

    this.register('?', {
      action: () => this.showShortcutsHelp(),
      description: 'Show keyboard shortcuts',
      context: 'global',
    })

    // Quick session start
    this.register('1', {
      action: () => this.quickStartSession('Focus'),
      description: 'Quick start Focus session',
      context: 'global',
    })

    this.register('2', {
      action: () => this.quickStartSession('Deep Work'),
      description: 'Quick start Deep Work session',
      context: 'global',
    })

    this.register('3', {
      action: () => this.quickStartSession('Break'),
      description: 'Quick start Break session',
      context: 'global',
    })
  }

  registerModalShortcuts() {
    // Reflection modal shortcuts
    this.register('Enter', {
      action: () => this.saveReflection(),
      description: 'Save reflection',
      context: 'modal',
    })

    // Mood selection (1-6)
    for (let i = 1; i <= 6; i++) {
      this.register(i.toString(), {
        action: () => this.selectMood(i - 1),
        description: `Select mood ${i}`,
        context: 'modal',
      })
    }
  }

  register(key, config) {
    this.shortcuts.set(key.toLowerCase(), config)
  }

  handleKeyDown(event) {
    if (!this.isEnabled) return

    // Don't interfere with form inputs
    if (this.isInputFocused(event.target)) return

    const key = this.getKeyString(event)
    const shortcut = this.shortcuts.get(key)

    if (shortcut && this.isValidContext(shortcut.context)) {
      event.preventDefault()
      shortcut.action()
      this.showShortcutFeedback(shortcut.description)
    }
  }

  getKeyString(event) {
    let key = event.key.toLowerCase()

    if (event.metaKey || event.ctrlKey) {
      const modifier = event.metaKey ? 'cmd' : 'ctrl'
      key = `${modifier}+${key}`
    }

    if (event.shiftKey && !event.metaKey && !event.ctrlKey) {
      key = `shift+${key}`
    }

    return key
  }

  isInputFocused(element) {
    return (
      element.tagName === 'INPUT' ||
      element.tagName === 'TEXTAREA' ||
      element.contentEditable === 'true'
    )
  }

  isValidContext(context) {
    if (context === 'global') return true
    if (context === 'modal' && this.isModalOpen()) return true
    return false
  }

  isModalOpen() {
    return (
      document.querySelector(
        '.reflection-modal, .settings-modal, .feedback-modal-overlay',
      ) !== null
    )
  }

  // Action handlers
  triggerTimerAction() {
    // Look for start/pause button
    const startBtn = document.querySelector('.control-btn')
    const pauseBtn = document.querySelector('.control-btn.pause')

    if (startBtn && startBtn.textContent.includes('Start')) {
      startBtn.click()
    } else if (
      pauseBtn ||
      (startBtn && startBtn.textContent.includes('Pause'))
    ) {
      const btnToClick = pauseBtn || startBtn
      btnToClick.click()
    }
  }

  stopTimer() {
    const stopBtn = document.querySelector(
      '.control-btn.stop, .control-btn[onclick*="stop"]',
    )
    if (stopBtn) {
      stopBtn.click()
    }
  }

  openSettings() {
    const settingsBtn = document.querySelector(
      '.settings-btn, [aria-label*="Settings"]',
    )
    if (settingsBtn) {
      settingsBtn.click()
    }
  }

  quickStartSession(sessionType) {
    // Set session type if dropdown exists
    const typeSelect = document.querySelector(
      '#session-type, select[name="sessionType"]',
    )
    if (typeSelect) {
      // Find option by text content
      const options = typeSelect.querySelectorAll('option')
      for (const option of options) {
        if (option.textContent.includes(sessionType)) {
          typeSelect.value = option.value
          typeSelect.dispatchEvent(new Event('change', { bubbles: true }))
          break
        }
      }
    }

    // Start timer after a brief delay to ensure type is set
    setTimeout(() => {
      this.triggerTimerAction()
    }, 100)
  }

  saveReflection() {
    const saveBtn = document.querySelector(
      '.reflection-modal .btn-primary, .reflection-save-btn',
    )
    if (saveBtn) {
      saveBtn.click()
    }
  }

  selectMood(index) {
    const moodButtons = document.querySelectorAll('.mood-option')
    if (moodButtons[index]) {
      moodButtons[index].click()
    }
  }

  showShortcutFeedback(description) {
    // Create subtle feedback for shortcut usage
    const feedback = document.createElement('div')
    feedback.className = 'shortcut-feedback'
    feedback.textContent = description
    feedback.setAttribute('aria-live', 'polite')

    document.body.appendChild(feedback)

    // Animate in
    requestAnimationFrame(() => {
      feedback.classList.add('show')
    })

    // Remove after 2 seconds
    setTimeout(() => {
      feedback.classList.remove('show')
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback)
        }
      }, 300)
    }, 2000)
  }

  showShortcutsHelp() {
    const modal = document.createElement('div')
    modal.className = 'shortcuts-modal-overlay'
    modal.innerHTML = `
      <div class="shortcuts-modal" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
        <div class="shortcuts-header">
          <h3 id="shortcuts-title">⌨️ Keyboard Shortcuts</h3>
          <button class="shortcuts-close" aria-label="Close shortcuts help">&times;</button>
        </div>
        <div class="shortcuts-content">
          <div class="shortcuts-section">
            <h4>Timer Controls</h4>
            <div class="shortcut-item">
              <kbd>Space</kbd>
              <span>Start/Pause timer</span>
            </div>
            <div class="shortcut-item">
              <kbd>Esc</kbd>
              <span>Stop current session</span>
            </div>
          </div>
          
          <div class="shortcuts-section">
            <h4>Quick Start</h4>
            <div class="shortcut-item">
              <kbd>1</kbd>
              <span>Start Focus session</span>
            </div>
            <div class="shortcut-item">
              <kbd>2</kbd>
              <span>Start Deep Work session</span>
            </div>
            <div class="shortcut-item">
              <kbd>3</kbd>
              <span>Start Break session</span>
            </div>
          </div>
          
          <div class="shortcuts-section">
            <h4>Navigation</h4>
            <div class="shortcut-item">
              <kbd>${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}</kbd><kbd>,</kbd>
              <span>Open settings</span>
            </div>
            <div class="shortcut-item">
              <kbd>?</kbd>
              <span>Show this help</span>
            </div>
          </div>
          
          <div class="shortcuts-section">
            <h4>During Reflection</h4>
            <div class="shortcut-item">
              <kbd>Enter</kbd>
              <span>Save reflection</span>
            </div>
            <div class="shortcut-item">
              <kbd>1</kbd><kbd>-</kbd><kbd>6</kbd>
              <span>Select mood quickly</span>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Focus the close button
    setTimeout(() => {
      modal.querySelector('.shortcuts-close').focus()
    }, 0)

    // Close handlers
    modal.querySelector('.shortcuts-close').onclick = () => {
      this.closeShortcutsHelp(modal)
    }

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeShortcutsHelp(modal)
      }
    })

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeShortcutsHelp(modal)
      }
    })
  }

  closeShortcutsHelp(modal) {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal)
    }
  }

  showShortcutsOnFirstVisit() {
    const hasSeenShortcuts = localStorage.getItem('kairo-shortcuts-seen')
    if (!hasSeenShortcuts) {
      setTimeout(() => {
        this.showShortcutTip()
        localStorage.setItem('kairo-shortcuts-seen', 'true')
      }, 3000) // Show after 3 seconds on first visit
    }
  }

  showShortcutTip() {
    const tip = document.createElement('div')
    tip.className = 'shortcut-tip'
    tip.innerHTML = `
      <div class="tip-content">
        <span class="tip-icon">💡</span>
        <span class="tip-text">Tip: Press <kbd>?</kbd> to see keyboard shortcuts</span>
        <button class="tip-close" aria-label="Dismiss tip">&times;</button>
      </div>
    `

    document.body.appendChild(tip)

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.dismissTip(tip)
    }, 5000)

    // Manual dismiss
    tip.querySelector('.tip-close').onclick = () => {
      this.dismissTip(tip)
    }
  }

  dismissTip(tip) {
    tip.classList.add('dismissed')
    setTimeout(() => {
      if (tip.parentNode) {
        tip.parentNode.removeChild(tip)
      }
    }, 300)
  }

  setContext(context) {
    this.currentContext = context

    if (context === 'modal') {
      this.registerModalShortcuts()
    }
  }

  enable() {
    this.isEnabled = true
  }

  disable() {
    this.isEnabled = false
  }
}

// Create global instance
export const keyboardManager = new KeyboardManager()

// Convenience functions for other components
export const enableKeyboardShortcuts = () => keyboardManager.enable()
export const disableKeyboardShortcuts = () => keyboardManager.disable()
export const setKeyboardContext = (context) =>
  keyboardManager.setContext(context)
