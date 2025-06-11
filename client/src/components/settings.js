// Settings panel for Kairo preferences
import { notifications } from '../utils/notifications'
import { toggleTheme } from '../utils/theme'

export function createSettingsPanel() {
  function showSettingsModal() {
    // Remove existing modal if present
    const existingModal = document.querySelector('.settings-modal-overlay')
    if (existingModal) {
      existingModal.remove()
    }

    const modal = document.createElement('div')
    modal.className = 'settings-modal-overlay'
    modal.innerHTML = `
      <div class="settings-modal" role="dialog" aria-labelledby="settings-title" aria-modal="true">
        <div class="settings-header">
          <h3 id="settings-title">⚙️ Settings</h3>
          <button class="settings-close" aria-label="Close settings">&times;</button>
        </div>
        
        <div class="settings-content">
          <div class="setting-section">
            <h4>🔔 Notifications</h4>
            <div class="setting-item">
              <label class="setting-toggle">
                <input 
                  type="checkbox" 
                  id="browser-notifications" 
                  ${notifications.getBrowserNotificationsEnabled() ? 'checked' : ''}
                >
                <span class="toggle-slider"></span>
                <span class="setting-label">Browser notifications</span>
              </label>
              <p class="setting-description">Get notified when sessions complete</p>
            </div>
          </div>
          
          <div class="setting-section">
            <h4>🔊 Audio</h4>
            <div class="setting-item">
              <label class="setting-toggle">
                <input 
                  type="checkbox" 
                  id="sound-notifications" 
                  ${notifications.getSoundEnabled() ? 'checked' : ''}
                >
                <span class="toggle-slider"></span>
                <span class="setting-label">Sound effects</span>
              </label>
              <p class="setting-description">Play gentle sounds for session events</p>
            </div>
          </div>
          
          <div class="setting-section">
            <h4>🎨 Appearance</h4>
            <div class="setting-item">
              <label class="setting-toggle">
                <input 
                  type="checkbox" 
                  id="dark-mode" 
                  ${document.body.getAttribute('data-theme') === 'dark' ? 'checked' : ''}
                >
                <span class="toggle-slider"></span>
                <span class="setting-label">Dark mode</span>
              </label>
              <p class="setting-description">Switch to dark theme</p>
            </div>
          </div>
          
          <div class="setting-section">
            <h4>📊 Data</h4>
            <div class="setting-item">
              <button class="setting-button export-btn" id="export-data">
                📄 Export Session Data
              </button>
              <p class="setting-description">Download your session history as CSV</p>
            </div>
            <div class="setting-item">
              <button class="setting-button danger-btn" id="clear-data">
                🗑️ Clear All Data
              </button>
              <p class="setting-description">Remove all local session data and stats</p>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Add event listeners
    setupSettingsEventListeners(modal)

    // Focus the close button for accessibility
    setTimeout(() => {
      modal.querySelector('.settings-close').focus()
    }, 100)
  }

  function setupSettingsEventListeners(modal) {
    const closeBtn = modal.querySelector('.settings-close')
    const browserNotificationToggle = modal.querySelector(
      '#browser-notifications',
    )
    const soundToggle = modal.querySelector('#sound-notifications')
    const darkModeToggle = modal.querySelector('#dark-mode')
    const exportBtn = modal.querySelector('#export-data')
    const clearDataBtn = modal.querySelector('#clear-data')

    // Close modal
    closeBtn.onclick = () => modal.remove()
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove()
    }

    // Keyboard navigation
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modal.remove()
      }
    })

    // Browser notifications
    browserNotificationToggle.onchange = async () => {
      if (browserNotificationToggle.checked) {
        const granted = await notifications.requestNotificationPermission()
        if (!granted) {
          browserNotificationToggle.checked = false
          alert(
            'Please enable notifications in your browser settings to use this feature.',
          )
        }
      }
    }

    // Sound notifications
    soundToggle.onchange = () => {
      notifications.setSoundEnabled(soundToggle.checked)
      if (soundToggle.checked) {
        // Play a test sound
        notifications.createTimerSound('completion')
      }
    }

    // Dark mode
    darkModeToggle.onchange = () => {
      toggleTheme()
    }

    // Export data
    exportBtn.onclick = () => exportSessionData()

    // Clear data
    clearDataBtn.onclick = () => {
      if (
        confirm(
          'Are you sure you want to clear all session data? This cannot be undone.',
        )
      ) {
        clearAllData()
        modal.remove()
      }
    }
  }

  async function exportSessionData() {
    try {
      // Fetch sessions from server
      const response = await fetch('/api/sessions')
      const sessions = await response.json()

      // Convert to CSV
      const csvHeader = 'Date,Type,Duration (min),Reflection,Mood\n'
      const csvData = sessions
        .map((session) => {
          const date = new Date(session.startTime).toLocaleDateString()
          const reflection = session.reflection
            ? `"${session.reflection.replace(/"/g, '""')}"`
            : ''
          const mood = session.mood || ''
          return `${date},${session.type},${session.duration},${reflection},${mood}`
        })
        .join('\n')

      // Create and download file
      const blob = new Blob([csvHeader + csvData], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kairo-sessions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      notifications.showBrowserNotification(
        '📄 Export Complete',
        'Your session data has been downloaded',
      )
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  function clearAllData() {
    // Clear localStorage
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('kairo-')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))

    // Refresh the page to reset the app state
    window.location.reload()
  }

  return {
    show: showSettingsModal,
  }
}

