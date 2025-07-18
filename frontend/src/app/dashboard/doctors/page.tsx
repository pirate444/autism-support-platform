'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import ChatModal from '../../../components/ChatModal'
import NotificationBadge from '../../../components/NotificationBadge'

interface Doctor {
  _id: string
  name: string
  email: string
  role: string
  specialization: string
  createdAt: string
  unreadCount?: number
}

const specializations = [
  'Autism Spectrum Disorders',
  'Child Psychology',
  'Speech Therapy',
  'Occupational Therapy',
  'Behavioral Therapy',
  'Educational Psychology',
  'Developmental Psychology',
  'Family Therapy'
]

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // New state for doctor details and chat
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Load doctors
  const loadDoctors = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/doctors/',
        { headers: getAuthHeaders() }
      )
      
      // Load unread counts for each doctor
      const doctorsWithUnreadCounts = await Promise.all(
        response.data.map(async (doctor: Doctor) => {
          try {
            const unreadResponse = await axios.get(
              `http://localhost:5000/api/messages/unread/count/${doctor._id}`,
              { headers: getAuthHeaders() }
            )
            return { ...doctor, unreadCount: unreadResponse.data.unreadCount }
          } catch (error) {
            return { ...doctor, unreadCount: 0 }
          }
        })
      )
      
      setDoctors(doctorsWithUnreadCounts)
    } catch (error: any) {
      console.error('Error loading doctors:', error)
      toast.error('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDoctors()
  }, [])

  // Filter doctors based on search query
  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doctor.specialization && doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getRoleDisplayName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // View doctor profile
  const handleViewProfile = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowProfileModal(true)
  }

  // Contact doctor
  const handleContact = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowChatModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Doctor Directory
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intelligent Search Section */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Healthcare Professionals</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, role, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">
              Found {filteredDoctors.length} professional{filteredDoctors.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Doctors List */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Healthcare Professionals</h2>
            <span className="text-sm text-gray-600">
              {filteredDoctors.length} professional{filteredDoctors.length !== 1 ? 's' : ''} found
            </span>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {searchQuery 
                  ? `No doctors found matching "${searchQuery}". Try a different search term.`
                  : 'No doctors found. Please check back later.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {doctor.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getRoleDisplayName(doctor.role)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {doctor.specialization || 'Not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {doctor.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleViewProfile(doctor)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          View Profile
                        </button>
                        <button 
                          onClick={() => handleContact(doctor)}
                          className="text-primary-600 hover:text-primary-900 relative"
                        >
                          Contact
                          {doctor.unreadCount && doctor.unreadCount > 0 && (
                            <NotificationBadge count={doctor.unreadCount} className="absolute -top-2 -right-2" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-primary-600">{doctors.length}</h3>
            <p className="text-gray-600">Total Professionals</p>
          </div>
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-green-600">
              {doctors.filter(d => d.role === 'child_psychiatrist').length}
            </h3>
            <p className="text-gray-600">Psychiatrists</p>
          </div>
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-blue-600">
              {doctors.filter(d => d.role === 'speech_therapist').length}
            </h3>
            <p className="text-gray-600">Speech Therapists</p>
          </div>
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-purple-600">
              {doctors.filter(d => d.role === 'occupational_therapist').length}
            </h3>
            <p className="text-gray-600">Occupational Therapists</p>
          </div>
        </div>
      </main>

      {/* Doctor Profile Modal */}
      {showProfileModal && selectedDoctor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Profile</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">{selectedDoctor.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="text-sm text-gray-900">{getRoleDisplayName(selectedDoctor.role)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  <p className="text-sm text-gray-900">
                    {selectedDoctor.specialization || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedDoctor.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedDoctor.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => handleContact(selectedDoctor)}
                  className="btn-primary flex-1"
                >
                  Contact
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedDoctor && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          recipientId={selectedDoctor._id}
          recipientName={selectedDoctor.name}
        />
      )}
    </div>
  )
} 