// sessionTemplates.js - Session Templates Component
// Pre-configured session templates for quick setup

import {
  SESSION_TEMPLATES,
  TEMPLATE_CATEGORIES,
  getTemplatesByCategory,
  getPopularTemplates,
  searchTemplates,
  getAllTemplates,
  getCustomTemplates,
  deleteCustomTemplate,
  getMostUsedTemplates,
} from '../config/sessionConfig.js'

export function createSessionTemplates(container, onTemplateSelect) {
  let currentCategory = 'popular'
  let searchQuery = ''

  function renderTemplates() {
    const allTemplates = getAllTemplates()
    const customTemplates = getCustomTemplates()
    const recentTemplates = getMostUsedTemplates(3)

    const templates = searchQuery
      ? allTemplates.filter(
          (template) =>
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            template.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
        )
      : currentCategory === 'custom'
        ? customTemplates
        : currentCategory === 'recent'
          ? recentTemplates
          : currentCategory
            ? allTemplates.filter(
                (template) => template.category === currentCategory,
              )
            : getPopularTemplates()

    // Add custom category if custom templates exist
    const categories = [...TEMPLATE_CATEGORIES]
    if (
      customTemplates.length > 0 &&
      !categories.find((cat) => cat.id === 'custom')
    ) {
      categories.push({ id: 'custom', name: 'My Templates', icon: '⭐' })
    }
    // Add recent category if there are recently used templates
    if (
      recentTemplates.length > 0 &&
      !categories.find((cat) => cat.id === 'recent')
    ) {
      categories.unshift({ id: 'recent', name: 'Recent', icon: '🕒' })
    }

    container.innerHTML = `
      <div class="session-templates">
        <div class="templates-header">
          <h3>📋 Session Templates</h3>
          <p>Choose from pre-configured sessions</p>
        </div>

        <div class="templates-search">
          <input 
            type="text" 
            id="template-search" 
            placeholder="Search templates..." 
            value="${searchQuery}"
            class="template-search-input"
            aria-label="Search session templates"
          >
        </div>

        <div class="templates-categories">
          ${categories
            .map(
              (category) => `
            <button 
              class="category-btn ${currentCategory === category.id ? 'active' : ''}"
              data-category="${category.id}"
              aria-pressed="${currentCategory === category.id}"
            >
              <span class="category-icon">${category.icon}</span>
              <span class="category-name">${category.name}</span>
            </button>
          `,
            )
            .join('')}
        </div>

        <div class="templates-grid">
          ${
            templates.length === 0
              ? `
            <div class="no-templates">
              <p>No templates found</p>
              <button class="clear-search-btn" onclick="clearSearch()">Clear search</button>
            </div>
          `
              : templates
                  .map(
                    (template) => `
              <div class="template-card" data-template-id="${template.id}">
                <div class="template-header">
                  <div class="template-icon">${template.icon}</div>
                  <div class="template-info">
                    <h4 class="template-name">${template.name}</h4>
                    <p class="template-description">${template.description}</p>
                  </div>
                </div>
                <div class="template-details">
                  <div class="template-duration">
                    <span class="duration-icon">⏱️</span>
                    <span class="duration-text">${template.duration} min</span>
                  </div>
                  <div class="template-type">
                    <span class="type-text">${template.type}</span>
                  </div>
                  ${
                    template.usage && template.usage > 0
                      ? `
                    <div class="template-usage">
                      <span class="usage-text">${template.usage} uses</span>
                    </div>
                  `
                      : ''
                  }
                  ${
                    template.isCustom
                      ? `
                    <button 
                      class="template-delete-btn" 
                      data-template-id="${template.id}"
                      aria-label="Delete ${template.name} template"
                      title="Delete template"
                    >
                      🗑️
                    </button>
                  `
                      : ''
                  }
                </div>
                <div class="template-tags">
                  ${template.tags
                    .slice(0, 2)
                    .map((tag) => `<span class="template-tag">${tag}</span>`)
                    .join('')}
                </div>
                <button 
                  class="template-select-btn" 
                  data-template-id="${template.id}"
                  aria-label="Select ${template.name} template"
                >
                  Start Session
                </button>
              </div>
            `,
                  )
                  .join('')
          }
        </div>

        <div class="templates-footer">
          <button class="custom-session-btn" id="custom-session-btn">
            <span>⚙️</span>
            Create Custom Session
          </button>
        </div>
      </div>
    `

    // Add event listeners
    addEventListeners()
  }

  function addEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('template-search')
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value
        renderTemplates()
      })
    }

    // Category buttons
    container.querySelectorAll('.category-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentCategory = btn.getAttribute('data-category')
        searchQuery = '' // Clear search when switching categories
        renderTemplates()
      })
    })

    // Template selection
    container.querySelectorAll('.template-select-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const templateId = btn.getAttribute('data-template-id')
        const template = getAllTemplates().find((t) => t.id === templateId)
        if (template && onTemplateSelect) {
          onTemplateSelect(template)
        }
      })
    })

    // Template deletion (for custom templates)
    container.querySelectorAll('.template-delete-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation() // Prevent template selection
        const templateId = btn.getAttribute('data-template-id')
        const template = getAllTemplates().find((t) => t.id === templateId)

        if (template && confirm(`Delete "${template.name}" template?`)) {
          if (deleteCustomTemplate(templateId)) {
            renderTemplates() // Refresh the display
          }
        }
      })
    })

    // Custom session button
    const customBtn = document.getElementById('custom-session-btn')
    if (customBtn) {
      customBtn.addEventListener('click', () => {
        if (onTemplateSelect) {
          onTemplateSelect(null) // null indicates custom session
        }
      })
    }
  }

  // Global function for clearing search (called from template)
  window.clearSearch = function () {
    searchQuery = ''
    currentCategory = 'popular'
    renderTemplates()
  }

  // Initial render
  renderTemplates()

  return {
    refresh: renderTemplates,
    setCategory: (categoryId) => {
      currentCategory = categoryId
      renderTemplates()
    },
    search: (query) => {
      searchQuery = query
      renderTemplates()
    },
  }
}

