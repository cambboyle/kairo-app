// Analytics component for session insights
import { getSessionStats } from '../utils/streakManager'
import { getStreakData } from '../utils/streakManager'
import { SESSION_TYPES, getMoodById } from '../config/sessionConfig'

export function createAnalyticsDashboard(container) {
  function renderAnalytics() {
    const stats = getSessionStats()
    const streakData = getStreakData()

    // Calculate insights
    const mostProductiveType = getMostProductiveSessionType(stats.byType)
    const totalSessions = Object.values(stats.byType).reduce(
      (sum, count) => sum + count,
      0,
    )

    container.innerHTML = `
      <div class="analytics-dashboard zen-stagger-children">
        <div class="analytics-header">
          <h3>◯ Your Journey</h3>
          <p>Patterns emerge from practice</p>
        </div>
        
        <div class="analytics-grid">
          <div class="stat-card zen-lift-hover">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <div class="stat-number">${streakData.currentStreak}</div>
              <div class="stat-label">Day Streak</div>
            </div>
          </div>
          
          <div class="stat-card zen-lift-hover">
            <div class="stat-icon">◦</div>
            <div class="stat-content">
              <div class="stat-number">${stats.thisWeek}</div>
              <div class="stat-label">This Week</div>
            </div>
          </div>
          
          <div class="stat-card zen-lift-hover">
            <div class="stat-icon">○</div>
            <div class="stat-content">
              <div class="stat-number">${totalSessions}</div>
              <div class="stat-label">Sessions</div>
            </div>
          </div>
          
          <div class="stat-card zen-lift-hover">
            <div class="stat-icon">◯</div>
            <div class="stat-content">
              <div class="stat-number">${streakData.longestStreak}</div>
              <div class="stat-label">Best Streak</div>
            </div>
          </div>
        </div>
        
        ${
          totalSessions > 0
            ? `
          <div class="session-breakdown zen-fade-in">
            <h4>Practice Types</h4>
            <div class="session-types-chart">
              ${Object.entries(stats.byType)
                .map(([type, count]) => {
                  const percentage = (count / totalSessions) * 100
                  const sessionType = Object.values(SESSION_TYPES).find(
                    (st) => st.id === type,
                  )
                  return `
                  <div class="session-type-item zen-scale-hover">
                    <span class="session-type-info">
                      <span class="session-type-icon">${sessionType ? sessionType.icon : '○'}</span>
                      <span class="session-type-name">${type}</span>
                    </span>
                    <div class="session-type-bar">
                      <div class="session-type-progress zen-transition" style="width: ${percentage}%; background-color: var(--text-muted)"></div>
                    </div>
                    <span class="session-type-count">${count}</span>
                  </div>
                `
                })
                .join('')}
            </div>
          </div>
        `
            : `
          <div class="empty-analytics zen-gentle-pulse">
            <p>Your first session will begin your journey</p>
          </div>
        `
        }
      </div>
    `
  }

  function getMostProductiveSessionType(byType) {
    if (Object.keys(byType).length === 0) return null

    return Object.entries(byType).reduce((prev, current) =>
      prev[1] > current[1] ? prev : current,
    )[0]
  }

  // Refresh analytics when called
  renderAnalytics()

  return {
    refresh: renderAnalytics,
  }
}