// Add settings button to header
export function addSettingsButton() {
  const header = document.querySelector('.header')
  if (!header || header.querySelector('.settings-btn')) return

  const settingsBtn = document.createElement('button')
  settingsBtn.className = 'settings-btn'
  settingsBtn.innerHTML = '⚙️'
  settingsBtn.title = 'Settings'
  settingsBtn.setAttribute('aria-label', 'Open settings')

  const settings = createSettingsPanel()
  settingsBtn.onclick = settings.show

  header.appendChild(settingsBtn)
}

// Inject settings styles
export function injectSettingsStyles() {
  if (document.getElementById('settings-styles')) return

  const style = document.createElement('style')
  style.id = 'settings-styles'
  style.textContent = `
    .settings-btn {
      background: var(--surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: var(--spacing-sm);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-size: var(--text-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
      height: 40px;
    }
    
    .settings-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-emphasis);
      color: var(--text-primary);
      transform: translateY(-1px);
      box-shadow: var(--shadow-soft);
    }
    
    .settings-btn:focus {
      outline: var(--focus-ring);
      outline-offset: var(--focus-ring-offset);
    }
    
    .settings-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--spacing-lg);
    }
    
    .settings-modal {
      background: var(--surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-intense);
      max-width: 500px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
    }
    
    .settings-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--border-subtle);
    }
    
    .settings-header h3 {
      font-family: 'Crimson Text', serif;
      font-size: var(--text-xl);
      color: var(--text-primary);
      margin: 0;
    }
    
    .settings-close {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: var(--text-xl);
      cursor: pointer;
      padding: var(--spacing-xs);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }
    
    .settings-close:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    
    .settings-content {
      padding: var(--spacing-lg);
    }
    
    .setting-section {
      margin-bottom: var(--spacing-xl);
    }
    
    .setting-section:last-child {
      margin-bottom: 0;
    }
    
    .setting-section h4 {
      font-family: 'Crimson Text', serif;
      font-size: var(--text-lg);
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: var(--spacing-xs);
    }
    
    .setting-item {
      margin-bottom: var(--spacing-lg);
    }
    
    .setting-item:last-child {
      margin-bottom: 0;
    }
    
    .setting-toggle {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      cursor: pointer;
      margin-bottom: var(--spacing-xs);
    }
    
    .setting-toggle input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
    
    .toggle-slider {
      width: 48px;
      height: 24px;
      background: var(--border-subtle);
      border-radius: 12px;
      position: relative;
      transition: background var(--transition-fast);
      flex-shrink: 0;
    }
    
    .toggle-slider::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform var(--transition-fast);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .setting-toggle input:checked + .toggle-slider {
      background: var(--primary);
    }
    
    .setting-toggle input:checked + .toggle-slider::before {
      transform: translateX(24px);
    }
    
    .setting-toggle input:focus + .toggle-slider {
      outline: var(--focus-ring);
      outline-offset: var(--focus-ring-offset);
    }
    
    .setting-label {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .setting-description {
      font-size: var(--text-sm);
      color: var(--text-muted);
      margin: 0;
      line-height: 1.4;
    }
    
    .setting-button {
      background: var(--surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: var(--spacing-sm) var(--spacing-md);
      color: var(--text-primary);
      font-family: inherit;
      font-size: var(--text-sm);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      margin-bottom: var(--spacing-xs);
    }
    
    .setting-button:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-emphasis);
      transform: translateY(-1px);
      box-shadow: var(--shadow-soft);
    }
    
    .setting-button:focus {
      outline: var(--focus-ring);
      outline-offset: var(--focus-ring-offset);
    }
    
    .setting-button.export-btn {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }
    
    .setting-button.export-btn:hover {
      background: var(--primary-hover);
      border-color: var(--primary-hover);
    }
    
    .setting-button.danger-btn {
      background: var(--error);
      border-color: var(--error);
      color: white;
    }
    
    .setting-button.danger-btn:hover {
      background: #dc2626;
      border-color: #dc2626;
    }
    
    /* Dark mode adjustments */
    [data-theme='dark'] .settings-modal {
      background: var(--surface-elevated);
    }
    
    [data-theme='dark'] .toggle-slider::before {
      background: var(--surface);
    }
    
    /* Mobile responsive */
    @media (max-width: 640px) {
      .settings-modal-overlay {
        padding: var(--spacing-sm);
      }
      
      .settings-modal {
        max-height: 90vh;
      }
      
      .settings-header, .settings-content {
        padding: var(--spacing-md);
      }
      
      .setting-section {
        margin-bottom: var(--spacing-lg);
      }
    }
  `

  document.head.appendChild(style)
}
