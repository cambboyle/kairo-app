import{f,t as g,g as S,s as D,r as T}from"./main-CmJOV7HD.js";function z(o){let u=[],i=[],n="all",m="date-desc";async function h(t){if(await D("Delete Session?","Are you sure you want to delete this session? This will remove it from your history and may affect your streak and analytics data. This action cannot be undone.","Delete","Cancel"))try{if(!(await fetch(`/api/sessions/${t}`,{method:"DELETE"})).ok)throw new Error("Failed to delete session");g.delete("Session deleted and removed from analytics");try{const r=await f();await T(r),window.analyticsApi&&typeof window.analyticsApi.refresh=="function"&&window.analyticsApi.refresh()}catch(r){console.warn("Could not update analytics after deletion:",r)}await c()}catch(e){console.error("Delete error:",e),g.error("Failed to delete session")}}async function c(){try{u=await f(),p(),v()}catch(t){console.error("Error loading sessions:",t),g.error("Failed to load session history")}}function p(){i=u.filter(t=>{if(n==="all")return!0;if(n==="this-week"){const s=new Date;return s.setDate(s.getDate()-7),new Date(t.startTime)>=s}if(n==="this-month"){const s=new Date;return s.setMonth(s.getMonth()-1),new Date(t.startTime)>=s}return t.type===n}),i.sort((t,s)=>{switch(m){case"date-desc":return new Date(s.startTime)-new Date(t.startTime);case"date-asc":return new Date(t.startTime)-new Date(s.startTime);case"duration-desc":return s.duration-t.duration;case"duration-asc":return t.duration-s.duration;case"type":return t.type.localeCompare(s.type);default:return 0}}),b()}function b(){const t=o.querySelector("#detailed-history-content")||o.querySelector(".detailed-history-content")||o;if(!i.length){t.innerHTML=`
        <div class="no-sessions">
          <div class="no-sessions-icon">📝</div>
          <h3>No sessions found</h3>
          <p>Try adjusting your filters or start a new focus session.</p>
        </div>
      `;return}const s=i.map((e,r)=>{const a=e.reflection&&e.reflection.trim(),d=e.notes&&e.notes.trim(),l=new Date(e.startTime),w=l.toLocaleDateString("en-US",{weekday:"short",year:"numeric",month:"short",day:"numeric"}),k=l.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});return`
        <div class="detailed-session-card" data-session-id="${e._id}">
          <div class="session-card-header">
            <div class="session-card-icon">
              ${S(e.type)}
            </div>
            <div class="session-card-meta">
              <h3 class="session-card-title">${e.type}</h3>
              <div class="session-card-datetime">
                <span class="session-date">${w}</span>
                <span class="session-time">${k}</span>
              </div>
            </div>
            <div class="session-card-duration">
              <span class="duration-value">${e.duration}</span>
              <span class="duration-unit">min</span>
            </div>
            <button class="session-delete-btn" data-session-id="${e._id}" title="Delete session">
              <span class="delete-icon">×</span>
            </button>
          </div>
          
          ${d||a?`
          <div class="session-card-content">
            ${d?`
            <div class="session-notes-section">
              <h4 class="section-title">
                <span class="section-icon">📝</span>
                Session Notes
              </h4>
              <div class="section-content notes-content">
                ${e.notes.replace(/\n/g,"<br>")}
              </div>
            </div>
            `:""}
            
            ${a?`
            <div class="session-reflection-section">
              <h4 class="section-title">
                <span class="section-icon">💭</span>
                Reflection
              </h4>
              <div class="section-content reflection-content">
                ${e.reflection}
              </div>
            </div>
            `:""}
          </div>
          `:""}
          
          ${e.mood?`
          <div class="session-card-footer">
            <div class="session-mood">
              <span class="mood-label">Mood:</span>
              <span class="mood-value">${e.mood}</span>
            </div>
          </div>
          `:""}
        </div>
      `}).join("");t.innerHTML=`
      <div class="detailed-sessions-grid">
        ${s}
      </div>
    `,t.querySelectorAll(".session-delete-btn").forEach(e=>{e.addEventListener("click",r=>{r.stopPropagation();const a=e.getAttribute("data-session-id");h(a)})})}function y(){o.innerHTML=`
      <div class="detailed-history-wrapper">
        <div class="detailed-history-controls">
          <div class="history-filters">
            <label for="session-filter" class="filter-label">Filter:</label>
            <select id="session-filter" class="filter-select">
              <option value="all">All Sessions</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="Focus">Focus Sessions</option>
              <option value="Deep Work">Deep Work</option>
              <option value="Break">Breaks</option>
            </select>
          </div>
          
          <div class="history-sort">
            <label for="session-sort" class="sort-label">Sort by:</label>
            <select id="session-sort" class="sort-select">
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="duration-desc">Longest First</option>
              <option value="duration-asc">Shortest First</option>
              <option value="type">Session Type</option>
            </select>
          </div>
          
          <div class="history-stats">
            <span class="stats-text">Loading...</span>
          </div>
        </div>
        
        <div class="detailed-history-content" id="detailed-history-content">
          <div class="loading">Loading sessions...</div>
        </div>
      </div>
    `;const t=o.querySelector("#session-filter"),s=o.querySelector("#session-sort");t&&t.addEventListener("change",e=>{n=e.target.value,p(),v()}),s&&s.addEventListener("change",e=>{m=e.target.value,p()}),c()}function v(){const t=o.querySelector(".stats-text");if(t){const s=i.reduce((d,l)=>d+l.duration,0),e=Math.floor(s/60),r=s%60;let a="";e>0?a=r>0?`${e}h ${r}m`:`${e}h`:a=`${s}m`,t.textContent=`${i.length} sessions • ${a} total`}}function x(){if(document.getElementById("detailed-history-styles"))return;const t=document.createElement("style");t.id="detailed-history-styles",t.textContent=`
      /* Detailed History Wrapper Styles */
      .detailed-history-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        max-width: 1000px;
        margin: 0 auto;
        background: var(--bg-primary);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }

      .detailed-history-controls {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        padding: var(--spacing-lg);
        background: linear-gradient(135deg, var(--surface) 0%, var(--bg-tertiary) 100%);
        border-bottom: 1px solid var(--border-subtle);
        flex-wrap: wrap;
      }

      .history-filters,
      .history-sort {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .filter-label,
      .sort-label {
        font-weight: 600;
        color: var(--text-secondary);
        font-size: var(--text-sm);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .filter-select,
      .sort-select {
        padding: var(--spacing-xs) var(--spacing-sm);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--surface);
        color: var(--text-primary);
        font-size: var(--text-sm);
        min-width: 140px;
        transition: all var(--transition-fast);
      }

      .filter-select:hover,
      .sort-select:hover {
        border-color: var(--border-emphasis);
        box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
      }

      .filter-select:focus,
      .sort-select:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
      }

      .history-stats {
        margin-left: auto;
        color: var(--text-muted);
        font-size: var(--text-sm);
        font-weight: 500;
        padding: var(--spacing-xs) var(--spacing-sm);
        background: var(--bg-tertiary);
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
      }

      .detailed-history-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-lg);
        scrollbar-width: thin;
        scrollbar-color: var(--border-subtle) transparent;
      }

      .detailed-history-content::-webkit-scrollbar {
        width: 6px;
      }

      .detailed-history-content::-webkit-scrollbar-track {
        background: transparent;
      }

      .detailed-history-content::-webkit-scrollbar-thumb {
        background: var(--border-subtle);
        border-radius: 3px;
      }

      .detailed-history-content::-webkit-scrollbar-thumb:hover {
        background: var(--border-emphasis);
      }

      .detailed-sessions-grid {
        display: grid;
        gap: var(--spacing-lg);
      }

      .detailed-session-card {
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        overflow: hidden;
        transition: all var(--transition-normal);
        position: relative;
        box-shadow: var(--shadow-soft);
      }

      .detailed-session-card:hover {
        box-shadow: var(--shadow-medium);
        border-color: var(--border-emphasis);
        transform: translateY(-2px);
      }

      .session-card-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-lg);
        position: relative;
        background: linear-gradient(135deg, var(--surface) 0%, var(--bg-tertiary) 100%);
      }

      .session-card-icon {
        font-size: var(--text-xl);
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-lighter);
        color: var(--primary);
        border-radius: var(--radius-lg);
        flex-shrink: 0;
        border: 2px solid rgba(var(--primary-rgb), 0.1);
      }

      .session-card-meta {
        flex: 1;
        min-width: 0;
      }

      .session-card-title {
        font-family: 'Crimson Text', serif;
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-xs) 0;
        letter-spacing: -0.01em;
      }

      .session-card-datetime {
        display: flex;
        gap: var(--spacing-sm);
        font-size: var(--text-sm);
        color: var(--text-muted);
        font-variant-numeric: tabular-nums;
      }

      .session-date::after {
        content: '•';
        margin-left: var(--spacing-xs);
        opacity: 0.5;
      }

      .session-card-duration {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: var(--spacing-sm);
        background: var(--bg-primary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        min-width: 60px;
      }

      .duration-value {
        font-size: var(--text-xl);
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }

      .duration-unit {
        font-size: var(--text-xs);
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: 500;
      }

      .session-delete-btn {
        position: absolute;
        top: var(--spacing-md);
        right: var(--spacing-md);
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        color: var(--text-muted);
        cursor: pointer;
        padding: var(--spacing-xs);
        border-radius: var(--radius-sm);
        font-size: var(--text-base);
        opacity: 0;
        transition: all var(--transition-fast);
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .detailed-session-card:hover .session-delete-btn {
        opacity: 1;
      }

      .session-delete-btn:hover {
        background: var(--error-light);
        border-color: var(--error);
        color: var(--error);
        transform: scale(1.1);
      }

      .session-card-content {
        padding: 0 var(--spacing-lg) var(--spacing-lg);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .session-notes-section,
      .session-reflection-section {
        background: var(--bg-primary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        transition: border-color var(--transition-fast);
      }

      .session-notes-section:hover,
      .session-reflection-section:hover {
        border-color: var(--border-emphasis);
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--text-secondary);
        margin: 0 0 var(--spacing-sm) 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .section-icon {
        font-size: var(--text-sm);
        opacity: 0.8;
      }

      .section-content {
        color: var(--text-primary);
        line-height: 1.6;
        font-size: var(--text-sm);
      }

      .notes-content {
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: 'Inter', sans-serif;
      }

      .reflection-content {
        font-style: italic;
        font-family: 'Crimson Text', serif;
        font-size: var(--text-base);
        line-height: 1.7;
      }

      .session-card-footer {
        padding: var(--spacing-sm) var(--spacing-lg);
        background: var(--bg-tertiary);
        border-top: 1px solid var(--border-subtle);
      }

      .session-mood {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-sm);
      }

      .mood-label {
        color: var(--text-muted);
        font-weight: 500;
      }

      .mood-value {
        color: var(--text-primary);
        font-weight: 600;
        padding: 2px var(--spacing-xs);
        background: var(--primary-lighter);
        border-radius: var(--radius-xs);
        font-size: var(--text-xs);
      }

      .no-sessions {
        text-align: center;
        padding: var(--spacing-4xl);
        color: var(--text-muted);
      }

      .no-sessions-icon {
        font-size: 4rem;
        margin-bottom: var(--spacing-lg);
        opacity: 0.5;
      }

      .no-sessions h3 {
        font-size: var(--text-xl);
        margin-bottom: var(--spacing-sm);
        color: var(--text-secondary);
        font-family: 'Crimson Text', serif;
      }

      .no-sessions p {
        font-size: var(--text-base);
        opacity: 0.8;
      }

      .loading {
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--text-muted);
        font-style: italic;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .detailed-history-controls {
          flex-direction: column;
          align-items: stretch;
          gap: var(--spacing-md);
        }

        .history-filters,
        .history-sort {
          justify-content: space-between;
        }

        .history-stats {
          margin-left: 0;
          text-align: center;
          order: -1;
        }

        .session-card-header {
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }

        .session-card-duration {
          order: -1;
          align-self: flex-start;
        }

        .session-delete-btn {
          position: static;
          opacity: 1;
          margin-left: auto;
        }
      }

      /* Dark Mode Adjustments */
      [data-theme='dark'] .detailed-history-wrapper {
        background: var(--stone-900);
      }

      [data-theme='dark'] .detailed-session-card {
        background: var(--stone-800);
        border-color: var(--stone-700);
      }

      [data-theme='dark'] .session-card-header {
        background: linear-gradient(135deg, var(--stone-800) 0%, var(--stone-700) 100%);
      }

      [data-theme='dark'] .session-card-icon {
        background: rgba(var(--sage-400-rgb), 0.15);
        color: var(--sage-400);
        border-color: rgba(var(--sage-400-rgb), 0.2);
      }

      [data-theme='dark'] .session-notes-section,
      [data-theme='dark'] .session-reflection-section {
        background: var(--stone-900);
        border-color: var(--stone-700);
      }
    `,document.head.appendChild(t)}return x(),y(),{refresh:c,updateStats:v}}export{z as createDetailedSessionHistory};
