export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')

  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'API request failed')
  }

  return response.json()
}
