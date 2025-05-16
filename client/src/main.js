// main.js
import './style.css'
import { renderTimer } from './components/timer'
import { renderReflection } from './components/reflection'
import { renderHistory } from './components/history'

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app')

  app.innerHTML =
    '<h1>Kairo: Productivity App</h1> \
    <p>Welcome to the base layout.</p> \
    <div id="timer"></div> \
    <div id="reflection"></div> \
    <div id="history"></div>'

  renderTimer(document.getElementById('timer'))
  renderReflection(document.getElementById('reflection'))
  renderHistory(document.getElementById('history'))
})
