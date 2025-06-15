// onboardingModal.js
// Simple onboarding/help modal for Kairo

export function createOnboardingModal() {
  // Create modal elements
  const modal = document.createElement('div')
  modal.id = 'onboarding-modal'
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')
  modal.setAttribute('tabindex', '-1')
  modal.style.display = 'none'

  modal.innerHTML = `
        <div class="onboarding-modal-content">
            <button class="onboarding-close" aria-label="Close help modal">&times;</button>
            <h2>Welcome to Kairo!</h2>
            <p>Kairo is a focus timer app designed to help you stay productive and mindful. Here’s what you can do:</p>
            <ul>
                <li>Start focus sessions with the timer</li>
                <li>View your session history and streaks</li>
                <li>Take notes and reflect on your sessions</li>
                <li>Export or delete your data in Settings</li>
                <li>Enjoy a mobile-friendly, accessible experience</li>
            </ul>
            <p>Need help? Click the <b>?</b> button anytime.</p>
        </div>
    `

  // Overlay styling
  modal.classList.add('onboarding-modal-overlay')

  // Close button logic
  modal.querySelector('.onboarding-close').onclick = () => {
    modal.style.display = 'none'
    modal.setAttribute('aria-hidden', 'true')
  }

  // Trap focus inside modal
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusable = modal.querySelectorAll(
        'button, [tabindex]:not([tabindex="-1"])',
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === last) {
          first.focus()
          e.preventDefault()
        }
      }
    }
    if (e.key === 'Escape') {
      modal.style.display = 'none'
      modal.setAttribute('aria-hidden', 'true')
    }
  })

  document.body.appendChild(modal)
  return modal
}

export function showOnboardingModal() {
  const modal = document.getElementById('onboarding-modal')
  if (modal) {
    modal.style.display = 'flex'
    modal.setAttribute('aria-hidden', 'false')
    // Focus close button for accessibility
    const closeBtn = modal.querySelector('.onboarding-close')
    if (closeBtn) closeBtn.focus()
  }
}

export function addOnboardingButton() {
  // Persistent help button
  const btn = document.createElement('button')
  btn.id = 'onboarding-help-btn'
  btn.innerText = '?'
  btn.setAttribute('aria-label', 'Open help modal')
  btn.classList.add('onboarding-help-btn')
  btn.onclick = showOnboardingModal
  document.body.appendChild(btn)
}
