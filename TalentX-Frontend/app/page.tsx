'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}')
    if (auth.id) {
      if (auth.role === 'employer') {
        router.push('/employer/dashboard')
      } else {
        router.push('/talent/dashboard')
      }
    } else {
      router.push('/landing')
    }
  }, [router])

  return null
}