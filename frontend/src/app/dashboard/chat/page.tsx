'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import ChatModal from '../../../components/ChatModal'

interface User {
  _id: string
  name: string
  email: string
  role: string
}

interface Conversation {
  _id: string
  participants: User[]
  lastMessage?: {
    content: string
    createdAt: string
    sender: {
      _id: string
      name: string
    }
  }
  unreadCount: number
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showChatModal, setShowChatModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Load conversations
  const loadConversations = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        'http://localhost:5000/api/messages/conversations',
        { headers: getAuthHeaders() }
      )
      setConversations(response.data)
      
      // Update unread count in dashboard
      const unreadResponse = await axios.get(
        'http://localhost:5000/api/messages/unread/count',
        { headers: getAuthHeaders() }
      )
      // Dispatch custom event to update dashboard
      window.dispatchEvent(new CustomEvent('updateUnreadCount', { 
        detail: { count: unreadResponse.data.unreadCount } 
      }))
    } catch (error: any) {
      console.error('Error loading conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  // Load users for new chat
  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await axios.get(
        'http://localhost:5000/api/users/chat/list',
        { headers: getAuthHeaders() }
      )
      // No need to filter out current user as the backend already excludes them
      setUsers(response.data)
    } catch (error: any) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  const handleNewChat = () => {
    loadUsers()
    setShowNewChatModal(true)
  }

  const handleStartChat = (user: User) => {
    setSelectedUser(user)
    setShowNewChatModal(false)
    setShowChatModal(true)
  }

  const handleOpenConversation = (conversation: Conversation) => {
    // Find the other participant (not current user)
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id
    const otherParticipant = conversation.participants.find(
      p => p._id !== currentUserId
    )
    
    if (otherParticipant) {
      setSelectedUser(otherParticipant)
      setShowChatModal(true)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleDisplayName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Messages
              </h1>
            </div>
            <button
              onClick={handleNewChat}
              className="btn-primary"
            >
              New Chat
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Conversations</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No conversations yet.</p>
              <button
                onClick={handleNewChat}
                className="btn-primary"
              >
                Start Your First Chat
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => {
                const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id
                const otherParticipant = conversation.participants.find(
                  p => p._id !== currentUserId
                )
                
                return (
                  <div
                    key={conversation._id}
                    onClick={() => handleOpenConversation(conversation)}
                    className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                          {otherParticipant?.name || 'Unknown User'}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {otherParticipant?.role && getRoleDisplayName(otherParticipant.role)}
                      </p>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">
                            {conversation.lastMessage.sender._id === currentUserId ? 'You' : conversation.lastMessage.sender.name}:
                          </span>{' '}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="ml-4">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Start New Chat</h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field w-full"
                />
              </div>
              
              {loadingUsers ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading users...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleStartChat(user)}
                      className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">{getRoleDisplayName(user.role)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedUser && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false)
            setSelectedUser(null)
            // Reload conversations to show updated last message
            loadConversations()
          }}
          recipientId={selectedUser._id}
          recipientName={selectedUser.name}
        />
      )}
    </div>
  )
} 