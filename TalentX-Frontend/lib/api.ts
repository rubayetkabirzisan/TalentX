const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.error?.message || `Request failed: ${res.status}`)
  }

  return res.json()
}