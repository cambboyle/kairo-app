const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
  duration: Number,
  type: String,
  reflection: String,
  mood: String,
  startTime: Date,
  endTime: Date,
})

module.exports = mongoose.model('Session', sessionSchema)
