export interface AuthUser {
  id: string
  email: string
  role: 'talent' | 'employer'
  name: string
}

export function getAuth(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('auth')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getAuthHeaders(): Record<string, string> {
  const auth = getAuth()
  if (!auth) return {}
  return {
    'x-user-id': auth.email,
    'x-role': auth.role,
    'x-name': auth.name,
  }
}

export function clearAuth() {
  localStorage.removeItem('auth')
  localStorage.removeItem('mockAuth') // clear old key too
}