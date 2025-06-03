const express = require('express')
const router = express.Router()
const Session = require('../models/sessionModel.js')

router.post('/', async (req, res) => {
  try {
    const session = new Session(req.body)
    await session.save()
    res.status(201).json(session)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.get('/', async (req, res) => {
  const sessions = await Session.find().sort({ startTime: -1 })
  res.json(sessions)
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Session.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Session not found' })
    res.json({ message: 'Session deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
