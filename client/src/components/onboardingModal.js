// zenOnboarding.js
// Mindful introduction to Kairo's practice

export function createZenOnboardingModal() {
  const modal = document.createElement('div')
  modal.id = 'zen-onboarding-modal'
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')
  modal.setAttribute('tabindex', '-1')
  modal.style.display = 'none'

  modal.innerHTML = `
        <div class="zen-onboarding-content">
            <button class="zen-onboarding-close" aria-label="Close guidance">
                <span class="close-symbol">×</span>
            </button>
            
            <div class="zen-onboarding-header">
                <div class="zen-symbol">○</div>
                <h2>Welcome to Kairo</h2>
                <p class="zen-subtitle">A space for mindful focus</p>
            </div>
            
            <div class="zen-onboarding-body">
                <div class="zen-teaching">
                    <p>In Japanese, <em>Kairo</em> (回廊) means a corridor or path that connects spaces.</p>
                    <p>This is your path to deeper focus and presence.</p>
                </div>
                
                <div class="zen-practice">
                    <div class="practice-step">
                        <div class="step-symbol">◦</div>
                        <div class="step-content">
                            <h4>Begin</h4>
                            <p>Choose your session length and type</p>
                        </div>
                    </div>
                    
                    <div class="practice-step">
                        <div class="step-symbol">｜</div>
                        <div class="step-content">
                            <h4>Focus</h4>
                            <p>Let time flow naturally</p>
                        </div>
                    </div>
                    
                    <div class="practice-step">
                        <div class="step-symbol">◯</div>
                        <div class="step-content">
                            <h4>Reflect</h4>
                            <p>Notice your patterns and growth</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="zen-onboarding-footer">
                <p>Find this guidance anytime in the corner <span class="help-hint">?</span></p>
                <button class="zen-begin-button">Begin Practice</button>
            </div>
        </div>
    `

  modal.classList.add('zen-onboarding-overlay')

  // Close button logic
  const closeBtn = modal.querySelector('.zen-onboarding-close')
  const beginBtn = modal.querySelector('.zen-begin-button')

  closeBtn.onclick = () => {
    modal.style.display = 'none'
    modal.setAttribute('aria-hidden', 'true')
  }

  beginBtn.onclick = () => {
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

export function showZenOnboardingModal() {
  const modal = document.getElementById('zen-onboarding-modal')
  if (modal) {
    modal.style.display = 'flex'
    modal.setAttribute('aria-hidden', 'false')
    modal.classList.add('zen-emerge')
    // Focus close button for accessibility
    const closeBtn = modal.querySelector('.zen-onboarding-close')
    if (closeBtn) closeBtn.focus()
  }
}

export function addZenOnboardingButton() {
  const existing = document.getElementById('zen-onboarding-help-btn')
  if (existing) return

  // Zen help button with subtle positioning
  const btn = document.createElement('button')
  btn.id = 'zen-onboarding-help-btn'
  btn.className = 'zen-help-button'
  btn.innerText = '?'
  btn.setAttribute('aria-label', 'Show guidance')
  btn.setAttribute('title', 'Show practice guidance')

  btn.addEventListener('click', () => {
    showZenOnboardingModal()
  })

  document.body.appendChild(btn)
  return btn
}

// Legacy exports for compatibility
export const createOnboardingModal = createZenOnboardingModal
export const showOnboardingModal = showZenOnboardingModal
export const addOnboardingButton = addZenOnboardingButton
