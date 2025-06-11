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

export const SESSION_TEMPLATES = [
  {
    id: 'pomodoro-classic',
    name: 'Classic Pomodoro',
    description: 'Traditional 25-minute focused work session',
    icon: '🍅',
    type: 'Focus',
    duration: 25,
    category: 'popular',
    tags: ['productivity', 'standard'],
  },
  {
    id: 'deep-work-block',
    name: 'Deep Work Block',
    description: 'Extended 90-minute session for complex tasks',
    icon: '🧠',
    type: 'Deep Work',
    duration: 90,
    category: 'popular',
    tags: ['deep-work', 'extended'],
  },
  {
    id: 'power-break',
    name: 'Power Break',
    description: 'Quick 5-minute energy refresh',
    icon: '⚡',
    type: 'Break',
    duration: 5,
    category: 'break',
    tags: ['rest', 'quick'],
  },
  {
    id: 'creative-sprint',
    name: 'Creative Sprint',
    description: 'Brainstorming and ideation session',
    icon: '🎨',
    type: 'Creative',
    duration: 45,
    category: 'creative',
    tags: ['creativity', 'brainstorming'],
  },
  {
    id: 'learning-block',
    name: 'Learning Block',
    description: 'Focused study and skill development',
    icon: '📚',
    type: 'Learning',
    duration: 30,
    category: 'learning',
    tags: ['study', 'skill-building'],
  },
  {
    id: 'micro-session',
    name: 'Micro Session',
    description: 'Ultra-quick 10-minute focused burst',
    icon: '⭐',
    type: 'Focus',
    duration: 10,
    category: 'quick',
    tags: ['quick', 'micro'],
  },
  {
    id: 'morning-momentum',
    name: 'Morning Momentum',
    description: 'Start your day with a 15-minute energizer',
    icon: '🌅',
    type: 'Focus',
    duration: 15,
    category: 'daily',
    tags: ['morning', 'routine'],
  },
  {
    id: 'creative-flow',
    name: 'Creative Flow',
    description: 'Extended creative session for artistic work',
    icon: '🌊',
    type: 'Creative',
    duration: 60,
    category: 'creative',
    tags: ['flow', 'artistic'],
  },
  {
    id: 'meditation-break',
    name: 'Mindful Break',
    description: 'Calming 15-minute mindfulness session',
    icon: '🧘',
    type: 'Break',
    duration: 15,
    category: 'break',
    tags: ['mindfulness', 'calm'],
  },
  {
    id: 'study-intensive',
    name: 'Study Intensive',
    description: 'Focused 45-minute learning session',
    icon: '📖',
    type: 'Learning',
    duration: 45,
    category: 'learning',
    tags: ['intensive', 'focus'],
  },
]

export const TEMPLATE_CATEGORIES = [
  { id: 'popular', name: 'Popular', icon: '⭐' },
  { id: 'quick', name: 'Quick Sessions', icon: '⚡' },
  { id: 'daily', name: 'Daily Routines', icon: '🗓️' },
  { id: 'creative', name: 'Creative Work', icon: '🎨' },
  { id: 'learning', name: 'Learning', icon: '📚' },
  { id: 'break', name: 'Breaks', icon: '☕' },
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

export function getTemplateById(id) {
  return SESSION_TEMPLATES.find((template) => template.id === id)
}

export function getTemplatesByCategory(categoryId) {
  return SESSION_TEMPLATES.filter(
    (template) => template.category === categoryId,
  )
}

export function getPopularTemplates() {
  return SESSION_TEMPLATES.filter((template) => template.category === 'popular')
}

export function searchTemplates(query) {
  const searchTerm = query.toLowerCase()
  return SESSION_TEMPLATES.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
  )
}

export function getCustomTemplates() {
  try {
    return JSON.parse(localStorage.getItem('customTemplates') || '[]')
  } catch (error) {
    console.error('Error loading custom templates:', error)
    return []
  }
}

export function getAllTemplates() {
  const standardTemplates = SESSION_TEMPLATES
  const customTemplates = getCustomTemplates()
  return [...standardTemplates, ...customTemplates]
}

export function deleteCustomTemplate(templateId) {
  try {
    const customTemplates = getCustomTemplates()
    const updatedTemplates = customTemplates.filter((t) => t.id !== templateId)
    localStorage.setItem('customTemplates', JSON.stringify(updatedTemplates))
    return true
  } catch (error) {
    console.error('Error deleting custom template:', error)
    return false
  }
}

export function trackTemplateUsage(templateId) {
  try {
    const usage = JSON.parse(localStorage.getItem('templateUsage') || '{}')
    usage[templateId] = (usage[templateId] || 0) + 1
    localStorage.setItem('templateUsage', JSON.stringify(usage))
  } catch (error) {
    console.error('Error tracking template usage:', error)
  }
}

export function getTemplateUsage() {
  try {
    return JSON.parse(localStorage.getItem('templateUsage') || '{}')
  } catch (error) {
    console.error('Error getting template usage:', error)
    return {}
  }
}

export function getMostUsedTemplates(limit = 5) {
  const usage = getTemplateUsage()
  const allTemplates = getAllTemplates()

  return allTemplates
    .map((template) => ({
      ...template,
      usage: usage[template.id] || 0,
    }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, limit)
    .filter((template) => template.usage > 0)
}

export default {
  SESSION_TYPES,
  TIMER_STATES,
  MOOD_OPTIONS,
  DURATION_PRESETS,
  SESSION_TEMPLATES,
  TEMPLATE_CATEGORIES,
  getSessionTypeById,
  getSessionIcon,
  getDefaultDuration,
  getMoodById,
  getTemplateById,
  getTemplatesByCategory,
  getPopularTemplates,
  searchTemplates,
  getCustomTemplates,
  getAllTemplates,
  deleteCustomTemplate,
  trackTemplateUsage,
  getTemplateUsage,
  getMostUsedTemplates,
}
