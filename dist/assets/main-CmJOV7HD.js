(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(a){if(a.ep)return;a.ep=!0;const n=t(a);fetch(a.href,n)}})();async function B(i){const e=await fetch("/api/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)});if(!e.ok){const t=await e.text();throw console.error("API error:",t),new Error("Failed to save your session")}return e.json()}class q{constructor(){this.audioContext=null,this.soundEnabled=localStorage.getItem("kairo-sound-enabled")!=="false",this.browserNotificationsEnabled=!1,this.initializeBrowserNotifications()}async initializeBrowserNotifications(){"Notification"in window&&(Notification.permission==="granted"?this.browserNotificationsEnabled=!0:Notification.permission!=="denied"&&(this.browserNotificationsEnabled=!1))}async requestNotificationPermission(){if("Notification"in window&&Notification.permission==="default"){const e=await Notification.requestPermission();return this.browserNotificationsEnabled=e==="granted",e==="granted"}return this.browserNotificationsEnabled}async createTimerSound(e="completion"){if(this.soundEnabled)try{this.audioContext||(this.audioContext=new(window.AudioContext||window.webkitAudioContext));const t=this.audioContext,s=t.createOscillator(),a=t.createGain();s.connect(a),a.connect(t.destination),e==="completion"?(s.frequency.setValueAtTime(800,t.currentTime),s.frequency.exponentialRampToValueAtTime(400,t.currentTime+.5)):e==="start"?s.frequency.setValueAtTime(400,t.currentTime):e==="pause"&&s.frequency.setValueAtTime(600,t.currentTime),s.type="sine",a.gain.setValueAtTime(0,t.currentTime),a.gain.linearRampToValueAtTime(.1,t.currentTime+.1),a.gain.exponentialRampToValueAtTime(.01,t.currentTime+.8),s.start(t.currentTime),s.stop(t.currentTime+.8)}catch(t){console.warn("Could not play sound:",t)}}showBrowserNotification(e,t,s={}){if(!this.browserNotificationsEnabled||!("Notification"in window))return null;try{const a=new Notification(e,{body:t,icon:"/vite.svg",badge:"/vite.svg",silent:!0,requireInteraction:!1,...s});return setTimeout(()=>{a.close()},5e3),a}catch(a){return console.warn("Could not show notification:",a),null}}async notifySessionComplete(e,t){await this.createTimerSound("completion");const s=`Your ${t} minute ${e.toLowerCase()} session is complete!`;this.showBrowserNotification("🎯 Kairo - Session Complete",s,{tag:"session-complete"})}async notifySessionStart(e,t){await this.createTimerSound("start")}async notifySessionPause(){await this.createTimerSound("pause")}async notifySessionReminder(){this.browserNotificationsEnabled&&this.showBrowserNotification("⏰ Kairo Reminder","Ready for another focus session?",{tag:"session-reminder",requireInteraction:!1,actions:[{action:"start",title:"Start Session"},{action:"later",title:"Later"}]})}async notifyBreakSuggestion(e){if(!this.browserNotificationsEnabled)return;const t=e%4===0?"Long Break (15-30 min)":"Short Break (5 min)";this.showBrowserNotification("☕ Time for a Break",`Consider taking a ${t} to recharge`,{tag:"break-suggestion",requireInteraction:!1})}async notifySessionMilestone(e){if(!this.browserNotificationsEnabled)return;let t="";if(e===7)t="One week streak! Amazing consistency 🌟";else if(e===30)t="One month streak! You're building incredible habits 🚀";else if(e%10===0)t=`${e} day streak! Keep up the momentum 🔥`;else return;this.showBrowserNotification("🎉 Milestone Achieved!",t,{tag:"milestone",requireInteraction:!0})}setSoundEnabled(e){this.soundEnabled=e,localStorage.setItem("kairo-sound-enabled",String(e))}getSoundEnabled(){return this.soundEnabled}getBrowserNotificationsEnabled(){return this.browserNotificationsEnabled}}const S=new q;class z{constructor(){this.activeMessages=new Map,this.injectStyles()}showMessage(e,t,s="info",a=3e3){const n=this.generateId();this.clearElementMessages(e);const o=this.createMessage(t,s);return o.setAttribute("data-feedback-id",n),this.findMessageContainer(e).appendChild(o),this.activeMessages.set(n,o),requestAnimationFrame(()=>{o.classList.add("feedback-show")}),a>0&&setTimeout(()=>{this.dismissMessage(n)},a),n}showStatus(e,t="info"){if((t==="success"||t==="error")&&"Notification"in window&&Notification.permission==="granted"){const a=t==="success"?"✅":"❌";new Notification(`${a} Kairo`,{body:e,silent:!0,tag:"kairo-status"})}const s=document.createElement("div");s.className=`feedback-status feedback-${t}`,s.textContent=e,s.setAttribute("role","status"),s.setAttribute("aria-live","polite"),document.body.appendChild(s),requestAnimationFrame(()=>{s.classList.add("feedback-show")}),setTimeout(()=>{s.classList.remove("feedback-show"),setTimeout(()=>{s.parentNode&&s.parentNode.removeChild(s)},300)},2e3)}showConfirmation(e,t,s="Confirm",a="Cancel"){return new Promise(n=>{const o=document.createElement("div");o.className="feedback-modal-overlay",o.innerHTML=`
        <div class="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
          <div class="feedback-modal-header">
            <h3 id="feedback-modal-title">${e}</h3>
          </div>
          <div class="feedback-modal-body">
            <p>${t}</p>
          </div>
          <div class="feedback-modal-actions">
            <button class="feedback-btn feedback-btn-danger" id="feedback-confirm-btn">${s}</button>
            <button class="feedback-btn feedback-btn-secondary" id="feedback-cancel-btn">${a}</button>
          </div>
        </div>
      `,document.body.appendChild(o),setTimeout(()=>{document.getElementById("feedback-cancel-btn").focus()},0),document.getElementById("feedback-confirm-btn").onclick=()=>{o.parentNode&&o.parentNode.removeChild(o),n(!0)},document.getElementById("feedback-cancel-btn").onclick=()=>{o.parentNode&&o.parentNode.removeChild(o),n(!1)},o.addEventListener("keydown",c=>{c.key==="Escape"&&(o.parentNode&&o.parentNode.removeChild(o),n(!1))}),o.addEventListener("click",c=>{c.target===o&&(o.parentNode&&o.parentNode.removeChild(o),n(!1))})})}createMessage(e,t){const s=document.createElement("div");s.className=`feedback-message feedback-${t}`,s.setAttribute("role","status"),s.setAttribute("aria-live","polite");const a=this.getTypeIcon(t);return s.innerHTML=`
      <span class="feedback-icon" aria-hidden="true">${a}</span>
      <span class="feedback-text">${e}</span>
    `,s}findMessageContainer(e){let t=e.closest(".timer-content, .history-section, .settings-modal");return t||(t=document.createElement("div"),t.className="feedback-container",e.parentNode.insertBefore(t,e.nextSibling)),t}clearElementMessages(e){this.findMessageContainer(e).querySelectorAll(".feedback-message").forEach(a=>{const n=a.getAttribute("data-feedback-id");n&&this.dismissMessage(n)})}dismissMessage(e){const t=this.activeMessages.get(e);t&&(t.classList.remove("feedback-show"),setTimeout(()=>{t.parentNode&&t.parentNode.removeChild(t),this.activeMessages.delete(e)},300))}getTypeIcon(e){const t={info:"ℹ️",success:"✅",error:"❌",warning:"⚠️",timer:"⏱️",save:"💾"};return t[e]||t.info}generateId(){return`feedback-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}injectStyles(){if(document.getElementById("feedback-styles"))return;const e=document.createElement("style");e.id="feedback-styles",e.textContent=`
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
    `,document.head.appendChild(e)}}const T=new z,ie=(i,e,t,s)=>T.showConfirmation(i,e,t,s),w={info:i=>T.showStatus(i,"info"),success:i=>T.showStatus(i,"success"),error:i=>T.showStatus(i,"error"),warning:i=>T.showStatus(i,"warning"),timer:i=>T.showStatus(i,"timer"),save:i=>T.showStatus(i,"success"),delete:i=>T.showStatus(i,"success")};class O{constructor(){this.streakKey="kairo-session-streak",this.statsKey="kairo-session-stats"}getStreakData(){const e={currentStreak:0,longestStreak:0,lastSessionDate:null,totalSessions:0};try{const t=localStorage.getItem(this.streakKey);return t?{...e,...JSON.parse(t)}:e}catch(t){return console.warn("Could not load streak data:",t),e}}recordSessionCompletion(e=new Date){const t=this.getStreakData(),s=this.formatDate(e),a=t.lastSessionDate;if(a!==s){if(a===null)t.currentStreak=1;else{const n=new Date(a),o=new Date(s),c=Math.floor((o-n)/(1e3*60*60*24));c===1?t.currentStreak+=1:c>1&&(t.currentStreak=1)}t.lastSessionDate=s,t.currentStreak>t.longestStreak&&(t.longestStreak=t.currentStreak)}return t.totalSessions+=1,this.saveStreakData(t),t}checkStreakStatus(){const e=this.getStreakData();if(!e.lastSessionDate)return e;const t=this.formatDate(new Date),s=e.lastSessionDate,a=new Date(s),n=new Date(t);return Math.floor((n-a)/(1e3*60*60*24))>1&&(e.currentStreak=0,this.saveStreakData(e)),e}getSessionStats(){const e={today:0,thisWeek:0,thisMonth:0,byType:{}};try{const t=localStorage.getItem(this.statsKey);return t?{...e,...JSON.parse(t)}:e}catch(t){return console.warn("Could not load session stats:",t),e}}recordSessionStats(e,t=new Date){const s=this.getSessionStats(),a=this.formatDate(t),n=this.formatDate(new Date);return a===n&&(s.today+=1),this.isWithinDays(t,7)&&(s.thisWeek+=1),this.isWithinDays(t,30)&&(s.thisMonth+=1),s.byType[e]||(s.byType[e]=0),s.byType[e]+=1,this.saveSessionStats(s),s}async recalculateAnalytics(e){const t={currentStreak:0,longestStreak:0,lastSessionDate:null,totalSessions:0},s={today:0,thisWeek:0,thisMonth:0,byType:{}};if(!e||e.length===0)return this.saveStreakData(t),this.saveSessionStats(s),{streakData:t,stats:s};const a=e.sort((d,u)=>new Date(d.createdAt)-new Date(u.createdAt));let n=0,o=0,c=0,p=null;const l=new Set;a.forEach(d=>{const u=this.formatDate(new Date(d.createdAt));l.add(u)});const r=Array.from(l).sort();for(let d=0;d<r.length;d++){const u=r[d];if(d===0)c=1;else{const b=new Date(r[d-1]),f=new Date(u);Math.floor((f-b)/(1e3*60*60*24))===1?c+=1:c=1}c>o&&(o=c),p=u}if(r.length>0){const d=this.formatDate(new Date),u=r[r.length-1];if(Math.floor((new Date(d)-new Date(u))/(1e3*60*60*24))<=1){n=1;for(let f=r.length-2;f>=0;f--){const h=new Date(r[f+1]),y=new Date(r[f]);if(Math.floor((h-y)/(1e3*60*60*24))===1)n+=1;else break}}}const m={currentStreak:n,longestStreak:o,lastSessionDate:p,totalSessions:e.length},g={...s},x=new Date;return e.forEach(d=>{const u=new Date(d.createdAt),b=d.type;this.formatDate(u)===this.formatDate(x)&&(g.today+=1),this.isWithinDays(u,7)&&(g.thisWeek+=1),this.isWithinDays(u,30)&&(g.thisMonth+=1),g.byType[b]||(g.byType[b]=0),g.byType[b]+=1}),this.saveStreakData(m),this.saveSessionStats(g),{streakData:m,stats:g}}formatDate(e){return e.toISOString().split("T")[0]}isWithinDays(e,t){const a=Math.abs(new Date-e);return Math.ceil(a/(1e3*60*60*24))<=t}saveStreakData(e){try{localStorage.setItem(this.streakKey,JSON.stringify(e))}catch(t){console.warn("Could not save streak data:",t)}}saveSessionStats(e){try{localStorage.setItem(this.statsKey,JSON.stringify(e))}catch(t){console.warn("Could not save session stats:",t)}}getStreakMessage(e){return e.currentStreak===0?"Start your focus streak today! 🌟":e.currentStreak===1?"Great start! Keep the momentum going 🔥":e.currentStreak<7?`${e.currentStreak} day streak! You're building a habit 💪`:e.currentStreak<30?`Amazing ${e.currentStreak} day streak! You're on fire 🔥`:`Incredible ${e.currentStreak} day streak! You're a focus master! 🏆`}}const D=new O,j=(i,e)=>{const t=D.recordSessionCompletion(e),s=D.recordSessionStats(i,e);return{streakData:t,stats:s}},$=()=>D.checkStreakStatus(),P=()=>D.getSessionStats(),R=i=>D.getStreakMessage(i),re=i=>D.recalculateAnalytics(i),A={FOCUS:{id:"Focus",name:"Focus",icon:"🎯",emoji:"○",defaultDuration:25,description:"Standard focused work session",color:"#4f564f",bgColor:"rgba(79, 86, 79, 0.1)"},DEEP_WORK:{id:"Deep Work",name:"Deep Work",icon:"🧠",emoji:"●",defaultDuration:90,description:"Extended deep focus session",color:"#6366f1",bgColor:"rgba(99, 102, 241, 0.1)"},BREAK:{id:"Break",name:"Break",icon:"☕",emoji:"◐",defaultDuration:5,description:"Short rest and recharge",color:"#10b981",bgColor:"rgba(16, 185, 129, 0.1)"},CREATIVE:{id:"Creative",name:"Creative",icon:"🎨",emoji:"◑",defaultDuration:45,description:"Brainstorming and creative work",color:"#f59e0b",bgColor:"rgba(245, 158, 11, 0.1)"},LEARNING:{id:"Learning",name:"Learning",icon:"📚",emoji:"◒",defaultDuration:30,description:"Study and skill development",color:"#8b5cf6",bgColor:"rgba(139, 92, 246, 0.1)"}},H=[{id:"energized",label:"Energized",icon:"⚡",color:"#f59e0b"},{id:"focused",label:"Focused",icon:"🎯",color:"#6366f1"},{id:"calm",label:"Calm",icon:"🧘",color:"#10b981"},{id:"scattered",label:"Scattered",icon:"🌪️",color:"#ef4444"},{id:"motivated",label:"Motivated",icon:"🔥",color:"#f97316"},{id:"tired",label:"Tired",icon:"😴",color:"#6b7280"}],W=[{label:"5 min",value:5,type:"quick"},{label:"15 min",value:15,type:"short"},{label:"25 min",value:25,type:"standard"},{label:"45 min",value:45,type:"extended"},{label:"90 min",value:90,type:"deep"},{label:"Custom",value:null,type:"custom"}];function L(i){return Object.values(A).find(e=>e.id===i)||A.FOCUS}function K(i,e=!1){const t=L(i);return e?t.emoji:t.icon}function V(i){return L(i).defaultDuration}function F(i){console.log("startTimer called",i);let e=0,t,s=null,a=null,n=null,o=!1;function c(d){const u=String(Math.floor(d/60)).padStart(2,"0"),b=String(d%60).padStart(2,"0");return`${u}:${b}`}function p(){const d=$(),u=R(d);i.innerHTML=`
      <div class="timer-content">
        ${d.currentStreak>0?`
          <div class="streak-display" role="status" aria-live="polite">
            <div class="streak-counter">🔥 ${d.currentStreak} day streak</div>
            <div class="streak-message">${u}</div>
          </div>
        `:""}
        <div class="timer-settings">
          <div class="setting-group">
            <label class="setting-label" for="timer-minutes">Duration (min)</label>
            <div class="duration-controls">
              <div class="duration-presets">
                ${W.map(v=>`
                  <button 
                    type="button" 
                    class="duration-preset-btn" 
                    data-duration="${v.value}" 
                    aria-label="${v.label} session"
                    ${v.value===25?'data-selected="true"':""}
                  >
                    ${v.label}
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
              ${Object.values(A).map(v=>`
                <option value="${v.id}">${v.icon} ${v.name}</option>
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
    `;const b=document.getElementById("timer-minutes"),f=document.getElementById("timer-type"),h=document.getElementById("timer-display"),y=document.querySelectorAll(".duration-preset-btn");b.addEventListener("input",()=>{const v=parseInt(b.value,10)||25;h.textContent=c(v*60),y.forEach(C=>C.removeAttribute("data-selected"));const k=[...y].find(C=>parseInt(C.getAttribute("data-duration"))===v);k&&k.setAttribute("data-selected","true")}),y.forEach(v=>{v.addEventListener("click",()=>{const k=v.getAttribute("data-duration");k&&k!=="null"?(b.value=k,h.textContent=c(parseInt(k)*60),y.forEach(C=>C.removeAttribute("data-selected")),v.setAttribute("data-selected","true")):(b.focus(),b.select())})}),f.addEventListener("change",()=>{const v=f.value,k=V(v);b.value=k,h.textContent=c(k*60),y.forEach(I=>I.removeAttribute("data-selected"));const C=[...y].find(I=>parseInt(I.getAttribute("data-duration"))===k);C&&C.setAttribute("data-selected","true")}),document.getElementById("start-btn").onclick=l}async function l(){console.log("startSession called");const d=parseInt(document.getElementById("timer-minutes").value,10)||25;t=document.getElementById("timer-type").value,e=d*60,o=!1,s=new Date,await S.requestNotificationPermission(),await S.notifySessionStart(t,d),window.sessionNotesManager&&window.sessionNotesManager.onSessionStart(),i.innerHTML=`
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
          <div class="timer-display" id="timer-display">${c(e)}</div>
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
    `;const u=e;n=setInterval(()=>{if(!o&&e>0){e--;const h=document.getElementById("timer-display"),y=document.querySelector(".progress-ring-progress");if(h&&(h.textContent=c(e)),y){const v=(u-e)/u*100;y.style.setProperty("--progress",v)}e===0&&r(!0)}},1e3);const b=document.getElementById("pause-btn"),f=document.getElementById("stop-btn");b.onclick=async()=>{o=!o,b.textContent=o?"Resume":"Pause";const h=document.querySelector(".timer-circle");o?(h.classList.remove("active"),await S.notifySessionPause()):h.classList.add("active"),w.info(o?"Session paused":"Session resumed")},f.onclick=()=>r(!1),w.timer(`${t} session started (${d} min)`,"timer")}function r(d){if(console.log("endSession called, completed:",d),n&&(clearInterval(n),n=null),a=new Date,window.sessionNotesManager&&window.sessionNotesManager.onSessionEnd(),d){const u=Math.max(1,Math.round((a-s)/6e4));S.notifySessionComplete(t,u),m()}else{i.innerHTML=`
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
      `,document.getElementById("new-session-btn").onclick=p,w.info("Session stopped before completion. Not saved.");const u=document.createElement("div");u.setAttribute("aria-live","assertive"),u.className="sr-only",u.textContent=`${t} session stopped`,document.body.appendChild(u),setTimeout(()=>{u.parentNode&&u.parentNode.removeChild(u)},3e3)}}p();function m(){console.log("showRefectionModal called"),x();const d=window.sessionNotesManager?window.sessionNotesManager.onSessionSave():"";i.innerHTML=`
      <div id="reflectionModal" class="reflection-modal" role="dialog" aria-labelledby="reflection-title" aria-describedby="reflection-description">
        <div class="reflection-header">
          <h3 id="reflection-title">🎯 Session Complete!</h3>
          <p id="reflection-description">How was your session? Share your thoughts and mood.</p>
        </div>
        
        ${d?`
        <div class="session-notes-summary">
          <div class="notes-summary-header">
            <span class="notes-icon">📝</span>
            <span class="notes-title">Your Session Notes</span>
          </div>
          <div class="notes-summary-content">
            <div class="notes-text">${d}</div>
          </div>
        </div>
        `:""}
        
        <div class="mood-selector-group">
          <label class="mood-label">How did this session feel?</label>
          <div class="mood-options" role="radiogroup" aria-labelledby="mood-label">
            ${H.map(f=>`
              <button 
                type="button" 
                class="mood-btn" 
                data-mood="${f.id}"
                aria-label="${f.label}"
                title="${f.label}"
                style="--mood-color: ${f.color}"
              >
                <span class="mood-icon">${f.icon}</span>
                <span class="mood-text">${f.label}</span>
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
      `,console.log("Modal HTML rendered:",document.getElementById("reflectionModal"));let u=null;const b=document.querySelectorAll(".mood-btn");b.forEach(f=>{f.addEventListener("click",()=>{b.forEach(h=>h.classList.remove("selected")),f.classList.add("selected"),u=f.getAttribute("data-mood"),b.forEach(h=>h.setAttribute("aria-checked","false")),f.setAttribute("aria-checked","true")})}),document.getElementById("saveButton").onclick=()=>g(u),document.getElementById("dontSaveButton").onclick=()=>{w.info("Session skipped. Ready for your next focus session!"),p()},document.getElementById("reflection-text").focus()}async function g(d=null){const u=document.getElementById("saveButton"),b=document.getElementById("reflection-text").value,f=window.sessionNotesManager?window.sessionNotesManager.onSessionSave():"";u.disabled=!0,u.textContent="💾 Saving...";const y={duration:Math.max(1,Math.round((a-s)/6e4)),type:t,reflection:b,notes:f,mood:d,startTime:s.toISOString(),endTime:a.toISOString()};try{await B(y);const{streakData:v}=j(t,a);window.sessionNotesManager&&window.sessionNotesManager.cleanup(),v.currentStreak>1?w.save(`Session saved! 🔥 ${v.currentStreak} day streak!`):w.save("Session saved successfully! Your progress has been recorded."),setTimeout(()=>{p(),N&&typeof N.refresh=="function"&&N.refresh(),E&&typeof E.refresh=="function"&&E.refresh()},1e3)}catch{w.error("Failed to save session. Please check your connection and try again."),u.disabled=!1,u.innerHTML="<span>💾</span>Save Session"}}function x(){if(document.getElementById("reflection-modal-style"))return;const d=document.createElement("style");d.id="reflection-modal-style",d.textContent=`
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
    `,document.head.appendChild(d)}}const Y="modulepreload",U=function(i){return"/"+i},M={},_=function(e,t,s){let a=Promise.resolve();if(t&&t.length>0){let o=function(l){return Promise.all(l.map(r=>Promise.resolve(r).then(m=>({status:"fulfilled",value:m}),m=>({status:"rejected",reason:m}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),p=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));a=o(t.map(l=>{if(l=U(l),l in M)return;M[l]=!0;const r=l.endsWith(".css"),m=r?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${m}`))return;const g=document.createElement("link");if(g.rel=r?"stylesheet":Y,r||(g.as="script"),g.crossOrigin="",g.href=l,p&&g.setAttribute("nonce",p),document.head.appendChild(g),r)return new Promise((x,d)=>{g.addEventListener("load",x),g.addEventListener("error",()=>d(new Error(`Unable to preload CSS for ${l}`)))})}))}function n(o){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=o,window.dispatchEvent(c),!c.defaultPrevented)throw o}return a.then(o=>{for(const c of o||[])c.status==="rejected"&&n(c.reason);return e().catch(n)})};async function Q(){const i=await fetch("/api/sessions");if(!i.ok)throw new Error("Failed to fetch sessions");return i.json()}function G(i){async function e(){i.innerHTML='<div class="loading">Loading recent sessions...</div>';try{const n=await Q();if(!n.length){i.innerHTML=`
          <div class="quick-summary-empty">
            <div class="empty-icon">⏱️</div>
            <div class="empty-title">No sessions yet</div>
            <div class="empty-subtitle">Start your first focus session</div>
          </div>
        `;return}const o=n.slice(0,5);i.innerHTML=`
        <div class="quick-summary-list" role="list" aria-label="Recent sessions">
          ${o.map((l,r)=>`
              <div class="quick-summary-item" role="listitem" data-session-id="${l._id}">
                <div class="summary-icon">${K(l.type)}</div>
                <div class="summary-content">
                  <div class="summary-type">${l.type}</div>
                  <div class="summary-meta">
                    <span class="summary-duration">${l.duration}m</span>
                    <span class="summary-date">${t(l.startTime)}</span>
                  </div>
                </div>
                ${l.notes||l.reflection?`
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
      `,i.querySelector(".view-all-btn").addEventListener("click",()=>{s()}),i.querySelectorAll(".quick-summary-item").forEach(l=>{l.addEventListener("click",()=>{const r=l.dataset.sessionId;a(r)})})}catch(n){console.error("Error loading quick summary:",n),i.innerHTML=`
        <div class="quick-summary-error">
          <div class="error-icon">⚠️</div>
          <div class="error-message">Failed to load sessions</div>
          <button class="retry-btn" onclick="showQuickSummary()">Retry</button>
        </div>
      `}}function t(n){const o=new Date(n),p=new Date-o,l=Math.floor(p/(1e3*60*60*24));return l===0?"Today":l===1?"Yesterday":l<7?`${l}d ago`:l<30?`${Math.floor(l/7)}w ago`:o.toLocaleDateString(void 0,{month:"short",day:"numeric"})}function s(){w.info("Opening detailed session history...");const n=document.createElement("div");if(n.className="detailed-history-modal",n.innerHTML=`
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
    `,document.body.appendChild(n),!document.getElementById("detailed-history-modal-styles")){const r=document.createElement("style");r.id="detailed-history-modal-styles",r.textContent=`
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
      `,document.head.appendChild(r)}const o=n.querySelector(".modal-close"),c=n.querySelector(".modal-backdrop"),p=()=>{n.remove()};o.addEventListener("click",p),c.addEventListener("click",r=>{r.target===c&&p()});const l=r=>{r.key==="Escape"&&(p(),document.removeEventListener("keydown",l))};document.addEventListener("keydown",l),_(async()=>{const{createDetailedSessionHistory:r}=await import("./sessionHistoryDetailed-CGWQXBDu.js");return{createDetailedSessionHistory:r}},[]).then(({createDetailedSessionHistory:r})=>{const m=n.querySelector("#detailed-history-container");try{const g=r(m);console.log("Detailed history loaded successfully:",g),setTimeout(()=>{const x=n.querySelector("button, select, input, [tabindex]");x&&x.focus()},100)}catch(g){console.error("Error loading detailed history:",g),m.innerHTML=`
            <div class="error-message" style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">
              <div style="font-size: 2rem; margin-bottom: var(--spacing-md);">⚠️</div>
              <h3 style="margin-bottom: var(--spacing-sm); color: var(--text-secondary);">Failed to load detailed history</h3>
              <p style="margin-bottom: var(--spacing-md);">There was an error loading your session history.</p>
              <button onclick="location.reload()" style="padding: var(--spacing-sm) var(--spacing-md); background: var(--primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer;">Refresh Page</button>
            </div>
          `}}).catch(r=>{console.error("Error importing detailed history module:",r);const m=n.querySelector("#detailed-history-container");m.innerHTML=`
        <div class="error-message" style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: var(--spacing-md);">⚠️</div>
          <h3 style="margin-bottom: var(--spacing-sm); color: var(--text-secondary);">Module loading failed</h3>
          <p style="margin-bottom: var(--spacing-md);">Could not load the detailed history component.</p>
          <button onclick="location.reload()" style="padding: var(--spacing-sm) var(--spacing-md); background: var(--primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer;">Refresh Page</button>
        </div>
      `})}function a(n){w.info(`Opening session ${n.slice(-8)}...`)}return e(),{refresh:e,showDetailed:s}}function J(i){function e(){const s=P(),a=$();t(s.byType);const n=Object.values(s.byType).reduce((o,c)=>o+c,0);i.innerHTML=`
      <div class="analytics-dashboard">
        <div class="analytics-header">
          <h3>📊 Your Insights</h3>
          <p>Track your focus patterns and progress</p>
        </div>
        
        <div class="analytics-grid">
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <div class="stat-number">${a.currentStreak}</div>
              <div class="stat-label">Day Streak</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <div class="stat-number">${s.thisWeek}</div>
              <div class="stat-label">This Week</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-number">${n}</div>
              <div class="stat-label">Total Sessions</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-number">${a.longestStreak}</div>
              <div class="stat-label">Best Streak</div>
            </div>
          </div>
        </div>
        
        ${n>0?`
          <div class="session-breakdown">
            <h4>Session Types</h4>
            <div class="session-types-chart">
              ${Object.entries(s.byType).map(([o,c])=>{const p=c/n*100,l=Object.values(A).find(r=>r.id===o);return`
                  <div class="session-type-item">
                    <span class="session-type-info">
                      <span class="session-type-icon">${l?l.icon:"○"}</span>
                      <span class="session-type-name">${o}</span>
                    </span>
                    <div class="session-type-bar">
                      <div class="session-type-progress" style="width: ${p}%; background-color: ${l?l.color:"#6b7280"}"></div>
                    </div>
                    <span class="session-type-count">${c}</span>
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
    `}function t(s){return Object.keys(s).length===0?null:Object.entries(s).reduce((a,n)=>a[1]>n[1]?a:n)[0]}return e(),{refresh:e}}function X(){if(document.getElementById("analytics-styles"))return;const i=document.createElement("style");i.id="analytics-styles",i.textContent=`
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
  `,document.head.appendChild(i)}function Z(){const i=localStorage.getItem("kairo-theme");i&&document.body.setAttribute("data-theme",i==="dark"?"dark":"")}function ee(){const i=document.body.getAttribute("data-theme")==="dark",e=i?"":"dark";document.body.setAttribute("data-theme",e);const t=document.createElement("div");return t.setAttribute("aria-live","polite"),t.className="sr-only",t.textContent=`Switched to ${i?"light":"dark"} mode`,document.body.appendChild(t),setTimeout(()=>{t.parentNode&&t.parentNode.removeChild(t)},2e3),localStorage.setItem("kairo-theme",e||"light"),!i}function te(){function i(){const a=document.querySelector(".settings-modal-overlay");a&&a.remove();const n=document.createElement("div");n.className="settings-modal-overlay",n.innerHTML=`
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
                  ${S.getBrowserNotificationsEnabled()?"checked":""}
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
                  ${S.getSoundEnabled()?"checked":""}
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
    `,document.body.appendChild(n),e(n),setTimeout(()=>{n.querySelector(".settings-close").focus()},100)}function e(a){const n=a.querySelector(".settings-close"),o=a.querySelector("#browser-notifications"),c=a.querySelector("#sound-notifications"),p=a.querySelector("#dark-mode"),l=a.querySelector("#export-data"),r=a.querySelector("#clear-data");n.onclick=()=>a.remove(),a.onclick=m=>{m.target===a&&a.remove()},a.addEventListener("keydown",m=>{m.key==="Escape"&&a.remove()}),o.onchange=async()=>{o.checked&&(await S.requestNotificationPermission()||(o.checked=!1,alert("Please enable notifications in your browser settings to use this feature.")))},c.onchange=()=>{S.setSoundEnabled(c.checked),c.checked&&S.createTimerSound("completion")},p.onchange=()=>{ee()},l.onclick=()=>t(),r.onclick=()=>{confirm("Are you sure you want to clear all session data? This cannot be undone.")&&(s(),a.remove())}}async function t(){try{const n=await(await fetch("/api/sessions")).json(),o=`Date,Type,Duration (min),Notes,Reflection,Mood
`,c=n.map(m=>{const g=new Date(m.startTime).toLocaleDateString(),x=m.notes?`"${m.notes.replace(/"/g,'""')}"`:"",d=m.reflection?`"${m.reflection.replace(/"/g,'""')}"`:"",u=m.mood||"";return`${g},${m.type},${m.duration},${x},${d},${u}`}).join(`
`),p=new Blob([o+c],{type:"text/csv"}),l=URL.createObjectURL(p),r=document.createElement("a");r.href=l,r.download=`kairo-sessions-${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(l),S.showBrowserNotification("📄 Export Complete","Your session data has been downloaded")}catch(a){console.error("Export failed:",a),alert("Failed to export data. Please try again.")}}function s(){const a=[];for(let n=0;n<localStorage.length;n++){const o=localStorage.key(n);o&&o.startsWith("kairo-")&&a.push(o)}a.forEach(n=>localStorage.removeItem(n)),window.location.reload()}return{show:i}}function se(){const i=document.querySelector(".header");if(!i||i.querySelector(".settings-btn"))return;const e=document.createElement("button");e.className="settings-btn",e.innerHTML="⚙️",e.title="Settings",e.setAttribute("aria-label","Open settings");const t=te();e.onclick=t.show,i.appendChild(e)}function ae(){if(document.getElementById("settings-styles"))return;const i=document.createElement("style");i.id="settings-styles",i.textContent=`
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
  `,document.head.appendChild(i)}class ne{constructor(){this.notes="",this.isVisible=!1,this.notesContainer=null,this.initialized=!1,this.autoSaveTimeout=null,this.isTyping=!1,this.expandedMode=!1,this.templates=[{name:"Goals",icon:"🎯",content:`🎯 Session Goals:
• 

📝 Key Tasks:
• 

💡 Ideas:
• `},{name:"Progress",icon:"✅",content:`✅ Completed:
• 

🚧 In Progress:
• 

🔄 Next Steps:
• `},{name:"Learning",icon:"📚",content:`📚 What I Learned:
• 

❓ Questions:
• 

🔗 Resources:
• `},{name:"Reflection",icon:"💭",content:`💭 Thoughts:

🌟 Wins:

🎯 Focus Areas:

🔄 Improvements:`}]}init(){this.initialized||(this.createNotesInterface(),this.setupEventListeners(),this.setupKeyboardShortcuts(),this.initialized=!0)}ensureInitialized(){this.initialized||this.init()}createNotesInterface(){this.notesContainer=document.createElement("div"),this.notesContainer.className="enhanced-session-notes-container",this.notesContainer.style.display="none",this.notesContainer.innerHTML=`
      <div class="notes-header">
        <div class="notes-title-area">
          <span class="notes-icon">📝</span>
          <span class="notes-title">Session Notes</span>
          <div class="notes-status">
            <span class="word-count">0 words</span>
            <span class="save-status" title="Auto-saved">✓</span>
          </div>
        </div>
        <div class="notes-controls">
          <button class="notes-template-btn" title="Insert template" type="button">
            <span class="template-icon">📋</span>
          </button>
          <button class="notes-expand-btn" title="Expand notes" type="button">
            <span class="expand-icon">⛶</span>
          </button>
          <button class="notes-toggle-btn" title="Hide notes" type="button">
            <span class="toggle-icon">−</span>
          </button>
        </div>
      </div>
      
      <div class="notes-templates-dropdown" style="display: none;">
        <div class="templates-header">Quick Templates</div>
        <div class="templates-list">
          ${this.templates.map(e=>`
            <button class="template-option" data-template="${e.name}" type="button">
              <span class="template-emoji">${e.icon}</span>
              <span class="template-name">${e.name}</span>
            </button>
          `).join("")}
        </div>
      </div>

      <div class="notes-content">
        <div class="notes-editor">
          <textarea 
            class="session-notes-textarea" 
            placeholder="Start typing your thoughts, insights, or observations...&#10;&#10;💡 Tips:&#10;• Use Ctrl+B for **bold** text&#10;• Use Ctrl+I for *italic* text&#10;• Try templates for structured notes&#10;• Press Tab to access templates"
            aria-label="Session notes"
            rows="4"
            spellcheck="true"
          ></textarea>
          <div class="notes-formatting-toolbar">
            <div class="formatting-tools">
              <button class="format-btn" data-format="bold" title="Bold (Ctrl+B)" type="button">
                <strong>B</strong>
              </button>
              <button class="format-btn" data-format="italic" title="Italic (Ctrl+I)" type="button">
                <em>I</em>
              </button>
              <button class="format-btn" data-format="bullet" title="Add bullet point" type="button">•</button>
              <button class="format-btn" data-format="checkbox" title="Add checkbox" type="button">☐</button>
              <button class="format-btn" data-format="heading" title="Heading" type="button">H1</button>
            </div>
            <div class="quick-actions">
              <button class="quick-action-btn" data-action="timestamp" title="Insert timestamp" type="button">
                🕐
              </button>
              <button class="quick-action-btn" data-action="divider" title="Insert divider" type="button">
                ⎯
              </button>
              <button class="format-btn" data-format="arrow" title="Add arrow" type="button">→</button>
              <button class="format-btn" data-format="star" title="Add star" type="button">★</button>
            </div>
          </div>
        </div>
        
        <div class="notes-footer">
          <div class="typing-indicator" style="display: none;">
            <span class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
            <span class="typing-text">Typing...</span>
          </div>
          <div class="notes-hints">
            <span class="hint-text">Auto-saves every 2 seconds</span>
            <span class="hint-shortcut">Press Ctrl+B for bold, Tab for templates</span>
          </div>
          <div class="notes-actions">
            <button class="clear-notes-btn" title="Clear all notes" type="button">
              <span class="clear-icon">🗑️</span>
            </button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(this.notesContainer)}attachToTimer(){const e=document.querySelector(".timer-content");e&&this.notesContainer&&this.notesContainer.parentNode!==e&&e.appendChild(this.notesContainer)}setupEventListeners(){const e=this.notesContainer.querySelector(".session-notes-textarea"),t=this.notesContainer.querySelector(".notes-template-btn"),s=this.notesContainer.querySelector(".notes-expand-btn"),a=this.notesContainer.querySelector(".notes-toggle-btn"),n=this.notesContainer.querySelector(".clear-notes-btn"),o=this.notesContainer.querySelector(".notes-templates-dropdown");a.addEventListener("click",()=>{this.toggleVisibility()}),s.addEventListener("click",()=>{this.toggleExpandedMode()}),t.addEventListener("click",r=>{r.stopPropagation();const m=o.style.display!=="none";o.style.display=m?"none":"block"}),this.notesContainer.querySelectorAll(".template-option").forEach(r=>{r.addEventListener("click",()=>{const m=r.dataset.template;this.insertTemplate(m),o.style.display="none"})}),this.notesContainer.querySelectorAll(".format-btn").forEach(r=>{r.addEventListener("click",()=>{const m=r.dataset.format;this.applyFormatting(m)})}),this.notesContainer.querySelectorAll(".quick-action-btn").forEach(r=>{r.addEventListener("click",()=>{const m=r.dataset.action;this.performQuickAction(m)})}),n.addEventListener("click",()=>{this.clearNotesWithConfirmation()}),e.addEventListener("input",r=>{this.notes=r.target.value,this.handleTyping(),this.updateWordCount(),this.scheduleAutoSave()}),e.addEventListener("focus",()=>{this.notesContainer.classList.add("notes-focused")}),e.addEventListener("blur",()=>{this.notesContainer.classList.remove("notes-focused"),this.stopTyping()}),document.addEventListener("click",r=>{this.notesContainer.contains(r.target)||(o.style.display="none")})}setupKeyboardShortcuts(){this.notesContainer.querySelector(".session-notes-textarea").addEventListener("keydown",t=>{if((t.ctrlKey||t.metaKey)&&t.key==="b"&&(t.preventDefault(),this.applyFormatting("bold")),(t.ctrlKey||t.metaKey)&&t.key==="i"&&(t.preventDefault(),this.applyFormatting("italic")),t.ctrlKey&&t.key==="Enter"&&(t.preventDefault(),this.insertAtCursor("• ")),t.ctrlKey&&t.shiftKey&&t.key==="Enter"&&(t.preventDefault(),this.insertAtCursor("☐ ")),t.key==="Tab"){t.preventDefault();const s=this.notesContainer.querySelector(".notes-templates-dropdown");s.style.display!=="none"?(s.style.display="none",this.insertAtCursor("  ")):s.style.display="block"}})}insertAtCursor(e){const t=this.notesContainer.querySelector(".session-notes-textarea"),s=t.selectionStart,a=t.selectionEnd,n=t.value;t.value=n.substring(0,s)+e+n.substring(a),t.selectionStart=t.selectionEnd=s+e.length,t.focus(),t.dispatchEvent(new Event("input"))}applyFormatting(e){const t=this.notesContainer.querySelector(".session-notes-textarea"),s=t.selectionStart,a=t.selectionEnd,n=t.value.substring(s,a);let o="";switch(e){case"bold":o=`**${n||"bold text"}**`;break;case"italic":o=`*${n||"italic text"}*`;break;case"bullet":o=n?n.split(`
`).map(l=>l.trim()?`• ${l}`:l).join(`
`):"• ";break;case"checkbox":o="☐ ";break;case"arrow":o="→ ";break;case"star":o="★ ";break;case"heading":o=`# ${n||"Heading"}`;break}const c=t.value.substring(0,s)+o+t.value.substring(a);t.value=c,this.notes=c;const p=s+o.length;t.setSelectionRange(p,p),this.updateWordCount(),this.scheduleAutoSave(),t.focus()}insertTemplate(e){const t=this.templates.find(c=>c.name===e);if(!t)return;const s=this.notesContainer.querySelector(".session-notes-textarea"),a=s.value,n=a?a+`

`+t.content:t.content;s.value=n,s.focus();const o=n.indexOf("• ")+2;o>1&&s.setSelectionRange(o,o),s.dispatchEvent(new Event("input"))}toggleExpandedMode(){this.expandedMode=!this.expandedMode;const e=this.notesContainer.querySelector(".notes-expand-btn"),t=e.querySelector(".expand-icon");this.expandedMode?(this.notesContainer.classList.add("notes-expanded"),t.textContent="⛷",e.title="Collapse notes"):(this.notesContainer.classList.remove("notes-expanded"),t.textContent="⛶",e.title="Expand notes")}updateWordCount(){const e=this.notesContainer.querySelector(".word-count"),t=this.notes.trim().split(/\s+/).filter(a=>a.length>0),s=this.notes.trim()===""?0:t.length;e.textContent=`${s} word${s===1?"":"s"}`}autosave(){try{localStorage.setItem("kairo-session-notes-temp",this.notes)}catch(e){console.error("Failed to auto-save notes:",e),this.updateSaveStatus("error")}}clearNotesWithConfirmation(){if(!this.notes.trim())return;confirm("Are you sure you want to clear all notes? This action cannot be undone.")&&this.clearNotes()}showNotes(){if(!this.isVisible){this.notesContainer.style.display="block",this.isVisible=!0,requestAnimationFrame(()=>{this.notesContainer.classList.add("notes-visible")});const e=this.notesContainer.querySelector(".notes-toggle-btn"),t=e.querySelector(".toggle-icon");e.setAttribute("title","Hide notes"),t.textContent="−",setTimeout(()=>{this.notesContainer.querySelector(".session-notes-textarea").focus()},300)}}hideNotes(){if(this.isVisible){this.notesContainer.classList.remove("notes-visible"),setTimeout(()=>{this.notesContainer.style.display="none",this.isVisible=!1},200);const e=this.notesContainer.querySelector(".notes-toggle-btn"),t=e.querySelector(".toggle-icon");e.setAttribute("title","Show notes"),t.textContent="+"}}toggleVisibility(){this.isVisible?this.hideNotes():this.showNotes()}onSessionStart(){this.ensureInitialized(),this.attachToTimer(),this.clearNotes(),this.showNotes(),this.updateStatus("saved")}onSessionEnd(){this.hideNotes()}onSessionSave(){return this.notes.trim()}clearNotes(){this.notes="";const e=this.notesContainer.querySelector(".session-notes-textarea");e.value="",this.updateWordCount(),this.updateStatus("saved")}setNotes(e){this.notes=e||"";const t=this.notesContainer.querySelector(".session-notes-textarea");t.value=this.notes,this.updateWordCount()}restoreNotes(){const e=localStorage.getItem("kairo-session-notes-temp");e&&this.setNotes(e)}cleanup(){localStorage.removeItem("kairo-session-notes-temp"),this.expandedMode=!1,this.notesContainer.classList.remove("notes-expanded")}performQuickAction(e){const t=this.notesContainer.querySelector(".session-notes-textarea");switch(e){case"timestamp":const s=new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0});this.insertAtCursor(`[${s}] `);break;case"divider":this.insertAtCursor(`

---

`);break;case"clear":confirm("Clear all notes? This cannot be undone.")&&(t.value="",this.notes="",this.updateWordCount(),this.scheduleAutoSave());break}}handleTyping(){this.isTyping||(this.isTyping=!0,this.showTypingIndicator()),this.typingTimeout&&clearTimeout(this.typingTimeout),this.typingTimeout=setTimeout(()=>{this.stopTyping()},1e3)}stopTyping(){this.isTyping=!1,this.hideTypingIndicator(),this.updateSaveStatus("saved")}showTypingIndicator(){const e=this.notesContainer.querySelector(".typing-indicator");e&&(e.style.display="flex")}hideTypingIndicator(){const e=this.notesContainer.querySelector(".typing-indicator");e&&(e.style.display="none")}scheduleAutoSave(){this.autoSaveTimeout&&clearTimeout(this.autoSaveTimeout),this.updateSaveStatus("saving"),this.autoSaveTimeout=setTimeout(()=>{this.autosave(),this.updateSaveStatus("saved")},2e3)}updateSaveStatus(e){const t=this.notesContainer.querySelector(".save-status");t&&(e==="saving"?(t.textContent="⋯",t.title="Saving...",t.style.opacity="0.6"):e==="saved"?(t.textContent="✓",t.title="Auto-saved",t.style.opacity="1"):e==="error"&&(t.textContent="⚠",t.title="Save failed",t.style.opacity="1"))}}const oe=new ne;let N,E;document.addEventListener("DOMContentLoaded",()=>{const i=document.getElementById("app");i.innerHTML=`
    
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
  `,X(),ae(),Z(),F(document.getElementById("timer")),N=G(document.getElementById("history")),E=J(document.getElementById("analytics")),se(),window.analyticsApi=E;const e=document.createElement("div");e.setAttribute("aria-live","polite"),e.setAttribute("aria-atomic","true"),e.className="sr-only",e.textContent="Kairo focus timer app loaded and ready to use. Japanese Zen minimalist design.",document.body.appendChild(e),setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},3e3),window.sessionNotesManager=oe,window.analyticsApi=E});export{Q as f,K as g,re as r,ie as s,w as t};
