// onboardingModal.js
// Zen-inspired onboarding modal for Kairo

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
            <button class="onboarding-close" aria-label="Close welcome guidance">&times;</button>
            <div class="onboarding-zen-header">
                <h2>Begin your practice</h2>
                <p class="onboarding-subtitle">A moment of guidance</p>
            </div>
            
            <div class="onboarding-essence">
                <p>Kairo invites you to cultivate focused presence through mindful sessions.</p>
            </div>
            
            <div class="onboarding-guidance">
                <div class="guidance-item">
                    <span class="guidance-symbol">○</span>
                    <span>Begin a focused session</span>
                </div>
                <div class="guidance-item">
                    <span class="guidance-symbol">｜</span>
                    <span>Reflect on your journey</span>
                </div>
                <div class="guidance-item">
                    <span class="guidance-symbol">◡</span>
                    <span>Find your natural rhythm</span>
                </div>
            </div>
            
            <div class="onboarding-closing">
                <p>Return to this guidance anytime with <span class="help-indicator">?</span></p>
            </div>
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
  // Persistent help button with zen aesthetics
  const btn = document.createElement('button')
  btn.id = 'onboarding-help-btn'
  btn.innerText = '?'
  btn.setAttribute('aria-label', 'Open guidance')
  btn.classList.add('onboarding-help-btn')
  btn.onclick = showOnboardingModal
  document.body.appendChild(btn)
}
