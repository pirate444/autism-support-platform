"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'

interface User {
  _id: string
  name: string
  email: string
  role: string
  isAdmin: boolean
  specialization?: string
  createdAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pendingCourseRequests, setPendingCourseRequests] = useState(0)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      
      // Check if user is admin
      if (!parsedUser.isAdmin) {
        toast.error('Access denied. Admin privileges required.')
        router.push('/dashboard')
        return
      }
      
      fetchUsers()
      fetchPendingCourseRequests()
    } else {
      router.push('/auth/login')
    }
  }, [router])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('https://autism-support-platform-production.up.railway.app/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(response.data)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingCourseRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('https://autism-support-platform-production.up.railway.app/api/course-access-requests', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const pendingCount = response.data.filter((request: any) => request.status === 'pending').length
      setPendingCourseRequests(pendingCount)
    } catch (error: any) {
      console.error('Error fetching pending course requests:', error)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`https://autism-support-platform-production.up.railway.app/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const getRoleLabel = (role: string) => {
    const roleLabels: { [key: string]: string } = {
      'child_psychiatrist': 'Child Psychiatrist',
      'specialist_educator': 'Specialist Educator',
      'occupational_therapist': 'Occupational Therapist',
      'psychologist': 'Psychologist',
      'school_support_assistant': 'School Support Assistant',
      'speech_therapist': 'Speech Therapist',
      'parent': 'Parent/Guide',
      'ministry_staff': 'Ministry Staff'
    }
    return roleLabels[role] || role
  }

  // Filter users based on search query
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.specialization && u.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Platform administration and user management
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-secondary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 px-4 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{users.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Professionals</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {users.filter(u => u.role !== 'parent').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Parents</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {users.filter(u => u.role === 'parent').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Add more stats cards as needed */}
        </div>

        {/* Admin Navigation */}
        <div className="mb-8 px-4 sm:px-0">
          <h2 className="text-xl font-bold mb-4">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow relative">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Course Access Requests</h3>
                  <p className="text-sm text-gray-500">Manage paid course access requests</p>
                  <button
                    onClick={() => router.push('/dashboard/admin/course-access')}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Requests →
                  </button>
                </div>
              </div>
              {pendingCourseRequests > 0 && (
                <span className="absolute top-4 right-4 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {pendingCourseRequests > 99 ? '99+' : pendingCourseRequests}
                </span>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Collaboration Requests</h3>
                  <p className="text-sm text-gray-500">Review student collaboration requests</p>
                  <button
                    onClick={() => router.push('/dashboard/collaboration-requests')}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Requests →
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h10v-2H4v2zM4 11h14v-2H4v2zM4 7h18v-2H4v2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">All Notifications</h3>
                  <p className="text-sm text-gray-500">View all platform notifications</p>
                  <button
                    onClick={() => router.push('/dashboard/notifications')}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg px-4 py-6">
          <h2 className="text-xl font-bold mb-4">User Management</h2>
          {/* Intelligent Search Bar */}
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Search by name, email, role, or specialization..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field w-full pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-gray-600">
                Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getRoleLabel(u.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.specialization || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        className="btn-danger text-xs px-2 py-1 rounded"
                        onClick={() => deleteUser(u._id)}
                        disabled={u._id === user._id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 