'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { User, Lock } from 'lucide-react'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function ProfileSettingsTab() {
  const [name, setName] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [workStyle, setWorkStyle] = useState<string[]>([])
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let ignore = false
    fetch(`${BACKEND}/me`, { headers: getHeaders() })
      .then(res => res.json())
      .then(data => {
        if (!ignore && data.data) {
          setName(data.data.name || '')
          setSalaryMin(data.data.salary_min || '')
          setSalaryMax(data.data.salary_max || '')
          setWorkStyle(data.data.work_style_flags || [])
        }
      })
      .catch(console.error)
      
    return () => { ignore = true }
  }, [])

  const getHeaders = () => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}')
    return {
      'Content-Type': 'application/json',
      'x-user-id': auth.id || '',
      'x-role': auth.role || '',
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingProfile(true)
    try {
      const res = await fetch(`${BACKEND}/me/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ 
          name,
          salary_min: Number(salaryMin) || 0,
          salary_max: Number(salaryMax) || 0,
          work_style_flags: workStyle
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || 'Failed to update profile')
      }
      const data = await res.json()
      
      // Update local storage
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      localStorage.setItem('auth', JSON.stringify({ ...auth, name: data.data.name }))

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'New password must be at least 6 characters',
        variant: 'destructive',
      })
      return
    }
    
    setIsLoadingPassword(true)
    try {
      const res = await fetch(`${BACKEND}/auth/password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ oldPassword, newPassword }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || 'Failed to change password')
      }
      
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      })
      setOldPassword('')
      setNewPassword('')
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoadingPassword(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Profile Section */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Public Profile</h3>
        </div>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
              Display Name / Company Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={isLoadingProfile}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="salaryMin" className="block text-sm font-medium text-foreground mb-1.5">
                Minimum Salary / Rate ($)
              </label>
              <Input
                id="salaryMin"
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="0"
                disabled={isLoadingProfile}
              />
            </div>
            <div>
              <label htmlFor="salaryMax" className="block text-sm font-medium text-foreground mb-1.5">
                Maximum Salary / Rate ($)
              </label>
              <Input
                id="salaryMax"
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="0"
                disabled={isLoadingProfile}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Work Style Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {['Remote', 'Hybrid', 'On-site', 'Async', 'Fast-paced'].map(flag => (
                <button
                  key={flag}
                  type="button"
                  onClick={() => {
                    setWorkStyle(prev => 
                      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
                    )
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    workStyle.includes(flag) 
                      ? 'bg-violet-600 text-white border-violet-600' 
                      : 'bg-transparent text-muted-foreground border-border hover:border-violet-600/50'
                  }`}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isLoadingProfile || !name}>
            {isLoadingProfile ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </div>

      {/* Password Section */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="oldPassword" className="block text-sm font-medium text-foreground mb-1.5">
              Current Password
            </label>
            <Input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={isLoadingPassword}
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-1.5">
              New Password
            </label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoadingPassword}
              required
            />
          </div>
          <Button type="submit" disabled={isLoadingPassword || !oldPassword || !newPassword}>
            {isLoadingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
