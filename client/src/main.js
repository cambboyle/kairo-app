// main.js - Japanese Zen Minimalism Design
import './styles/index.css'
import { startTimer } from './components/timer'
import { sessionHistory } from './components/history'
import {
  createAnalyticsDashboard,
  injectAnalyticsStyles,
} from './components/analytics'
import { addSettingsButton, injectSettingsStyles } from './components/settings'
import { initializeTheme } from './utils/theme'
import { enhancedSessionNotesManager } from './utils/sessionNotesImproved'

let historyApi
let analyticsApi

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app')

  app.innerHTML = `
    
    <header class="header" role="banner">
      <h1 class="logo">Kairo</h1>
    </header>
    
    <main class="main-content" role="main">
      <section class="timer-container" aria-labelledby="timer-heading">
        <div class="timer-header">
          <h2 id="timer-heading" class="timer-heading">Focus Timer</h2>
        </div>
        <div class="timer-content">
          <div id="timer" aria-live="polite" aria-atomic="false"></div>
        </div>
      </section>
      
      <div class="divider" aria-hidden="true"></div>
      
      <aside class="history-section" aria-labelledby="history-heading">
        <div class="history-header">
          <h2 id="history-heading" class="history-title">Session History</h2>
        </div>
        <div id="analytics" class="analytics-container"></div>
        <div id="history" aria-live="polite" aria-atomic="false"></div>
      </aside>
    </main>
  `

  // Inject styles
  injectAnalyticsStyles()
  injectSettingsStyles()

  // Initialize theme
  initializeTheme()

  startTimer(document.getElementById('timer'))
  historyApi = sessionHistory(document.getElementById('history'))
  analyticsApi = createAnalyticsDashboard(document.getElementById('analytics'))
  addSettingsButton()

  // Make analytics API globally available for other components
  window.analyticsApi = analyticsApi

  // Announce app readiness to screen readers
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent =
    'Kairo focus timer app loaded and ready to use. Japanese Zen minimalist design.'
  document.body.appendChild(announcement)

  // Remove announcement after it's been read
  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.parentNode.removeChild(announcement)
    }
  }, 3000)

  // Make managers available globally for component integration
  window.sessionNotesManager = enhancedSessionNotesManager
  window.analyticsApi = analyticsApi
})

export { historyApi, analyticsApi, enhancedSessionNotesManager }
