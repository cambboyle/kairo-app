const express = require('express')
const mongoose = require('mongoose')

// Initialize Express app
const app = express()

// Middleware
app.use(express.json())

// CORS middleware for Vercel deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  )

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// MongoDB connection
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return // Already connected
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB connected...')
  } catch (error) {
    console.error('Database connection failed:', error.message)
    throw error
  }
}

// Session Schema
const sessionSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    duration: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    notes: { type: String, default: '' },
    reflection: { type: String, default: '' },
    mood: { type: String, default: '' },
  },
  { timestamps: true },
)

const Session = mongoose.model('Session', sessionSchema)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb:
      mongoose.connections[0].readyState === 1 ? 'connected' : 'disconnected',
  })
})

// Routes
app.post('/api/sessions', async (req, res) => {
  try {
    await connectDB()
    const session = new Session(req.body)
    await session.save()
    res.status(201).json(session)
  } catch (err) {
    console.error('Create session error:', err)
    res.status(400).json({ message: err.message })
  }
})

app.get('/api/sessions', async (req, res) => {
  try {
    await connectDB()
    const sessions = await Session.find().sort({ startTime: -1 })
    res.json(sessions)
  } catch (err) {
    console.error('Get sessions error:', err)
    res.status(500).json({ message: err.message })
  }
})

app.delete('/api/sessions/:id', async (req, res) => {
  try {
    await connectDB()
    const deleted = await Session.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Session not found' })
    res.json({ message: 'Session deleted' })
  } catch (err) {
    console.error('Delete session error:', err)
    res.status(500).json({ message: err.message })
  }
})

// Handle all other routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

module.exports = app
