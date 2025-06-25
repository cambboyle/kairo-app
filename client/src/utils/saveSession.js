export async function saveSession(sessionData) {
  try {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('API error response:', errorText)
      throw new Error(`Failed to save session: ${res.status} - ${errorText}`)
    }

    const result = await res.json()
    return result
  } catch (error) {
    console.error('Save session error:', error)
    throw error
  }
}
