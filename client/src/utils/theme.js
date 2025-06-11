// Theme utilities for Kairo
// Handles theme switching and persistence

export function initializeTheme() {
  // Load saved theme preference
  const savedTheme = localStorage.getItem('kairo-theme')
  if (savedTheme) {
    document.body.setAttribute(
      'data-theme',
      savedTheme === 'dark' ? 'dark' : '',
    )
  }
}

export function toggleTheme() {
  const isDark = document.body.getAttribute('data-theme') === 'dark'
  const newTheme = isDark ? '' : 'dark'

  document.body.setAttribute('data-theme', newTheme)

  // Announce theme change to screen readers
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.className = 'sr-only'
  announcement.textContent = `Switched to ${isDark ? 'light' : 'dark'} mode`
  document.body.appendChild(announcement)

  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.parentNode.removeChild(announcement)
    }
  }, 2000)

  // Save preference to localStorage
  localStorage.setItem('kairo-theme', newTheme || 'light')

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
