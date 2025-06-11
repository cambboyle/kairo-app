// Session configuration for Kairo
// Centralized configuration for session types, icons, and default settings

export const SESSION_TYPES = {
  FOCUS: {
    id: 'Focus',
    name: 'Focus',
    icon: '🎯',
    emoji: '○',
    defaultDuration: 25,
    description: 'Standard focused work session',
    color: '#4f564f', // sage
    bgColor: 'rgba(79, 86, 79, 0.1)',
  },
  DEEP_WORK: {
    id: 'Deep Work',
    name: 'Deep Work',
    icon: '🧠',
    emoji: '●',
    defaultDuration: 90,
    description: 'Extended deep focus session',
    color: '#6366f1', // indigo
    bgColor: 'rgba(99, 102, 241, 0.1)',
  },
  BREAK: {
    id: 'Break',
    name: 'Break',
    icon: '☕',
    emoji: '◐',
    defaultDuration: 5,
    description: 'Short rest and recharge',
    color: '#10b981', // emerald
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  CREATIVE: {
    id: 'Creative',
    name: 'Creative',
    icon: '🎨',
    emoji: '◑',
    defaultDuration: 45,
    description: 'Brainstorming and creative work',
    color: '#f59e0b', // amber
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  LEARNING: {
    id: 'Learning',
    name: 'Learning',
    icon: '📚',
    emoji: '◒',
    defaultDuration: 30,
    description: 'Study and skill development',
    color: '#8b5cf6', // violet
    bgColor: 'rgba(139, 92, 246, 0.1)',
  },
}

export const TIMER_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
}

export const MOOD_OPTIONS = [
  { id: 'energized', label: 'Energized', icon: '⚡', color: '#f59e0b' },
  { id: 'focused', label: 'Focused', icon: '🎯', color: '#6366f1' },
  { id: 'calm', label: 'Calm', icon: '🧘', color: '#10b981' },
  { id: 'scattered', label: 'Scattered', icon: '🌪️', color: '#ef4444' },
  { id: 'motivated', label: 'Motivated', icon: '🔥', color: '#f97316' },
  { id: 'tired', label: 'Tired', icon: '😴', color: '#6b7280' },
]

export const DURATION_PRESETS = [
  { label: '5 min', value: 5, type: 'quick' },
  { label: '15 min', value: 15, type: 'short' },
  { label: '25 min', value: 25, type: 'standard' },
  { label: '45 min', value: 45, type: 'extended' },
  { label: '90 min', value: 90, type: 'deep' },
  { label: 'Custom', value: null, type: 'custom' },
]

// Helper functions
export function getSessionTypeById(id) {
  return (
    Object.values(SESSION_TYPES).find((type) => type.id === id) ||
    SESSION_TYPES.FOCUS
  )
}

export function getSessionIcon(type, useEmoji = false) {
  const sessionType = getSessionTypeById(type)
  return useEmoji ? sessionType.emoji : sessionType.icon
}

export function getDefaultDuration(type) {
  const sessionType = getSessionTypeById(type)
  return sessionType.defaultDuration
}

export function getMoodById(id) {
  return MOOD_OPTIONS.find((mood) => mood.id === id)
}

export default {
  SESSION_TYPES,
  TIMER_STATES,
  MOOD_OPTIONS,
  DURATION_PRESETS,
  getSessionTypeById,
  getSessionIcon,
  getDefaultDuration,
  getMoodById,
}
