const Session = require('../models/sessionModel')

const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ startedAt: -1 })
    res.status(200).json(sessions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const createSession = async (req, res) => {
  console.log('Received POST /api/sessions:', req.body)
  const { duration, type, reflection, startedAt, endedAt } = req.body

  if (!duration || duration <= 0 || !type || !startedAt || !endedAt) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    const session = await Session.create({
      duration,
      type,
      reflection,
      startedAt,
      endedAt,
    })
    res.status(201).json(session)
  } catch (error) {
    console.error('Error creating sessions', error)
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getSessions, createSession }
