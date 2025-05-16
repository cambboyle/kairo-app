const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema(
  {
    duration: { type: Number, required: true },
    type: {
      type: String,
      enum: ['focus', 'short_break', 'long_break'],
      required: true,
    },
    reflection: { type: String },
    startedAt: { type: Date, required: true },
    EndedAt: { type: Date, required: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Session', sessionSchema)
