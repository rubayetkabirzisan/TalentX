'use client'

import { useState, useEffect, useRef } from 'react'
import { useRealtime } from './realtime-provider'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { MessageSquare, X, Send, User } from 'lucide-react'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function MessagingWidget() {
  const { socket, activeChatUserId, setActiveChatUserId } = useRealtime()
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuth, setIsAuth] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkAuth = () => {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      setIsAuth(!!auth.id)
    }
    checkAuth()
    window.addEventListener('auth_changed', checkAuth)
    return () => window.removeEventListener('auth_changed', checkAuth)
  }, [])

  useEffect(() => {
    if (activeChatUserId) {
      setIsOpen(true)
      fetchMessages(activeChatUserId)
    }
  }, [activeChatUserId])

  useEffect(() => {
    if (isOpen) {
      fetchConversations()
    }
  }, [isOpen])

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (msg: any) => {
      // If we are currently chatting with this user
      if (activeChatUserId === msg.sender_id) {
        setMessages(prev => [...prev, msg])
      }
      // Refresh conversation list to show new last_message
      fetchConversations()
    }

    socket.on('new_message', handleNewMessage)
    return () => {
      socket.off('new_message', handleNewMessage)
    }
  }, [socket, activeChatUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getHeaders = () => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}')
    return {
      'Content-Type': 'application/json',
      'x-user-id': auth.email || auth.id || '',
      'x-role': auth.role || '',
    }
  }

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${BACKEND}/messages`, { headers: getHeaders() })
      if (res.ok) {
        const data = await res.json()
        setConversations(data.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchMessages = async (userId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${BACKEND}/messages/${userId}`, { headers: getHeaders() })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChatUserId) return

    const msgContent = newMessage.trim()
    setNewMessage('') // optimistic clear

    try {
      const res = await fetch(`${BACKEND}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ receiver_id: activeChatUserId, content: msgContent })
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.data])
        fetchConversations()
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (!isAuth) return null

  if (!isOpen && !activeChatUserId) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:scale-105 transition-transform p-0"
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          {activeChatUserId ? (
            <Button variant="ghost" size="sm" className="h-8 px-2 -ml-2" onClick={() => setActiveChatUserId(null)}>
              &larr; Back
            </Button>
          ) : (
            <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-violet-500" /> Messages</span>
          )}
        </h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { setIsOpen(false); setActiveChatUserId(null); }}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {!activeChatUserId ? (
          // Conversations List
          <div className="divide-y divide-border">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p>No conversations yet.</p>
              </div>
            ) : (
              conversations.map((c) => (
                <div 
                  key={c.other_user_id}
                  onClick={() => setActiveChatUserId(c.other_user_id)}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors flex items-start gap-3"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="font-medium text-sm text-foreground truncate">{c.other_user_name}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.last_message}</p>
                  </div>
                  {!c.read && c.sender_id === c.other_user_id && (
                    <div className="h-2 w-2 rounded-full bg-violet-500 mt-2"></div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          // Active Chat
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {isLoading ? (
                <div className="text-center p-4 text-muted-foreground text-sm">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground text-sm">Send a message to start chatting!</div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender_id !== activeChatUserId
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        isMe ? 'bg-violet-600 text-white rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-background flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-violet-500"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()} className="rounded-full bg-violet-600 hover:bg-violet-700 text-white shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
