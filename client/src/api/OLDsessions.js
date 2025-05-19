export async function saveSession(sessionData) {
  // sessionData should be an object: { duration, type, reflection, startedAt, endedAt }
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData),
  })
  if (!res.ok) throw new Error('Failed to save session')
  return res.json()
}
