const express = require('express')
const { config } = require('dotenv')

// Load environment variables
config()

// Initialize app
const app = express()

// Middleware
app.use(express.json())

// Routes
const sessionRoutes = require('./routes/sessionRoutes')
app.use('/api/sessions', sessionRoutes)

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ message: err.message || 'Internal Server Error' })
})

// Export the app instance
module.exports = app
