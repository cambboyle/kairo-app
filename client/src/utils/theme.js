// Theme utilities for Kairo
// Handles theme switching and persistence

export function initializeTheme() {
  // Load saved theme preference
  const savedTheme = localStorage.getItem('kairo-theme')
  console.log('Initializing theme, saved theme:', savedTheme) // Debug log

  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark')
  } else {
    document.body.setAttribute('data-theme', '') // Ensure light theme is set
  }

  console.log(
    'Theme initialized, current data-theme:',
    document.body.getAttribute('data-theme'),
  ) // Debug log
}

export function toggleTheme() {
  const isDark = document.body.getAttribute('data-theme') === 'dark'
  const newTheme = isDark ? 'light' : 'dark'

  console.log('Toggling theme from', isDark ? 'dark' : 'light', 'to', newTheme) // Debug log

  document.body.setAttribute('data-theme', newTheme === 'dark' ? 'dark' : '')

  // Announce theme change to screen readers
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.className = 'sr-only'
  announcement.textContent = `Switched to ${newTheme} mode`
  document.body.appendChild(announcement)

  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.parentNode.removeChild(announcement)
    }
  }, 2000)

  // Save preference to localStorage
  localStorage.setItem('kairo-theme', newTheme)
  console.log('Theme saved to localStorage:', newTheme) // Debug log

  return !isDark // Return new dark mode state
}

export function getCurrentTheme() {
  return document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export function setTheme(theme) {
  const isDark = theme === 'dark'
  document.body.setAttribute('data-theme', isDark ? 'dark' : '')
  localStorage.setItem('kairo-theme', theme)
}
