// main.js - Japanese Zen Minimalism Design
import './styles/index.css'
import { startTimer } from './components/timer'
import { sessionHistory } from './components/history'
import {
  createAnalyticsDashboard,
  injectAnalyticsStyles,
} from './components/analytics'
import {
  initializeTheme,
  toggleTheme,
  getCurrentTheme,
  setTheme,
} from './utils/theme'
import { enhancedSessionNotesManager } from './utils/sessionNotesImproved'
import {
  createZenOnboardingModal,
  showZenOnboardingModal,
  addZenOnboardingButton,
} from './components/onboardingModal'
import { zenSessionNotes, injectZenNotesStyles } from './utils/zenSessionNotes'
import {
  zenSettings,
  addZenSettingsButton,
  injectZenSettingsStyles,
} from './components/zenSettings'
import { zenErrorHandler } from './utils/zenErrorHandler'

let historyApi
let analyticsApi

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app')

  app.innerHTML = `
    
    <header class="header" role="banner">
      <h1 class="logo">Kairo</h1>
    </header>
    
    <main class="main-content" role="main">
      <section class="timer-container zen-emerge" aria-labelledby="timer-heading">
        <div class="timer-header">
          <h2 id="timer-heading" class="timer-heading">Focus Timer</h2>
        </div>
        <div class="timer-content">
          <div id="timer" aria-live="polite" aria-atomic="false"></div>
        </div>
      </section>
      
      <div class="divider zen-breathe-subtle" aria-hidden="true"></div>
      
      <aside class="history-section zen-emerge-delayed" aria-labelledby="history-heading">
        <div class="history-header">
          <h2 id="history-heading" class="history-title">Session History</h2>
        </div>
        <div id="analytics" class="analytics-container"></div>
        <div id="history" aria-live="polite" aria-atomic="false"></div>
      </aside>
    </main>
  `

  // Inject all zen styles
  injectAnalyticsStyles()
  injectZenSettingsStyles()
  injectZenNotesStyles()

  // Initialize theme
  initializeTheme()

  // Expose theme functions globally for zenSettings
  window.toggleTheme = toggleTheme
  window.getCurrentTheme = getCurrentTheme
  window.setTheme = setTheme

  // Initialize components with zen animations
  startTimer(document.getElementById('timer'))
  historyApi = sessionHistory(document.getElementById('history'))
  analyticsApi = createAnalyticsDashboard(document.getElementById('analytics'))

  // Add zen components
  addZenSettingsButton()
  addZenOnboardingButton()

  // Initialize zen session notes
  zenSessionNotes.init()

  // Make APIs globally available for component integration
  window.analyticsApi = analyticsApi
  window.historyApi = historyApi
  window.sessionNotesManager = enhancedSessionNotesManager
  window.zenSessionNotes = zenSessionNotes
  window.zenSettings = zenSettings

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

  // Zen onboarding/help modal integration
  createZenOnboardingModal()
  if (!localStorage.getItem('kairoOnboardingShown')) {
    setTimeout(() => {
      showZenOnboardingModal()
      localStorage.setItem('kairoOnboardingShown', 'true')
    }, 1000) // Gentle delay for zen emergence
  }

  // Apply zen stagger animation to main components
  document.querySelector('.main-content').classList.add('zen-stagger-children')
})

export {
  historyApi,
  analyticsApi,
  enhancedSessionNotesManager,
  zenSessionNotes,
  zenSettings,
  zenErrorHandler,
}
