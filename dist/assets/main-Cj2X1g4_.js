(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(s){if(s.ep)return;s.ep=!0;const a=t(s);fetch(s.href,a)}})();async function B(i){const e=await fetch("/api/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)});if(!e.ok){const t=await e.text();throw console.error("API error:",t),new Error("Failed to save your session")}return e.json()}class q{constructor(){this.audioContext=null,this.soundEnabled=localStorage.getItem("kairo-sound-enabled")!=="false",this.browserNotificationsEnabled=!1,this.initializeBrowserNotifications()}async initializeBrowserNotifications(){"Notification"in window&&(Notification.permission==="granted"?this.browserNotificationsEnabled=!0:Notification.permission!=="denied"&&(this.browserNotificationsEnabled=!1))}async requestNotificationPermission(){if("Notification"in window&&Notification.permission==="default"){const e=await Notification.requestPermission();return this.browserNotificationsEnabled=e==="granted",e==="granted"}return this.browserNotificationsEnabled}async createTimerSound(e="completion"){if(this.soundEnabled)try{this.audioContext||(this.audioContext=new(window.AudioContext||window.webkitAudioContext));const t=this.audioContext,n=t.createOscillator(),s=t.createGain();n.connect(s),s.connect(t.destination),e==="completion"?(n.frequency.setValueAtTime(800,t.currentTime),n.frequency.exponentialRampToValueAtTime(400,t.currentTime+.5)):e==="start"?n.frequency.setValueAtTime(400,t.currentTime):e==="pause"&&n.frequency.setValueAtTime(600,t.currentTime),n.type="sine",s.gain.setValueAtTime(0,t.currentTime),s.gain.linearRampToValueAtTime(.1,t.currentTime+.1),s.gain.exponentialRampToValueAtTime(.01,t.currentTime+.8),n.start(t.currentTime),n.stop(t.currentTime+.8)}catch(t){console.warn("Could not play sound:",t)}}showBrowserNotification(e,t,n={}){if(!this.browserNotificationsEnabled||!("Notification"in window))return null;try{const s=new Notification(e,{body:t,icon:"/vite.svg",badge:"/vite.svg",silent:!0,requireInteraction:!1,...n});return setTimeout(()=>{s.close()},5e3),s}catch(s){return console.warn("Could not show notification:",s),null}}async notifySessionComplete(e,t){await this.createTimerSound("completion");const n=`Your ${t} minute ${e.toLowerCase()} session is complete!`;this.showBrowserNotification("🎯 Kairo - Session Complete",n,{tag:"session-complete"})}async notifySessionStart(e,t){await this.createTimerSound("start")}async notifySessionPause(){await this.createTimerSound("pause")}async notifySessionReminder(){this.browserNotificationsEnabled&&this.showBrowserNotification("⏰ Kairo Reminder","Ready for another focus session?",{tag:"session-reminder",requireInteraction:!1,actions:[{action:"start",title:"Start Session"},{action:"later",title:"Later"}]})}async notifyBreakSuggestion(e){if(!this.browserNotificationsEnabled)return;const t=e%4===0?"Long Break (15-30 min)":"Short Break (5 min)";this.showBrowserNotification("☕ Time for a Break",`Consider taking a ${t} to recharge`,{tag:"break-suggestion",requireInteraction:!1})}async notifySessionMilestone(e){if(!this.browserNotificationsEnabled)return;let t="";if(e===7)t="One week streak! Amazing consistency 🌟";else if(e===30)t="One month streak! You're building incredible habits 🚀";else if(e%10===0)t=`${e} day streak! Keep up the momentum 🔥`;else return;this.showBrowserNotification("🎉 Milestone Achieved!",t,{tag:"milestone",requireInteraction:!0})}setSoundEnabled(e){this.soundEnabled=e,localStorage.setItem("kairo-sound-enabled",String(e))}getSoundEnabled(){return this.soundEnabled}getBrowserNotificationsEnabled(){return this.browserNotificationsEnabled}}const w=new q;class z{constructor(){this.activeMessages=new Map,this.injectStyles()}showMessage(e,t,n="info",s=3e3){const a=this.generateId();this.clearElementMessages(e);const o=this.createMessage(t,n);return o.setAttribute("data-feedback-id",a),this.findMessageContainer(e).appendChild(o),this.activeMessages.set(a,o),requestAnimationFrame(()=>{o.classList.add("feedback-show")}),s>0&&setTimeout(()=>{this.dismissMessage(a)},s),a}showStatus(e,t="info"){if((t==="success"||t==="error")&&"Notification"in window&&Notification.permission==="granted"){const s=t==="success"?"✅":"❌";new Notification(`${s} Kairo`,{body:e,silent:!0,tag:"kairo-status"})}const n=document.createElement("div");n.className=`feedback-status feedback-${t}`,n.textContent=e,n.setAttribute("role","status"),n.setAttribute("aria-live","polite"),document.body.appendChild(n),requestAnimationFrame(()=>{n.classList.add("feedback-show")}),setTimeout(()=>{n.classList.remove("feedback-show"),setTimeout(()=>{n.parentNode&&n.parentNode.removeChild(n)},300)},2e3)}showConfirmation(e,t,n="Confirm",s="Cancel"){return new Promise(a=>{const o=document.createElement("div");o.className="feedback-modal-overlay",o.innerHTML=`
        <div class="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
          <div class="feedback-modal-header">
            <h3 id="feedback-modal-title">${e}</h3>
          </div>
          <div class="feedback-modal-body">
            <p>${t}</p>
          </div>
          <div class="feedback-modal-actions">
            <button class="feedback-btn feedback-btn-danger" id="feedback-confirm-btn">${n}</button>
            <button class="feedback-btn feedback-btn-secondary" id="feedback-cancel-btn">${s}</button>
          </div>
        </div>
      `,document.body.appendChild(o),setTimeout(()=>{document.getElementById("feedback-cancel-btn").focus()},0),document.getElementById("feedback-confirm-btn").onclick=()=>{o.parentNode&&o.parentNode.removeChild(o),a(!0)},document.getElementById("feedback-cancel-btn").onclick=()=>{o.parentNode&&o.parentNode.removeChild(o),a(!1)},o.addEventListener("keydown",r=>{r.key==="Escape"&&(o.parentNode&&o.parentNode.removeChild(o),a(!1))}),o.addEventListener("click",r=>{r.target===o&&(o.parentNode&&o.parentNode.removeChild(o),a(!1))})})}createMessage(e,t){const n=document.createElement("div");n.className=`feedback-message feedback-${t}`,n.setAttribute("role","status"),n.setAttribute("aria-live","polite");const s=this.getTypeIcon(t);return n.innerHTML=`
      <span class="feedback-icon" aria-hidden="true">${s}</span>
      <span class="feedback-text">${e}</span>
    `,n}findMessageContainer(e){let t=e.closest(".timer-content, .history-section, .settings-modal");return t||(t=document.createElement("div"),t.className="feedback-container",e.parentNode.insertBefore(t,e.nextSibling)),t}clearElementMessages(e){this.findMessageContainer(e).querySelectorAll(".feedback-message").forEach(s=>{const a=s.getAttribute("data-feedback-id");a&&this.dismissMessage(a)})}dismissMessage(e){const t=this.activeMessages.get(e);t&&(t.classList.remove("feedback-show"),setTimeout(()=>{t.parentNode&&t.parentNode.removeChild(t),this.activeMessages.delete(e)},300))}getTypeIcon(e){const t={info:"ℹ️",success:"✅",error:"❌",warning:"⚠️",timer:"⏱️",save:"💾"};return t[e]||t.info}generateId(){return`feedback-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}injectStyles(){if(document.getElementById("feedback-styles"))return;const e=document.createElement("style");e.id="feedback-styles",e.textContent=`
      .feedback-message {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm) var(--spacing-md);
        margin: var(--spacing-sm) 0;
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: 500;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-left: 3px solid;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .feedback-message.feedback-show {
        opacity: 1;
        transform: translateY(0);
      }

      .feedback-message.feedback-info {
        border-left-color: var(--primary);
        color: var(--text-primary);
      }

      .feedback-message.feedback-success {
        border-left-color: #10b981;
        color: #10b981;
      }

      .feedback-message.feedback-error {
        border-left-color: #ef4444;
        color: #ef4444;
      }

      .feedback-message.feedback-warning {
        border-left-color: #f59e0b;
        color: #f59e0b;
      }

      .feedback-message.feedback-timer {
        border-left-color: var(--accent);
        color: var(--accent);
      }

      .feedback-message.feedback-save {
        border-left-color: #8b5cf6;
        color: #8b5cf6;
      }

      .feedback-icon {
        font-size: var(--text-sm);
        opacity: 0.8;
      }

      .feedback-text {
        flex: 1;
      }

      .feedback-status {
        position: fixed;
        bottom: var(--spacing-lg);
        right: var(--spacing-lg);
        padding: var(--spacing-md) var(--spacing-lg);
        border-radius: var(--radius-lg);
        font-size: var(--text-sm);
        font-weight: 600;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1000;
        max-width: 300px;
        box-shadow: var(--shadow-intense);
        backdrop-filter: blur(20px);
      }

      .feedback-status.feedback-show {
        opacity: 1;
        transform: translateX(0);
      }

      .feedback-status.feedback-info {
        background: rgba(79, 86, 79, 0.9);
        color: white;
      }

      .feedback-status.feedback-success {
        background: rgba(16, 185, 129, 0.9);
        color: white;
      }

      .feedback-status.feedback-error {
        background: rgba(239, 68, 68, 0.9);
        color: white;
      }

      .feedback-container {
        margin: var(--spacing-sm) 0;
      }

      /* Dark mode adjustments */
      [data-theme='dark'] .feedback-message {
        background: rgba(0, 0, 0, 0.3);
        border-color: rgba(255, 255, 255, 0.1);
      }

      /* Responsive design */
      @media (max-width: 640px) {
        .feedback-status {
          bottom: var(--spacing-md);
          right: var(--spacing-md);
          left: var(--spacing-md);
          max-width: none;
        }
      }

      /* Accessibility */
      @media (prefers-reduced-motion: reduce) {
        .feedback-message,
        .feedback-status {
          transition: opacity 0.2s ease;
          transform: none;
        }

        .feedback-message.feedback-show,
        .feedback-status.feedback-show {
          transform: none;
        }
      }

      /* Confirmation Modal Styles */
      .feedback-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.2s ease-out;
      }

      /* Dark mode gets a stronger overlay */
      [data-theme='dark'] .feedback-modal-overlay {
        background: rgba(0, 0, 0, 0.75);
      }

      .feedback-modal {
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 0;
        min-width: 320px;
        max-width: 90vw;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .feedback-modal-header {
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--border);
      }

      .feedback-modal-header h3 {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--text-primary);
      }

      .feedback-modal-body {
        padding: var(--spacing-lg);
      }

      .feedback-modal-body p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .feedback-modal-actions {
        padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg);
        display: flex;
        gap: var(--spacing-sm);
        justify-content: flex-end;
      }

      .feedback-btn {
        padding: var(--spacing-sm) var(--spacing-md);
        border: none;
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 80px;
      }

      .feedback-btn-danger {
        background: #ef4444;
        color: white;
      }

      .feedback-btn-danger:hover {
        background: #dc2626;
      }

      .feedback-btn-secondary {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border);
      }

      .feedback-btn-secondary:hover {
        background: var(--bg-tertiary);
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideIn {
        from { 
          opacity: 0; 
          transform: scale(0.95) translateY(-10px); 
        }
        to { 
          opacity: 1; 
          transform: scale(1) translateY(0); 
        }
      }
    `,document.head.appendChild(e)}}const T=new z,re=(i,e,t,n)=>T.showConfirmation(i,e,t,n),S={info:i=>T.showStatus(i,"info"),success:i=>T.showStatus(i,"success"),error:i=>T.showStatus(i,"error"),warning:i=>T.showStatus(i,"warning"),timer:i=>T.showStatus(i,"timer"),save:i=>T.showStatus(i,"success"),delete:i=>T.showStatus(i,"success")};class O{constructor(){this.streakKey="kairo-session-streak",this.statsKey="kairo-session-stats"}getStreakData(){const e={currentStreak:0,longestStreak:0,lastSessionDate:null,totalSessions:0};try{const t=localStorage.getItem(this.streakKey);return t?{...e,...JSON.parse(t)}:e}catch(t){return console.warn("Could not load streak data:",t),e}}recordSessionCompletion(e=new Date){const t=this.getStreakData(),n=this.formatDate(e),s=t.lastSessionDate;if(s!==n){if(s===null)t.currentStreak=1;else{const a=new Date(s),o=new Date(n),r=Math.floor((o-a)/(1e3*60*60*24));r===1?t.currentStreak+=1:r>1&&(t.currentStreak=1)}t.lastSessionDate=n,t.currentStreak>t.longestStreak&&(t.longestStreak=t.currentStreak)}return t.totalSessions+=1,this.saveStreakData(t),t}checkStreakStatus(){const e=this.getStreakData();if(!e.lastSessionDate)return e;const t=this.formatDate(new Date),n=e.lastSessionDate,s=new Date(n),a=new Date(t);return Math.floor((a-s)/(1e3*60*60*24))>1&&(e.currentStreak=0,this.saveStreakData(e)),e}getSessionStats(){const e={today:0,thisWeek:0,thisMonth:0,byType:{}};try{const t=localStorage.getItem(this.statsKey);return t?{...e,...JSON.parse(t)}:e}catch(t){return console.warn("Could not load session stats:",t),e}}recordSessionStats(e,t=new Date){const n=this.getSessionStats(),s=this.formatDate(t),a=this.formatDate(new Date);return s===a&&(n.today+=1),this.isWithinDays(t,7)&&(n.thisWeek+=1),this.isWithinDays(t,30)&&(n.thisMonth+=1),n.byType[e]||(n.byType[e]=0),n.byType[e]+=1,this.saveSessionStats(n),n}async recalculateAnalytics(e){const t={currentStreak:0,longestStreak:0,lastSessionDate:null,totalSessions:0},n={today:0,thisWeek:0,thisMonth:0,byType:{}};if(!e||e.length===0)return this.saveStreakData(t),this.saveSessionStats(n),{streakData:t,stats:n};const s=e.sort((l,u)=>new Date(l.createdAt)-new Date(u.createdAt));let a=0,o=0,r=0,v=null;const c=new Set;s.forEach(l=>{const u=this.formatDate(new Date(l.createdAt));c.add(u)});const d=Array.from(c).sort();for(let l=0;l<d.length;l++){const u=d[l];if(l===0)r=1;else{const f=new Date(d[l-1]),p=new Date(u);Math.floor((p-f)/(1e3*60*60*24))===1?r+=1:r=1}r>o&&(o=r),v=u}if(d.length>0){const l=this.formatDate(new Date),u=d[d.length-1];if(Math.floor((new Date(l)-new Date(u))/(1e3*60*60*24))<=1){a=1;for(let p=d.length-2;p>=0;p--){const h=new Date(d[p+1]),y=new Date(d[p]);if(Math.floor((h-y)/(1e3*60*60*24))===1)a+=1;else break}}}const m={currentStreak:a,longestStreak:o,lastSessionDate:v,totalSessions:e.length},g={...n},x=new Date;return e.forEach(l=>{const u=new Date(l.createdAt),f=l.type;this.formatDate(u)===this.formatDate(x)&&(g.today+=1),this.isWithinDays(u,7)&&(g.thisWeek+=1),this.isWithinDays(u,30)&&(g.thisMonth+=1),g.byType[f]||(g.byType[f]=0),g.byType[f]+=1}),this.saveStreakData(m),this.saveSessionStats(g),{streakData:m,stats:g}}formatDate(e){return e.toISOString().split("T")[0]}isWithinDays(e,t){const s=Math.abs(new Date-e);return Math.ceil(s/(1e3*60*60*24))<=t}saveStreakData(e){try{localStorage.setItem(this.streakKey,JSON.stringify(e))}catch(t){console.warn("Could not save streak data:",t)}}saveSessionStats(e){try{localStorage.setItem(this.statsKey,JSON.stringify(e))}catch(t){console.warn("Could not save session stats:",t)}}getStreakMessage(e){return e.currentStreak===0?"Start your focus streak today! 🌟":e.currentStreak===1?"Great start! Keep the momentum going 🔥":e.currentStreak<7?`${e.currentStreak} day streak! You're building a habit 💪`:e.currentStreak<30?`Amazing ${e.currentStreak} day streak! You're on fire 🔥`:`Incredible ${e.currentStreak} day streak! You're a focus master! 🏆`}}const C=new O,j=(i,e)=>{const t=C.recordSessionCompletion(e),n=C.recordSessionStats(i,e);return{streakData:t,stats:n}},A=()=>C.checkStreakStatus(),P=()=>C.getSessionStats(),R=i=>C.getStreakMessage(i),ce=i=>C.recalculateAnalytics(i),M={FOCUS:{id:"Focus",name:"Focus",icon:"🎯",emoji:"○",defaultDuration:25,description:"Standard focused work session",color:"#4f564f",bgColor:"rgba(79, 86, 79, 0.1)"},DEEP_WORK:{id:"Deep Work",name:"Deep Work",icon:"🧠",emoji:"●",defaultDuration:90,description:"Extended deep focus session",color:"#6366f1",bgColor:"rgba(99, 102, 241, 0.1)"},BREAK:{id:"Break",name:"Break",icon:"☕",emoji:"◐",defaultDuration:5,description:"Short rest and recharge",color:"#10b981",bgColor:"rgba(16, 185, 129, 0.1)"},CREATIVE:{id:"Creative",name:"Creative",icon:"🎨",emoji:"◑",defaultDuration:45,description:"Brainstorming and creative work",color:"#f59e0b",bgColor:"rgba(245, 158, 11, 0.1)"},LEARNING:{id:"Learning",name:"Learning",icon:"📚",emoji:"◒",defaultDuration:30,description:"Study and skill development",color:"#8b5cf6",bgColor:"rgba(139, 92, 246, 0.1)"}},H=[{id:"energized",label:"Energized",icon:"⚡",color:"#f59e0b"},{id:"focused",label:"Focused",icon:"🎯",color:"#6366f1"},{id:"calm",label:"Calm",icon:"🧘",color:"#10b981"},{id:"scattered",label:"Scattered",icon:"🌪️",color:"#ef4444"},{id:"motivated",label:"Motivated",icon:"🔥",color:"#f97316"},{id:"tired",label:"Tired",icon:"😴",color:"#6b7280"}],Y=[{label:"5 min",value:5,type:"quick"},{label:"15 min",value:15,type:"short"},{label:"25 min",value:25,type:"standard"},{label:"45 min",value:45,type:"extended"},{label:"90 min",value:90,type:"deep"},{label:"Custom",value:null,type:"custom"}];function L(i){return Object.values(M).find(e=>e.id===i)||M.FOCUS}function W(i,e=!1){const t=L(i);return e?t.emoji:t.icon}function K(i){return L(i).defaultDuration}function F(i){console.log("startTimer called",i);let e=0,t,n=null,s=null,a=null,o=!1;function r(l){const u=String(Math.floor(l/60)).padStart(2,"0"),f=String(l%60).padStart(2,"0");return`${u}:${f}`}function v(){const l=A(),u=R(l);i.innerHTML=`
      <div class="timer-content">
        ${l.currentStreak>0?`
          <div class="streak-display" role="status" aria-live="polite">
            <div class="streak-counter">🔥 ${l.currentStreak} day streak</div>
            <div class="streak-message">${u}</div>
          </div>
        `:""}
        <div class="timer-settings">
          <div class="setting-group">
            <label class="setting-label" for="timer-minutes">Duration (min)</label>
            <div class="duration-controls">
              <div class="duration-presets">
                ${Y.map(b=>`
                  <button 
                    type="button" 
                    class="duration-preset-btn" 
                    data-duration="${b.value}" 
                    aria-label="${b.label} session"
                    ${b.value===25?'data-selected="true"':""}
                  >
                    ${b.label}
                  </button>
                `).join("")}
              </div>
              <input 
                id="timer-minutes" 
                type="number" 
                min="1" 
                max="120" 
                value="25" 
                class="setting-input duration-input" 
                aria-label="Session duration in minutes"
                placeholder="Custom"
              >
            </div>
          </div>
          
          <div class="setting-group">
            <label class="setting-label" for="timer-type">Session Type</label>
            <select 
              id="timer-type" 
              class="setting-input"
              style="width: 140px;"
              aria-label="Select focus session type"
            >
              ${Object.values(M).map(b=>`
                <option value="${b.id}">${b.icon} ${b.name}</option>
              `).join("")}
            </select>
          </div>
        </div>
        <div class="timer-circle" role="timer" aria-live="polite">
          <div class="timer-display" id="timer-display" aria-label="Timer display">25:00</div>
          <div class="timer-label">Ready to Begin</div>
        </div>
        <div class="timer-controls">
          <button id="start-btn" class="control-btn primary" aria-describedby="start-help">
            Start Session
          </button>
          <div id="start-help" class="sr-only">Begin your focus session</div>
        </div>
      </div>
    `;const f=document.getElementById("timer-minutes"),p=document.getElementById("timer-type"),h=document.getElementById("timer-display"),y=document.querySelectorAll(".duration-preset-btn");f.addEventListener("input",()=>{const b=parseInt(f.value,10)||25;h.textContent=r(b*60),y.forEach(E=>E.removeAttribute("data-selected"));const k=[...y].find(E=>parseInt(E.getAttribute("data-duration"))===b);k&&k.setAttribute("data-selected","true")}),y.forEach(b=>{b.addEventListener("click",()=>{const k=b.getAttribute("data-duration");k&&k!=="null"?(f.value=k,h.textContent=r(parseInt(k)*60),y.forEach(E=>E.removeAttribute("data-selected")),b.setAttribute("data-selected","true")):(f.focus(),f.select())})}),p.addEventListener("change",()=>{const b=p.value,k=K(b);f.value=k,h.textContent=r(k*60),y.forEach($=>$.removeAttribute("data-selected"));const E=[...y].find($=>parseInt($.getAttribute("data-duration"))===k);E&&E.setAttribute("data-selected","true")}),document.getElementById("start-btn").onclick=c}async function c(){console.log("startSession called");const l=parseInt(document.getElementById("timer-minutes").value,10)||25;t=document.getElementById("timer-type").value,e=l*60,o=!1,n=new Date,await w.requestNotificationPermission(),await w.notifySessionStart(t,l),window.sessionNotesManager&&window.sessionNotesManager.onSessionStart(),i.innerHTML=`
      <div class="timer-content">
        <div class="timer-circle active" role="timer" aria-live="polite">
          <div class="timer-progress">
            <svg class="progress-ring" width="280" height="280">
              <circle
                class="progress-ring-circle"
                stroke="rgba(79, 86, 79, 0.2)"
                stroke-width="3"
                fill="transparent"
                r="135"
                cx="140"
                cy="140"
              />
              <circle
                class="progress-ring-progress"
                stroke="var(--primary)"
                stroke-width="3"
                fill="transparent"
                r="135"
                cx="140"
                cy="140"
                style="--progress: 0"
              />
            </svg>
          </div>
          <div class="timer-display" id="timer-display">${r(e)}</div>
          <div class="timer-label">${t} Session</div>
        </div>
        <div class="timer-controls">
          <button id="pause-btn" class="control-btn" aria-describedby="pause-help">
            Pause
          </button>
          <button id="stop-btn" class="control-btn" aria-describedby="stop-help">
            Stop
          </button>
          <div id="pause-help" class="sr-only">Pause the current session</div>
          <div id="stop-help" class="sr-only">Stop and end the current session</div>
        </div>
      </div>
    `;const u=e;a=setInterval(()=>{if(!o&&e>0){e--;const h=document.getElementById("timer-display"),y=document.querySelector(".progress-ring-progress");if(h&&(h.textContent=r(e)),y){const b=(u-e)/u*100;y.style.setProperty("--progress",b)}e===0&&d(!0)}},1e3);const f=document.getElementById("pause-btn"),p=document.getElementById("stop-btn");f.onclick=async()=>{o=!o,f.textContent=o?"Resume":"Pause";const h=document.querySelector(".timer-circle");o?(h.classList.remove("active"),await w.notifySessionPause()):h.classList.add("active"),S.info(o?"Session paused":"Session resumed")},p.onclick=()=>d(!1),S.timer(`${t} session started (${l} min)`,"timer")}function d(l){if(console.log("endSession called, completed:",l),a&&(clearInterval(a),a=null),s=new Date,window.sessionNotesManager&&window.sessionNotesManager.onSessionEnd(),l){const u=Math.max(1,Math.round((s-n)/6e4));w.notifySessionComplete(t,u),m()}else{i.innerHTML=`
        <div class="timer-content">
          <div class="timer-circle" role="timer" aria-live="polite">
            <div class="timer-display">—</div>
            <div class="timer-label">Stopped</div>
          </div>
          <div class="timer-controls">
            <button id="new-session-btn" class="control-btn primary">
              New Session
            </button>
          </div>
        </div>
      `,document.getElementById("new-session-btn").onclick=v,S.info("Session stopped before completion. Not saved.");const u=document.createElement("div");u.setAttribute("aria-live","assertive"),u.className="sr-only",u.textContent=`${t} session stopped`,document.body.appendChild(u),setTimeout(()=>{u.parentNode&&u.parentNode.removeChild(u)},3e3)}}v();function m(){console.log("showRefectionModal called"),x();const l=window.sessionNotesManager?window.sessionNotesManager.onSessionSave():"";i.innerHTML=`
      <div id="reflectionModal" class="reflection-modal" role="dialog" aria-labelledby="reflection-title" aria-describedby="reflection-description">
        <div class="reflection-header">
          <h3 id="reflection-title">🎯 Session Complete!</h3>
          <p id="reflection-description">How was your session? Share your thoughts and mood.</p>
        </div>
        
        ${l?`
        <div class="session-notes-summary">
          <div class="notes-summary-header">
            <span class="notes-icon">📝</span>
            <span class="notes-title">Your Session Notes</span>
          </div>
          <div class="notes-summary-content">
            <div class="notes-text">${l}</div>
          </div>
        </div>
        `:""}
        
        <div class="mood-selector-group">
          <label class="mood-label">How did this session feel?</label>
          <div class="mood-options" role="radiogroup" aria-labelledby="mood-label">
            ${H.map(p=>`
              <button 
                type="button" 
                class="mood-btn" 
                data-mood="${p.id}"
                aria-label="${p.label}"
                title="${p.label}"
                style="--mood-color: ${p.color}"
              >
                <span class="mood-icon">${p.icon}</span>
                <span class="mood-text">${p.label}</span>
              </button>
            `).join("")}
          </div>
        </div>
        
        <div class="reflection-input-group">
          <label for="reflection-text">💭 Your Reflection</label>
          <input 
            type="text" 
            placeholder="What went well? Any insights or challenges?" 
            id="reflection-text" 
            class="reflection-input"
            aria-describedby="reflection-help"
            maxlength="500"
          >
          <div id="reflection-help" class="sr-only">Optional: Share your thoughts about this session (maximum 500 characters)</div>
        </div>
        <div class="reflection-actions" role="group" aria-label="Session completion actions">
          <button 
            id="saveButton" 
            type="button" 
            class="btn btn-primary"
            aria-describedby="save-help"
          >
            <span aria-hidden="true">💾</span>
            Save Session
          </button>
          <button 
            id="dontSaveButton" 
            type="button" 
            class="btn btn-secondary"
            aria-describedby="skip-help"
          >
            <span aria-hidden="true">❌</span>
            Skip & Continue
          </button>
          <div id="save-help" class="sr-only">Save this session with your reflection to your history</div>
          <div id="skip-help" class="sr-only">Skip saving and continue without recording this session</div>
        </div>
      </div>
      `,console.log("Modal HTML rendered:",document.getElementById("reflectionModal"));let u=null;const f=document.querySelectorAll(".mood-btn");f.forEach(p=>{p.addEventListener("click",()=>{f.forEach(h=>h.classList.remove("selected")),p.classList.add("selected"),u=p.getAttribute("data-mood"),f.forEach(h=>h.setAttribute("aria-checked","false")),p.setAttribute("aria-checked","true")})}),document.getElementById("saveButton").onclick=()=>g(u),document.getElementById("dontSaveButton").onclick=()=>{S.info("Session skipped. Ready for your next focus session!"),v()},document.getElementById("reflection-text").focus()}async function g(l=null){const u=document.getElementById("saveButton"),f=document.getElementById("reflection-text").value,p=window.sessionNotesManager?window.sessionNotesManager.onSessionSave():"";u.disabled=!0,u.textContent="💾 Saving...";const y={duration:Math.max(1,Math.round((s-n)/6e4)),type:t,reflection:f,notes:p,mood:l,startTime:n.toISOString(),endTime:s.toISOString()};try{await B(y);const{streakData:b}=j(t,s);window.sessionNotesManager&&window.sessionNotesManager.cleanup(),b.currentStreak>1?S.save(`Session saved! 🔥 ${b.currentStreak} day streak!`):S.save("Session saved successfully! Your progress has been recorded."),setTimeout(()=>{v(),N&&typeof N.refresh=="function"&&N.refresh(),D&&typeof D.refresh=="function"&&D.refresh()},1e3)}catch{S.error("Failed to save session. Please check your connection and try again."),u.disabled=!1,u.innerHTML="<span>💾</span>Save Session"}}function x(){if(document.getElementById("reflection-modal-style"))return;const l=document.createElement("style");l.id="reflection-modal-style",l.textContent=`
      .reflection-modal {
        background: var(--surface-glass);
        backdrop-filter: var(--glass-backdrop);
        border: var(--glass-border);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        max-width: 500px;
        margin: 0 auto;
        box-shadow: var(--shadow-intense);
        position: relative;
        overflow: hidden;
        text-align: center;
      }
      
      .reflection-modal::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--secondary-gradient);
        opacity: 0.8;
      }
      
      .reflection-header {
        margin-bottom: var(--spacing-lg);
      }
      
      .reflection-header h3 {
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: var(--spacing-xs);
        background: var(--secondary-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .reflection-header p {
        color: var(--text-secondary);
        font-size: 1rem;
        margin: 0;
      }
      
      .session-notes-summary {
        background: var(--surface-subtle);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
        text-align: left;
      }
      
      .notes-summary-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        margin-bottom: var(--spacing-sm);
      }
      
      .notes-summary-header .notes-icon {
        color: var(--text-secondary);
        font-size: 1rem;
      }
      
      .notes-summary-header .notes-title {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .notes-summary-content {
        background: var(--surface-glass);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        padding: var(--spacing-sm);
      }
      
      .notes-text {
        color: var(--text-primary);
        font-size: 0.95rem;
        line-height: 1.5;
        white-space: pre-wrap;
        word-wrap: break-word;
        max-height: 80px;
        overflow-y: auto;
      }
      
      .mood-selector-group {
        margin-bottom: var(--spacing-lg);
        text-align: left;
      }
      
      .mood-label {
        display: block;
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--spacing-sm);
      }
      
      .mood-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--spacing-xs);
        margin-bottom: var(--spacing-md);
      }
      
      .mood-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        font-family: inherit;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .mood-btn:hover {
        background: rgba(var(--mood-color), 0.1);
        border-color: rgba(var(--mood-color), 0.3);
        color: var(--text-primary);
        transform: translateY(-1px);
      }
      
      .mood-btn.selected {
        background: rgba(var(--mood-color), 0.15);
        border-color: rgba(var(--mood-color), 0.5);
        color: var(--text-primary);
        box-shadow: 0 0 10px rgba(var(--mood-color), 0.3);
      }
      
      .mood-btn:focus {
        outline: 2px solid rgba(79, 172, 254, 0.5);
        outline-offset: 2px;
      }
      
      .mood-icon {
        font-size: 1.2rem;
        display: block;
      }
      
      .mood-text {
        font-weight: 500;
        font-size: 0.75rem;
        text-align: center;
      }
      
      .reflection-input-group {
        margin-bottom: var(--spacing-lg);
        text-align: left;
      }
      
      .reflection-input-group label {
        display: block;
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--spacing-xs);
      }
      
      .reflection-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        border: var(--glass-border);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        color: var(--text-primary);
        font-family: inherit;
        font-size: 1rem;
        backdrop-filter: var(--glass-backdrop);
        transition: all 0.3s ease;
        box-sizing: border-box;
      }
      
      .reflection-input:focus {
        outline: none;
        border: 1px solid rgba(79, 172, 254, 0.5);
        background: rgba(79, 172, 254, 0.1);
        box-shadow: 0 0 20px rgba(79, 172, 254, 0.2);
      }
      
      .reflection-input::placeholder {
        color: var(--text-muted);
        font-style: italic;
      }
      
      .reflection-feedback {
        min-height: 1.5em;
        margin-bottom: var(--spacing-md);
        font-weight: 500;
        font-size: 0.95rem;
      }
      
      .reflection-actions {
        display: flex;
        gap: var(--spacing-sm);
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .reflection-actions .btn {
        min-width: 140px;
        flex: 1;
        max-width: 200px;
      }
      
      @media (max-width: 480px) {
        .reflection-modal {
          margin: var(--spacing-sm);
          padding: var(--spacing-lg);
        }
        
        .reflection-actions {
          flex-direction: column;
        }
        
        .reflection-actions .btn {
          width: 100%;
          max-width: none;
        }
      }
    `,document.head.appendChild(l)}}const V="modulepreload",_=function(i){return"/"+i},I={},U=function(e,t,n){let s=Promise.resolve();if(t&&t.length>0){let o=function(c){return Promise.all(c.map(d=>Promise.resolve(d).then(m=>({status:"fulfilled",value:m}),m=>({status:"rejected",reason:m}))))};document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),v=(r==null?void 0:r.nonce)||(r==null?void 0:r.getAttribute("nonce"));s=o(t.map(c=>{if(c=_(c),c in I)return;I[c]=!0;const d=c.endsWith(".css"),m=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${m}`))return;const g=document.createElement("link");if(g.rel=d?"stylesheet":V,d||(g.as="script"),g.crossOrigin="",g.href=c,v&&g.setAttribute("nonce",v),document.head.appendChild(g),d)return new Promise((x,l)=>{g.addEventListener("load",x),g.addEventListener("error",()=>l(new Error(`Unable to preload CSS for ${c}`)))})}))}function a(o){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=o,window.dispatchEvent(r),!r.defaultPrevented)throw o}return s.then(o=>{for(const r of o||[])r.status==="rejected"&&a(r.reason);return e().catch(a)})};async function J(){try{const i=await fetch("/api/sessions");if(!i.ok)throw new Error(`HTTP error! status: ${i.status}`);return await i.json()}catch(i){console.warn("API not available, using localStorage fallback:",i.message);const e=localStorage.getItem("kairo-sessions");return e?JSON.parse(e):[]}}function G(i){async function e(){i.innerHTML='<div class="loading">Loading recent sessions...</div>';try{const a=await J();if(!a.length){i.innerHTML=`
          <div class="quick-summary-empty">
            <div class="empty-icon">⏱️</div>
            <div class="empty-title">No sessions yet</div>
            <div class="empty-subtitle">Start your first focus session</div>
          </div>
        `;return}const o=a.slice(0,5);i.innerHTML=`
        <div class="quick-summary-list" role="list" aria-label="Recent sessions">
          ${o.map((c,d)=>`
              <div class="quick-summary-item" role="listitem" data-session-id="${c._id}">
                <div class="summary-icon">${W(c.type)}</div>
                <div class="summary-content">
                  <div class="summary-type">${c.type}</div>
                  <div class="summary-meta">
                    <span class="summary-duration">${c.duration}m</span>
                    <span class="summary-date">${t(c.startTime)}</span>
                  </div>
                </div>
                ${c.notes||c.reflection?`
                  <div class="summary-indicator" title="Has notes or reflection">
                    <span class="indicator-dot"></span>
                  </div>
                `:""}
              </div>
            `).join("")}
        </div>
        <div class="quick-summary-footer">
          <button class="view-all-btn" type="button">
            <span class="view-all-icon">📊</span>
            <span class="view-all-text">View All Sessions</span>
          </button>
        </div>
      `,i.querySelector(".view-all-btn").addEventListener("click",()=>{n()}),i.querySelectorAll(".quick-summary-item").forEach(c=>{c.addEventListener("click",()=>{const d=c.dataset.sessionId;s(d)})})}catch(a){console.error("Error loading quick summary:",a),i.innerHTML=`
        <div class="quick-summary-error">
          <div class="error-icon">⚠️</div>
          <div class="error-message">Failed to load sessions</div>
          <button class="retry-btn" onclick="showQuickSummary()">Retry</button>
        </div>
      `}}function t(a){const o=new Date(a),v=new Date-o,c=Math.floor(v/(1e3*60*60*24));return c===0?"Today":c===1?"Yesterday":c<7?`${c}d ago`:c<30?`${Math.floor(c/7)}w ago`:o.toLocaleDateString(void 0,{month:"short",day:"numeric"})}function n(){S.info("Opening detailed session history...");const a=document.createElement("div");if(a.className="detailed-history-modal",a.innerHTML=`
      <div class="modal-backdrop">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Session History</h2>
            <button class="modal-close" type="button" aria-label="Close detailed history">&times;</button>
          </div>
          <div class="modal-body" id="detailed-history-container">
            <div class="loading-detailed">
              <div class="loading-spinner"></div>
              <p>Loading detailed history...</p>
            </div>
          </div>
        </div>
      </div>
    `,document.body.appendChild(a),!document.getElementById("detailed-history-modal-styles")){const d=document.createElement("style");d.id="detailed-history-modal-styles",d.textContent=`
        .loading-detailed {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
          gap: var(--spacing-md);
          color: var(--text-muted);
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-subtle);
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `,document.head.appendChild(d)}const o=a.querySelector(".modal-close"),r=a.querySelector(".modal-backdrop"),v=()=>{a.remove()};o.addEventListener("click",v),r.addEventListener("click",d=>{d.target===r&&v()});const c=d=>{d.key==="Escape"&&(v(),document.removeEventListener("keydown",c))};document.addEventListener("keydown",c),U(async()=>{const{createDetailedSessionHistory:d}=await import("./sessionHistoryDetailed-jV2qc2WI.js");return{createDetailedSessionHistory:d}},[]).then(({createDetailedSessionHistory:d})=>{const m=a.querySelector("#detailed-history-container");try{const g=d(m);console.log("Detailed history loaded successfully:",g),setTimeout(()=>{const x=a.querySelector("button, select, input, [tabindex]");x&&x.focus()},100)}catch(g){console.error("Error loading detailed history:",g),m.innerHTML=`
            <div class="error-message" style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">
              <div style="font-size: 2rem; margin-bottom: var(--spacing-md);">⚠️</div>
              <h3 style="margin-bottom: var(--spacing-sm); color: var(--text-secondary);">Failed to load detailed history</h3>
              <p style="margin-bottom: var(--spacing-md);">There was an error loading your session history.</p>
              <button onclick="location.reload()" style="padding: var(--spacing-sm) var(--spacing-md); background: var(--primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer;">Refresh Page</button>
            </div>
          `}}).catch(d=>{console.error("Error importing detailed history module:",d);const m=a.querySelector("#detailed-history-container");m.innerHTML=`
        <div class="error-message" style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: var(--spacing-md);">⚠️</div>
          <h3 style="margin-bottom: var(--spacing-sm); color: var(--text-secondary);">Module loading failed</h3>
          <p style="margin-bottom: var(--spacing-md);">Could not load the detailed history component.</p>
          <button onclick="location.reload()" style="padding: var(--spacing-sm) var(--spacing-md); background: var(--primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer;">Refresh Page</button>
        </div>
      `})}function s(a){S.info(`Opening session ${a.slice(-8)}...`)}return e(),{refresh:e,showDetailed:n}}function Q(i){function e(){const n=P(),s=A();t(n.byType);const a=Object.values(n.byType).reduce((o,r)=>o+r,0);i.innerHTML=`
      <div class="analytics-dashboard">
        <div class="analytics-header">
          <h3>📊 Your Insights</h3>
          <p>Track your focus patterns and progress</p>
        </div>
        
        <div class="analytics-grid">
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <div class="stat-number">${s.currentStreak}</div>
              <div class="stat-label">Day Streak</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <div class="stat-number">${n.thisWeek}</div>
              <div class="stat-label">This Week</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-number">${a}</div>
              <div class="stat-label">Total Sessions</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-number">${s.longestStreak}</div>
              <div class="stat-label">Best Streak</div>
            </div>
          </div>
        </div>
        
        ${a>0?`
          <div class="session-breakdown">
            <h4>Session Types</h4>
            <div class="session-types-chart">
              ${Object.entries(n.byType).map(([o,r])=>{const v=r/a*100,c=Object.values(M).find(d=>d.id===o);return`
                  <div class="session-type-item">
                    <span class="session-type-info">
                      <span class="session-type-icon">${c?c.icon:"○"}</span>
                      <span class="session-type-name">${o}</span>
                    </span>
                    <div class="session-type-bar">
                      <div class="session-type-progress" style="width: ${v}%; background-color: ${c?c.color:"#6b7280"}"></div>
                    </div>
                    <span class="session-type-count">${r}</span>
                  </div>
                `}).join("")}
            </div>
          </div>
        `:`
          <div class="empty-analytics">
            <p>Complete your first session to see insights!</p>
          </div>
        `}
      </div>
    `}function t(n){return Object.keys(n).length===0?null:Object.entries(n).reduce((s,a)=>s[1]>a[1]?s:a)[0]}return e(),{refresh:e}}function X(){if(document.getElementById("analytics-styles"))return;const i=document.createElement("style");i.id="analytics-styles",i.textContent=`
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
  `,document.head.appendChild(i)}function Z(){const i=localStorage.getItem("kairo-theme");i&&document.body.setAttribute("data-theme",i==="dark"?"dark":"")}function ee(){const i=document.body.getAttribute("data-theme")==="dark",e=i?"":"dark";document.body.setAttribute("data-theme",e);const t=document.createElement("div");return t.setAttribute("aria-live","polite"),t.className="sr-only",t.textContent=`Switched to ${i?"light":"dark"} mode`,document.body.appendChild(t),setTimeout(()=>{t.parentNode&&t.parentNode.removeChild(t)},2e3),localStorage.setItem("kairo-theme",e||"light"),!i}function te(){function i(){const s=document.querySelector(".settings-modal-overlay");s&&s.remove();const a=document.createElement("div");a.className="settings-modal-overlay",a.innerHTML=`
      <div class="settings-modal" role="dialog" aria-labelledby="settings-title" aria-modal="true">
        <div class="settings-header">
          <h3 id="settings-title">⚙️ Settings</h3>
          <button class="settings-close" aria-label="Close settings">&times;</button>
        </div>
        
        <div class="settings-content">
          <div class="setting-section">
            <h4>🔔 Notifications</h4>
            <div class="setting-item">
              <label class="setting-toggle">
                <input 
                  type="checkbox" 
                  id="browser-notifications" 
                  ${w.getBrowserNotificationsEnabled()?"checked":""}
                >
                <span class="toggle-slider"></span>
                <span class="setting-label">Browser notifications</span>
              </label>
              <p class="setting-description">Get notified when sessions complete</p>
            </div>
          </div>
          
          <div class="setting-section">
            <h4>🔊 Audio</h4>
            <div class="setting-item">
              <label class="setting-toggle">
                <input 
                  type="checkbox" 
                  id="sound-notifications" 
                  ${w.getSoundEnabled()?"checked":""}
                >
                <span class="toggle-slider"></span>
                <span class="setting-label">Sound effects</span>
              </label>
              <p class="setting-description">Play gentle sounds for session events</p>
            </div>
          </div>
          
          <div class="setting-section">
            <h4>🎨 Appearance</h4>
            <div class="setting-item">
              <label class="setting-toggle">
                <input 
                  type="checkbox" 
                  id="dark-mode" 
                  ${document.body.getAttribute("data-theme")==="dark"?"checked":""}
                >
                <span class="toggle-slider"></span>
                <span class="setting-label">Dark mode</span>
              </label>
              <p class="setting-description">Switch to dark theme</p>
            </div>
          </div>
          
          <div class="setting-section">
            <h4>📊 Data</h4>
            <div class="setting-item">
              <button class="setting-button export-btn" id="export-data">
                📄 Export Session Data
              </button>
              <p class="setting-description">Download your session history as CSV</p>
            </div>
            <div class="setting-item">
              <button class="setting-button danger-btn" id="clear-data">
                🗑️ Clear All Data
              </button>
              <p class="setting-description">Remove all local session data and stats</p>
            </div>
          </div>
        </div>
      </div>
    `,document.body.appendChild(a),e(a),setTimeout(()=>{a.querySelector(".settings-close").focus()},100)}function e(s){const a=s.querySelector(".settings-close"),o=s.querySelector("#browser-notifications"),r=s.querySelector("#sound-notifications"),v=s.querySelector("#dark-mode"),c=s.querySelector("#export-data"),d=s.querySelector("#clear-data");a.onclick=()=>s.remove(),s.onclick=m=>{m.target===s&&s.remove()},s.addEventListener("keydown",m=>{m.key==="Escape"&&s.remove()}),o.onchange=async()=>{o.checked&&(await w.requestNotificationPermission()||(o.checked=!1,alert("Please enable notifications in your browser settings to use this feature.")))},r.onchange=()=>{w.setSoundEnabled(r.checked),r.checked&&w.createTimerSound("completion")},v.onchange=()=>{ee()},c.onclick=()=>t(),d.onclick=()=>{confirm("Are you sure you want to clear all session data? This cannot be undone.")&&(n(),s.remove())}}async function t(){try{const a=await(await fetch("/api/sessions")).json(),o=`Date,Type,Duration (min),Notes,Reflection,Mood
`,r=a.map(m=>{const g=new Date(m.startTime).toLocaleDateString(),x=m.notes?`"${m.notes.replace(/"/g,'""')}"`:"",l=m.reflection?`"${m.reflection.replace(/"/g,'""')}"`:"",u=m.mood||"";return`${g},${m.type},${m.duration},${x},${l},${u}`}).join(`
`),v=new Blob([o+r],{type:"text/csv"}),c=URL.createObjectURL(v),d=document.createElement("a");d.href=c,d.download=`kairo-sessions-${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(c),w.showBrowserNotification("📄 Export Complete","Your session data has been downloaded")}catch(s){console.error("Export failed:",s),alert("Failed to export data. Please try again.")}}function n(){const s=[];for(let a=0;a<localStorage.length;a++){const o=localStorage.key(a);o&&o.startsWith("kairo-")&&s.push(o)}s.forEach(a=>localStorage.removeItem(a)),window.location.reload()}return{show:i}}function se(){const i=document.querySelector(".header");if(!i||i.querySelector(".settings-btn"))return;const e=document.createElement("button");e.className="settings-btn",e.innerHTML="⚙️",e.title="Settings",e.setAttribute("aria-label","Open settings");const t=te();e.onclick=t.show,i.appendChild(e)}function ae(){if(document.getElementById("settings-styles"))return;const i=document.createElement("style");i.id="settings-styles",i.textContent=`
    .settings-btn {
      background: var(--surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: var(--spacing-sm);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-size: var(--text-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
      height: 40px;
    }
    
    .settings-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-emphasis);
      color: var(--text-primary);
      transform: translateY(-1px);
      box-shadow: var(--shadow-soft);
    }
    
    .settings-btn:focus {
      outline: var(--focus-ring);
      outline-offset: var(--focus-ring-offset);
    }
    
    .settings-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--spacing-lg);
    }
    
    .settings-modal {
      background: var(--surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-intense);
      max-width: 500px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
    }
    
    .settings-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--border-subtle);
    }
    
    .settings-header h3 {
      font-family: 'Crimson Text', serif;
      font-size: var(--text-xl);
      color: var(--text-primary);
      margin: 0;
    }
    
    .settings-close {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: var(--text-xl);
      cursor: pointer;
      padding: var(--spacing-xs);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }
    
    .settings-close:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    
    .settings-content {
      padding: var(--spacing-lg);
    }
    
    .setting-section {
      margin-bottom: var(--spacing-xl);
    }
    
    .setting-section:last-child {
      margin-bottom: 0;
    }
    
    .setting-section h4 {
      font-family: 'Crimson Text', serif;
      font-size: var(--text-lg);
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: var(--spacing-xs);
    }
    
    .setting-item {
      margin-bottom: var(--spacing-lg);
    }
    
    .setting-item:last-child {
      margin-bottom: 0;
    }
    
    .setting-toggle {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      cursor: pointer;
      margin-bottom: var(--spacing-xs);
    }
    
    .setting-toggle input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
    
    .toggle-slider {
      width: 48px;
      height: 24px;
      background: var(--border-subtle);
      border-radius: 12px;
      position: relative;
      transition: background var(--transition-fast);
      flex-shrink: 0;
    }
    
    .toggle-slider::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform var(--transition-fast);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .setting-toggle input:checked + .toggle-slider {
      background: var(--primary);
    }
    
    .setting-toggle input:checked + .toggle-slider::before {
      transform: translateX(24px);
    }
    
    .setting-toggle input:focus + .toggle-slider {
      outline: var(--focus-ring);
      outline-offset: var(--focus-ring-offset);
    }
    
    .setting-label {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .setting-description {
      font-size: var(--text-sm);
      color: var(--text-muted);
      margin: 0;
      line-height: 1.4;
    }
    
    .setting-button {
      background: var(--surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: var(--spacing-sm) var(--spacing-md);
      color: var(--text-primary);
      font-family: inherit;
      font-size: var(--text-sm);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      margin-bottom: var(--spacing-xs);
    }
    
    .setting-button:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-emphasis);
      transform: translateY(-1px);
      box-shadow: var(--shadow-soft);
    }
    
    .setting-button:focus {
      outline: var(--focus-ring);
      outline-offset: var(--focus-ring-offset);
    }
    
    .setting-button.export-btn {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }
    
    .setting-button.export-btn:hover {
      background: var(--primary-hover);
      border-color: var(--primary-hover);
    }
    
    .setting-button.danger-btn {
      background: var(--error);
      border-color: var(--error);
      color: white;
    }
    
    .setting-button.danger-btn:hover {
      background: #dc2626;
      border-color: #dc2626;
    }
    
    /* Dark mode adjustments */
    [data-theme='dark'] .settings-modal {
      background: var(--surface-elevated);
    }
    
    [data-theme='dark'] .toggle-slider::before {
      background: var(--surface);
    }
    
    /* Mobile responsive */
    @media (max-width: 640px) {
      .settings-modal-overlay {
        padding: var(--spacing-sm);
      }
      
      .settings-modal {
        max-height: 90vh;
      }
      
      .settings-header, .settings-content {
        padding: var(--spacing-md);
      }
      
      .setting-section {
        margin-bottom: var(--spacing-lg);
      }
    }
  `,document.head.appendChild(i)}class ie{constructor(){this.notesContainer=null,this.notesTextarea=null,this.statusElement=null,this.isVisible=!1,this.saveTimeout=null}initialize(e){return e?(this.notesContainer=this.createNotesContainer(),e.appendChild(this.notesContainer),this.notesTextarea=this.notesContainer.querySelector(".session-notes-textarea"),this.statusElement=this.notesContainer.querySelector(".notes-status"),this.setupEventListeners(),!0):!1}createNotesContainer(){const e=document.createElement("div");return e.className="session-notes-container",e.innerHTML=`
      <div class="session-notes-header">
        <h3>Session Notes</h3>
        <div class="notes-status"></div>
      </div>
      <textarea 
        class="session-notes-textarea" 
        placeholder="Capture your thoughts, insights, or progress during this session..."
        rows="4"
      ></textarea>
      <div class="session-notes-actions">
        <button type="button" class="notes-clear-btn">Clear</button>
      </div>
    `,e}setupEventListeners(){this.notesTextarea&&this.notesTextarea.addEventListener("input",()=>{this.debouncedAutoSave()});const e=this.notesContainer.querySelector(".notes-clear-btn");e&&e.addEventListener("click",()=>{this.clearNotes()})}debouncedAutoSave(){clearTimeout(this.saveTimeout),this.updateSaveStatus("typing"),this.saveTimeout=setTimeout(()=>{this.updateSaveStatus("saved")},1e3)}updateSaveStatus(e){if(this.statusElement)switch(e){case"typing":this.statusElement.textContent="✏️ Typing...",this.statusElement.className="notes-status typing";break;case"saving":this.statusElement.textContent="💾 Saving...",this.statusElement.className="notes-status saving";break;case"saved":this.statusElement.textContent="✓ Saved",this.statusElement.className="notes-status saved";break;case"cleared":this.statusElement.textContent="🗑️ Cleared",this.statusElement.className="notes-status cleared";break;default:this.statusElement.textContent="",this.statusElement.className="notes-status"}}onSessionStart(){this.clearNotes(),this.showNotes()}onSessionEnd(){this.hideNotes()}showNotes(){this.notesContainer&&(this.notesContainer.style.display="block",this.isVisible=!0,this.notesTextarea&&this.notesTextarea.focus())}hideNotes(){this.notesContainer&&(this.notesContainer.style.display="none",this.isVisible=!1)}clearNotes(){this.notesTextarea&&(this.notesTextarea.value="",this.notesTextarea.focus(),this.updateSaveStatus("cleared"))}getNotes(){return this.notesTextarea?this.notesTextarea.value.trim():""}setNotes(e){this.notesTextarea&&(this.notesTextarea.value=e||"")}destroy(){this.notesContainer&&this.notesContainer.parentNode&&this.notesContainer.parentNode.removeChild(this.notesContainer),this.notesContainer=null,this.notesTextarea=null,this.statusElement=null,this.isVisible=!1,clearTimeout(this.saveTimeout)}}const ne=new ie,oe=ne;let N,D;document.addEventListener("DOMContentLoaded",()=>{const i=document.getElementById("app");i.innerHTML=`
    
    <header class="header" role="banner">
      <h1 class="logo">Kairo</h1>
    </header>
    
    <main class="main-content" role="main">
      <section class="timer-container" aria-labelledby="timer-heading">
        <div class="timer-header">
          <h2 id="timer-heading" class="timer-heading">Focus Timer</h2>
        </div>
        <div class="timer-content">
          <div id="timer" aria-live="polite" aria-atomic="false"></div>
        </div>
      </section>
      
      <div class="divider" aria-hidden="true"></div>
      
      <aside class="history-section" aria-labelledby="history-heading">
        <div class="history-header">
          <h2 id="history-heading" class="history-title">Session History</h2>
        </div>
        <div id="analytics" class="analytics-container"></div>
        <div id="history" aria-live="polite" aria-atomic="false"></div>
      </aside>
    </main>
  `,X(),ae(),Z(),F(document.getElementById("timer")),N=G(document.getElementById("history")),D=Q(document.getElementById("analytics")),se(),window.analyticsApi=D;const e=document.createElement("div");e.setAttribute("aria-live","polite"),e.setAttribute("aria-atomic","true"),e.className="sr-only",e.textContent="Kairo focus timer app loaded and ready to use. Japanese Zen minimalist design.",document.body.appendChild(e),setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},3e3),window.sessionNotesManager=oe,window.analyticsApi=D});export{J as f,W as g,ce as r,re as s,S as t};
