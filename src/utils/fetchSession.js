// Check current content of this file
export async function fetchSessions() {
  try {
    const response = await fetch('/api/sessions')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.warn(
      'API not available, using localStorage fallback:',
      error.message,
    )
    // Fallback to localStorage when API is not available
    const localSessions = localStorage.getItem('kairo-sessions')
    return localSessions ? JSON.parse(localSessions) : []
  }
}

export async function saveSession(sessionData) {
  try {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.warn('API not available, saving to localStorage:', error.message)
    // Fallback to localStorage when API is not available
    const existingSessions = await fetchSessions()
    const newSession = {
      ...sessionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    const updatedSessions = [...existingSessions, newSession]
    localStorage.setItem('kairo-sessions', JSON.stringify(updatedSessions))
    return newSession
  }
}

export async function deleteSession(sessionId) {
  try {
    const response = await fetch(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.warn(
      'API not available, deleting from localStorage:',
      error.message,
    )
    // Fallback to localStorage when API is not available
    const existingSessions = await fetchSessions()
    const updatedSessions = existingSessions.filter(
      (session) => session.id !== sessionId,
    )
    localStorage.setItem('kairo-sessions', JSON.stringify(updatedSessions))
    return { success: true }
  }
}
