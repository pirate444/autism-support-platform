'use client'

import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { apiUrl } from '../utils/api'
import toast from 'react-hot-toast'

interface Message {
  _id: string
  sender: {
    _id: string
    name: string
  }
  recipient: {
    _id: string
    name: string
  }
  content: string
  createdAt: string
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  recipientId: string
  recipientName: string
}

export default function ChatModal({ isOpen, onClose, recipientId, recipientName }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Load messages
  const loadMessages = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        apiUrl(`/api/messages/${recipientId}`),
        { headers: getAuthHeaders() }
      )
      setMessages(response.data)
      
      // Mark messages as read
      await axios.put(
        apiUrl(`/api/messages/${recipientId}/read`),
        {},
        { headers: getAuthHeaders() }
      )
    } catch (error: any) {
      console.error('Error loading messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) {
      return
    }

    setSending(true)
    try {
      const response = await axios.post(
        apiUrl('/api/messages/'),
        {
          recipientId,
          content: newMessage.trim()
        },
        { headers: getAuthHeaders() }
      )
      
      setMessages(prev => [...prev, response.data])
      setNewMessage('')
      toast.success('Message sent!')
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen && recipientId) {
      loadMessages()
    }
  }, [isOpen, recipientId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Chat with {recipientName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender._id === JSON.parse(localStorage.getItem('user') || '{}').id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.sender._id === JSON.parse(localStorage.getItem('user') || '{}').id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 input-field"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="btn-primary px-4 py-2"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>
    </div>
  )
} 