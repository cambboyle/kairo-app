export async function saveSession(sessionData) {
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData),
  })
  if (!res.ok) {
    const errorText = await res.text()
    console.error('API error:', errorText)
    throw new Error('Failed to save your session')
  }
  return res.json()
}
