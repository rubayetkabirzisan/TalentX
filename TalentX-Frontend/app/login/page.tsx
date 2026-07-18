import type { Metadata } from 'next'
import LoginPageClient from './login-client'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Sign In — TalentX',
  description: 'Sign in to TalentX to apply for jobs or post opportunities for top tech talent.',
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageClient />
    </Suspense>
  )
}