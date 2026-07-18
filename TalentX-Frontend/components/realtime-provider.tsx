'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

interface RealtimeContextType {
  socket: Socket | null;
  unreadNotifications: number;
  setUnreadNotifications: React.Dispatch<React.SetStateAction<number>>;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  activeChatUserId: string | null;
  setActiveChatUserId: React.Dispatch<React.SetStateAction<string | null>>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null)

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}')
    if (!auth.id) return

    const newSocket = io(BACKEND, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      newSocket.emit('join', auth.id)
    })

    newSocket.on('new_notification', (notif: any) => {
      setUnreadNotifications(prev => prev + 1)
      setNotifications(prev => [notif, ...prev])
    })

    setSocket(newSocket)

    // Fetch initial unread count
    fetch(`${BACKEND}/notifications`, {
      headers: {
        'x-user-id': auth.email || auth.id,
        'x-role': auth.role
      }
    })
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setNotifications(d.data)
          setUnreadNotifications(d.data.filter((n: any) => !n.read).length)
        }
      })
      .catch(console.error)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  return (
    <RealtimeContext.Provider value={{
      socket,
      unreadNotifications,
      setUnreadNotifications,
      notifications,
      setNotifications,
      activeChatUserId,
      setActiveChatUserId
    }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}
