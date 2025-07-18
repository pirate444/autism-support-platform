'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import axios from 'axios'
import NotificationBadge from '../../components/NotificationBadge'

interface User {
  id: string
  name: string
  email: string
  role: string
  isAdmin?: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      toast.error('Please log in to access the dashboard')
      router.push('/auth/login')
      return
    }

    try {
      setUser(JSON.parse(userData))
      loadUnreadCount()
      loadNotificationCount()
    } catch (error) {
      toast.error('Invalid user data')
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }

    // Listen for unread count updates
    const handleUnreadCountUpdate = (event: CustomEvent) => {
      setUnreadCount(event.detail.count)
    }

    // Listen for notification count updates
    const handleNotificationCountUpdate = (event: CustomEvent) => {
      setNotificationCount(event.detail.count)
    }

    window.addEventListener('updateUnreadCount', handleUnreadCountUpdate as EventListener)
    window.addEventListener('updateNotificationCount', handleNotificationCountUpdate as EventListener)

    return () => {
      window.removeEventListener('updateUnreadCount', handleUnreadCountUpdate as EventListener)
      window.removeEventListener('updateNotificationCount', handleNotificationCountUpdate as EventListener)
    }
  }, [router])

  const loadUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        'http://localhost:5000/api/messages/unread/count',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUnreadCount(response.data.unreadCount)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  const loadNotificationCount = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        'http://localhost:5000/api/notifications/unread-count',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNotificationCount(response.data.unreadCount)
    } catch (error) {
      console.error('Error loading notification count:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Autism Support Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              {user.isAdmin && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Admin
                </span>
              )}
              {/* Notification Bell Icon */}
              <Link href="/dashboard/notifications" className="relative group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600 group-hover:text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Role: {user.role.replace('_', ' ').toUpperCase()}</p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Admin Dashboard - Only show for admin users */}
          {user.isAdmin && (
            <Link href="/dashboard/admin" className="card hover:shadow-lg transition-shadow border-2 border-red-200 bg-red-50">
              <div className="flex items-center mb-2">
                <h3 className="text-xl font-semibold text-red-800">Admin Dashboard</h3>
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Admin
                </span>
              </div>
              <p className="text-red-700">Platform administration and user management</p>
            </Link>
          )}

          {/* Students */}
          <Link href="/dashboard/students" className="card hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Students</h3>
            <p className="text-gray-600">Manage students and view their information</p>
          </Link>

          {/* Doctors */}
          <Link href="/dashboard/doctors" className="card hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Doctor Directory</h3>
            <p className="text-gray-600">Search and connect with healthcare professionals</p>
          </Link>

          {/* Activities */}
          <Link href="/dashboard/activities" className="card hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Activities & Games</h3>
            <p className="text-gray-600">Browse and upload educational resources</p>
          </Link>

          {/* Collaboration */}
          <Link href="/dashboard/collaboration" className="card hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
            <p className="text-gray-600">Notes, appointments, and progress tracking</p>
          </Link>

          {/* Messages */}
          <Link href="/dashboard/chat" className="card hover:shadow-lg transition-shadow relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">Messages</h3>
              <NotificationBadge count={unreadCount} />
            </div>
            <p className="text-gray-600">Chat with other professionals and students</p>
          </Link>

          {/* Collaboration Requests - Only show for admin users */}
          {user.isAdmin && (
            <Link href="/dashboard/collaboration-requests" className="card hover:shadow-lg transition-shadow border-2 border-blue-200 bg-blue-50">
              <div className="flex items-center mb-2">
                <h3 className="text-xl font-semibold text-blue-800">Collaboration Requests</h3>
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Admin
                </span>
              </div>
              <p className="text-blue-700">Review and approve collaboration requests</p>
            </Link>
          )}

          {/* Courses */}
          <Link href="/dashboard/courses" className="card hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Training Courses</h3>
            <p className="text-gray-600">Access and manage educational courses</p>
          </Link>

          {/* Profile */}
          <Link href="/dashboard/profile" className="card hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Profile</h3>
            <p className="text-gray-600">Update your account information</p>
          </Link>
        </div>
      </main>
    </div>
  )
} 