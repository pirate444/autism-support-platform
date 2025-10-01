'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import axios from 'axios'
import NotificationBadge from '../../components/NotificationBadge'
import { apiUrl } from '../../utils/api'
import { useLanguage } from '../../contexts/LanguageContext';
import NewsFeedPage from '../news-feed/page';

// --- Dashboard Sidebar Layout ---
const sidebarLinks = [
  { href: '/dashboard', label: '📰 Community News' },
  { href: '/dashboard/students', label: 'Students' },
  { href: '/dashboard/doctors', label: 'Doctors' },
  { href: '/dashboard/activities', label: 'Activities & Games' },
  { href: '/dashboard/collaboration', label: 'Collaboration' },
  { href: '/dashboard/courses', label: 'Courses' },
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/chat', label: 'Messages' },
];

function DashboardLayout({ user, notificationCount, unreadCount, handleLogout, children }: any) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col py-8 px-4 space-y-2">
        <h2 className="text-2xl font-bold text-indigo-700 mb-8">Dashboard</h2>
        {sidebarLinks.map(link => (
          <Link key={link.href} href={link.href} className="block py-2 px-3 rounded-lg hover:bg-indigo-50 text-gray-800 font-medium">
            {link.label}
          </Link>
        ))}
        {user?.isAdmin && (
          <>
            <div className="mt-6 border-t pt-4">
              <Link href="/dashboard/admin" className="block py-2 px-3 rounded-lg hover:bg-red-50 text-red-700 font-semibold">Admin Dashboard</Link>
              <Link href="/dashboard/collaboration-requests" className="block py-2 px-3 rounded-lg hover:bg-blue-50 text-blue-700 font-semibold">Collaboration Requests</Link>
            </div>
          </>
        )}
        <button onClick={handleLogout} className="mt-auto btn-secondary w-full">Logout</button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

interface User {
  id: string
  name: string
  email: string
  role: string
  isAdmin?: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useLanguage();
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
        apiUrl('/api/messages/unread/count'),
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
        apiUrl('/api/notifications/unread-count'),
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
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }
  if (!user) return null;
  return (
    <DashboardLayout
      user={user}
      notificationCount={notificationCount}
      unreadCount={unreadCount}
      handleLogout={handleLogout}
    >
      {/* News Feed as main content */}
      <NewsFeedPage />
    </DashboardLayout>
  );
} 