// Inject template styles
export function injectTemplateStyles() {
  if (document.getElementById('template-styles')) return

  const style = document.createElement('style')
  style.id = 'template-styles'
  style.textContent = `
    .session-templates {
      padding: var(--spacing-lg);
      background: var(--surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
    }

    .templates-header {
      text-align: center;
      margin-bottom: var(--spacing-lg);
    }

    .templates-header h3 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
      font-weight: 600;
    }

    .templates-header p {
      margin: 0;
      color: var(--text-muted);
      font-size: var(--text-sm);
    }

    .templates-search {
      margin-bottom: var(--spacing-lg);
    }

    .template-search-input {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: var(--text-sm);
      transition: border-color var(--transition-fast);
    }

    .template-search-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
    }

    .templates-categories {
      display: flex;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-lg);
      flex-wrap: wrap;
    }

    .category-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      background: var(--bg-secondary);
      color: var(--text-secondary);
      font-size: var(--text-xs);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .category-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-emphasis);
    }

    .category-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .category-icon {
      font-size: var(--text-sm);
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    .template-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: var(--spacing-md);
      transition: all var(--transition-fast);
      cursor: pointer;
    }

    .template-card:hover {
      border-color: var(--border-emphasis);
      box-shadow: var(--shadow-soft);
      transform: translateY(-1px);
    }

    .template-header {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
    }

    .template-icon {
      font-size: var(--text-2xl);
      flex-shrink: 0;
    }

    .template-info {
      flex: 1;
    }

    .template-name {
      margin: 0 0 var(--spacing-xs) 0;
      color: var(--text-primary);
      font-size: var(--text-base);
      font-weight: 600;
    }

    .template-description {
      margin: 0;
      color: var(--text-muted);
      font-size: var(--text-sm);
      line-height: 1.4;
    }

    .template-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-sm);
      flex-wrap: wrap;
      gap: var(--spacing-xs);
    }

    .template-duration {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    .template-type {
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      font-size: var(--text-xs);
      border-radius: var(--radius-sm);
    }

    .template-usage {
      padding: var(--spacing-xs) var(--spacing-sm);
      background: rgba(var(--sage-400-rgb), 0.1);
      color: var(--text-muted);
      font-size: var(--text-xs);
      border-radius: var(--radius-sm);
    }

    .template-tags {
      display: flex;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-md);
      flex-wrap: wrap;
    }

    .template-tag {
      padding: 2px var(--spacing-xs);
      background: rgba(var(--primary-rgb), 0.1);
      color: var(--primary);
      font-size: var(--text-xs);
      border-radius: var(--radius-sm);
    }

    .template-select-btn {
      width: 100%;
      padding: var(--spacing-sm);
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .template-select-btn:hover {
      background: var(--primary-hover);
    }

    .template-select-btn:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.3);
    }

    .no-templates {
      grid-column: 1 / -1;
      text-align: center;
      padding: var(--spacing-2xl);
      color: var(--text-muted);
    }

    .clear-search-btn {
      margin-top: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--accent);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .clear-search-btn:hover {
      background: var(--accent-hover);
    }

    .templates-footer {
      text-align: center;
      border-top: 1px solid var(--border-subtle);
      padding-top: var(--spacing-lg);
    }

    .custom-session-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-lg);
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .custom-session-btn:hover {
      background: var(--bg-secondary);
      border-color: var(--border-emphasis);
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .templates-grid {
        grid-template-columns: 1fr;
      }

      .templates-categories {
        justify-content: center;
      }

      .category-btn {
        flex: 1;
        justify-content: center;
        min-width: 0;
      }

      .category-name {
        display: none;
      }
    }
  `

  document.head.appendChild(style)
}
