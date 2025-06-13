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
      <div class="analytics-dashboard">
        <div class="analytics-header">
          <h3>📊 Your Insights</h3>
          <p>Track your focus patterns and progress</p>
        </div>
        
        <div class="analytics-grid">
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <div class="stat-number">${streakData.currentStreak}</div>
              <div class="stat-label">Day Streak</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <div class="stat-number">${stats.thisWeek}</div>
              <div class="stat-label">This Week</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-number">${totalSessions}</div>
              <div class="stat-label">Total Sessions</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-number">${streakData.longestStreak}</div>
              <div class="stat-label">Best Streak</div>
            </div>
          </div>
        </div>
        
        ${
          totalSessions > 0
            ? `
          <div class="session-breakdown">
            <h4>Session Types</h4>
            <div class="session-types-chart">
              ${Object.entries(stats.byType)
                .map(([type, count]) => {
                  const percentage = (count / totalSessions) * 100
                  const sessionType = Object.values(SESSION_TYPES).find(
                    (st) => st.id === type,
                  )
                  return `
                  <div class="session-type-item">
                    <span class="session-type-info">
                      <span class="session-type-icon">${sessionType ? sessionType.icon : '○'}</span>
                      <span class="session-type-name">${type}</span>
                    </span>
                    <div class="session-type-bar">
                      <div class="session-type-progress" style="width: ${percentage}%; background-color: ${sessionType ? sessionType.color : '#6b7280'}"></div>
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
          <div class="empty-analytics">
            <p>Complete your first session to see insights!</p>
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
    .analytics-dashboard {
      padding: var(--spacing-lg);
      background: var(--surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      margin-bottom: var(--spacing-lg);
    }
    
    .analytics-header {
      text-align: center;
      margin-bottom: var(--spacing-lg);
    }
    
    .analytics-header h3 {
      font-family: 'Crimson Text', serif;
      font-size: var(--text-xl);
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }
    
    .analytics-header p {
      color: var(--text-muted);
      font-size: var(--text-sm);
      margin: 0;
    }
    
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--surface) 100%);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }
    
    .stat-card:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-soft);
    }
    
    .stat-icon {
      font-size: var(--text-lg);
      opacity: 0.8;
    }
    
    .stat-content {
      flex: 1;
      min-width: 0;
    }
    
    .stat-number {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--primary);
      line-height: 1.2;
      font-family: 'Inter', sans-serif;
      font-variant-numeric: tabular-nums;
    }
    
    .stat-label {
      font-size: var(--text-xs);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .session-breakdown {
      border-top: 1px solid var(--border-subtle);
      padding-top: var(--spacing-lg);
    }
    
    .session-breakdown h4 {
      font-family: 'Crimson Text', serif;
      font-size: var(--text-lg);
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
    }
    
    .session-types-chart {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }
    
    .session-type-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) 0;
    }
    
    .session-type-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      min-width: 100px;
      flex-shrink: 0;
    }
    
    .session-type-icon {
      font-size: var(--text-sm);
    }
    
    .session-type-name {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      font-weight: 500;
    }
    
    .session-type-bar {
      flex: 1;
      height: 8px;
      background: var(--border-subtle);
      border-radius: var(--radius-sm);
      overflow: hidden;
      margin: 0 var(--spacing-sm);
    }
    
    .session-type-progress {
      height: 100%;
      border-radius: var(--radius-sm);
      transition: width var(--transition-normal);
    }
    
    .session-type-count {
      font-size: var(--text-sm);
      color: var(--text-muted);
      font-weight: 600;
      min-width: 20px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    
    .empty-analytics {
      text-align: center;
      padding: var(--spacing-xl);
      color: var(--text-muted);
      font-style: italic;
    }
    
    /* Dark mode adjustments */
    [data-theme='dark'] .analytics-dashboard {
      background: var(--surface-elevated);
    }
    
    [data-theme='dark'] .stat-card {
      background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--surface) 100%);
    }
    
    /* Responsive design */
    @media (max-width: 640px) {
      .analytics-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-sm);
      }
      
      .stat-card {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-xs);
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
