const connectDB = require('../config/db')
const app = require('../app')

// Connect to MongoDB
connectDB()

// Export the app for Vercel
module.exports = app
