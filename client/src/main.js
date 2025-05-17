// main.js
import './style.css'
import { startTimer } from './components/timer.js'
import { renderReflection } from './components/reflection'
import { renderHistory } from './components/history'

function showTimerView() {
  document.getElementById('timer').style.display = 'block'
  document.getElementById('reflection').style.display = 'none'
  document.getElementById('history').style.display = 'none'
}

function showHistoryView() {
  document.getElementById('timer').style.display = 'none'
  document.getElementById('reflection').style.display = 'none'
  const historyContainer = document.getElementById('history')
  historyContainer.style.display = 'block'
  renderHistory(historyContainer)
}

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app')

  app.innerHTML =
    '<h1>Kairo: Productivity App</h1> \
    <nav><a href="#/">Timer</a> | <a href="#/history">History</a></nav> \
    <div id="timer"></div> \
    <div id="reflection" style="display:none"></div> \
    <div id="history" style="display:none"></div>'

  const timerContainer = document.getElementById('timer')
  const reflectionContainer = document.getElementById('reflection')

  startTimer(timerContainer, () => {
    reflectionContainer.style.display = 'block'
    renderReflection(reflectionContainer)
  })

  function handleRoute() {
    if (window.location.hash === '#/history') {
      showHistoryView()
    } else {
      showTimerView()
    }
  }

  window.addEventListener('hashchange', handleRoute)
  handleRoute()
})
