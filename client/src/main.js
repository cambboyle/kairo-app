// main.js
import './style.css'
import { startTimer } from './components/timer'
import { sessionHistory } from './components/history'

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app')

  app.innerHTML = `<h1>Welcome to <strong>Kairo</strong>.</h1>
          <div id="timer"></div>
          <div id="history"></div>`

  startTimer(document.getElementById('timer'))
  sessionHistory(document.getElementById('history'))
})
