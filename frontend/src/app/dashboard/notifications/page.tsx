"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Notification {
  _id: string
  user: string
  type: string
  title: string
  message: string
  relatedId?: string
  relatedType?: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

const notificationTypes = ['all', 'collaboration_request', 'course_access_request', 'course_activity', 'student_activity', 'system']

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [showRead, setShowRead] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      const parsedUser = userData ? JSON.parse(userData) : null
      setUser(parsedUser)
    }
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        'http://localhost:5000/api/notifications/my',
        { headers: getAuthHeaders() }
      )
      setNotifications(response.data.notifications || response.data)
    } catch (error: any) {
      console.error('Error loading notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const updateNotificationCount = () => {
    const unreadCount = notifications.filter(n => !n.isRead).length
    window.dispatchEvent(new CustomEvent('updateNotificationCount', { 
      detail: { count: unreadCount } 
    }))
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  useEffect(() => {
    updateNotificationCount()
  }, [notifications])

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { headers: getAuthHeaders() }
      )
      
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      )
    } catch (error: any) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.put(
        'http://localhost:5000/api/notifications/mark-all-read',
        {},
        { headers: getAuthHeaders() }
      )
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      )
      toast.success('All notifications marked as read')
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/notifications/${notificationId}`,
        { headers: getAuthHeaders() }
      )
      
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      )
      toast.success('Notification deleted')
    } catch (error: any) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'collaboration_request':
        return '🤝'
      case 'course_access_request':
        return '📚'
      case 'course_activity':
        return '🎓'
      case 'student_activity':
        return '👤'
      case 'system':
        return '🔔'
      default:
        return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'collaboration_request':
        return 'bg-blue-50 border-blue-200'
      case 'course_access_request':
        return 'bg-purple-50 border-purple-200'
      case 'course_activity':
        return 'bg-green-50 border-green-200'
      case 'student_activity':
        return 'bg-yellow-50 border-yellow-200'
      case 'system':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType
    const matchesReadStatus = showRead || !notification.isRead
    return matchesType && matchesReadStatus
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="btn-secondary"
                >
                  Mark All as Read
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field"
              >
                {notificationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showRead"
                checked={showRead}
                onChange={(e) => setShowRead(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 ring-gray-300 rounded"
              />
              <label htmlFor="showRead" className="ml-2 text-sm text-gray-700">
                Show read notifications
              </label>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {filterType === 'all' && showRead 
                  ? "You're all caught up! No notifications to show."
                  : "No notifications match your current filters."
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`card border-l-4 ${
                  notification.isRead ? 'opacity-75' : 'border-l-primary-500'
                } ${getNotificationColor(notification.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${
                          notification.isRead ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100">
                              New
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <p className={`mt-1 text-sm ${
                        notification.isRead ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                          {notification.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
} 