// Add analytics styles
export function injectAnalyticsStyles() {
  if (document.getElementById('analytics-styles')) return

  const style = document.createElement('style')
  style.id = 'analytics-styles'
  style.textContent = `
    /* Analytics Dashboard - Japanese Zen Minimalism */
    .analytics-dashboard {
      padding: 0;
      background: transparent;
      margin: 0;
    }
    
    .analytics-header {
      text-align: center;
      margin-bottom: var(--spacing-2xl);
      padding: var(--spacing-lg) var(--spacing-xl);
      border-bottom: 1px solid var(--border-subtle);
    }
    
    /* Prevent any hover effects on analytics header */
    .analytics-header:hover,
    .analytics-dashboard:hover .analytics-header {
      border-bottom: 1px solid var(--border-subtle);
      transform: none;
      box-shadow: none;
    }
    
    .analytics-header h3 {
      font-family: var(--font-serif);
      font-size: var(--text-lg);
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
      font-weight: 600;
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-snug);
    }
    
    .analytics-header p {
      color: var(--text-muted);
      font-size: var(--text-sm);
      margin: 0;
      font-family: var(--font-primary);
      font-weight: 400;
      letter-spacing: var(--tracking-normal);
      opacity: 0.8;
    }
    
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-2xl);
      margin-top: var(--spacing-2xl);
      padding: 0 var(--spacing-xl);
    }
    
    /* Zen Stat Cards - Clean and Minimal */
    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg) var(--spacing-xl);
      background: var(--surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      transition: all var(--transition-normal);
      position: relative;
      min-height: 64px;
    }
    
    .stat-card:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-emphasis);
      transform: translateY(-1px);
    }
    
    .stat-icon {
      font-size: var(--text-xl);
      opacity: 0.7;
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .stat-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }
    
    .stat-number {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
      line-height: var(--leading-tight);
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
      letter-spacing: var(--tracking-tight);
    }
    
    .stat-label {
      font-size: var(--text-xs);
      color: var(--text-muted);
      font-weight: 500;
      letter-spacing: var(--tracking-wider);
      font-family: var(--font-primary);
      line-height: var(--leading-normal);
    }
    
    /* Session Breakdown - Simplified */
    .session-breakdown {
      border-top: 1px solid var(--border-subtle);
      padding: var(--spacing-xl);
      margin-top: var(--spacing-lg);
    }
    
    .session-breakdown h4 {
      font-family: var(--font-serif);
      font-size: var(--text-lg);
      color: var(--text-primary);
      margin: 0 0 var(--spacing-lg) 0;
      font-weight: 600;
      letter-spacing: var(--tracking-tight);
      text-align: center;
    }
    
    .session-types-chart {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }
    
    /* Session Type Items - Zen Simplified */
    .session-type-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--border-subtle);
      transition: background var(--transition-fast);
    }
    
    .session-type-item:hover {
      background: var(--bg-tertiary);
      margin: 0 calc(-1 * var(--spacing-md));
      padding-left: var(--spacing-md);
      padding-right: var(--spacing-md);
      border-radius: var(--radius-sm);
    }
    
    .session-type-item:last-child {
      border-bottom: none;
    }
    
    .session-type-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      min-width: 120px;
      flex-shrink: 0;
    }
    
    .session-type-icon {
      font-size: var(--text-base);
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
    }
    
    .session-type-name {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      font-weight: 500;
      font-family: var(--font-primary);
    }
    
    /* Zen Progress Bar - Minimal */
    .session-type-bar {
      flex: 1;
      height: 4px;
      background: var(--border-subtle);
      border-radius: var(--radius-sm);
      overflow: hidden;
      margin: 0 var(--spacing-md);
    }
    
    .session-type-progress {
      height: 100%;
      background: var(--text-muted);
      border-radius: var(--radius-sm);
      transition: width var(--transition-normal);
      opacity: 0.8;
    }
    
    .session-type-count {
      font-size: var(--text-sm);
      color: var(--text-muted);
      font-weight: 600;
      min-width: 24px;
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-family: var(--font-mono);
    }
    
    /* Empty State - Zen and Encouraging */
    .empty-analytics {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--spacing-4xl) var(--spacing-xl);
      color: var(--text-muted);
      min-height: 200px;
    }
    
    .empty-analytics::before {
      content: '📊';
      font-size: 2.5rem;
      margin-bottom: var(--spacing-lg);
      opacity: 0.6;
    }
    
    /* Dark Mode - Harmonious */
    [data-theme='dark'] .stat-card {
      background: var(--surface);
      border-color: var(--border-subtle);
    }
    
    [data-theme='dark'] .session-breakdown {
      background: var(--surface);
    }
    
    /* Responsive Design - Mobile-First Ma (間) */
    @media (max-width: 640px) {
      .analytics-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-md);
        padding: 0 var(--spacing-lg);
      }
      
      .stat-card {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
      }
      
      .stat-content {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .session-type-item {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-xs);
      }
      
      .session-type-info {
        justify-content: space-between;
        min-width: unset;
      }
      
      .session-type-bar {
        margin: 0;
      }
    }
  `

  document.head.appendChild(style)
}
