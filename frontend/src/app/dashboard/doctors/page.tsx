'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { apiUrl, getAuthHeaders } from '../../../utils/api';
import ChatModal from '../../../components/ChatModal'
import NotificationBadge from '../../../components/NotificationBadge'
import DashboardLayout from '../DashboardLayout';

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
      const response = await axios.get<Doctor[]>(
        apiUrl('/api/doctors/'),
        { headers: getAuthHeaders() }
      )
      
      // Load unread counts for each doctor
      const doctorsWithUnreadCounts = await Promise.all(
        ((response.data as any).doctors || response.data).map(async (doctor: Doctor) => {
          try {
            const unreadResponse = await axios.get<{ unreadCount: number }>(
              apiUrl(`/api/messages/unread/count/${doctor._id}`),
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

  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };
  if (!user) return null;

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
    <DashboardLayout user={user} handleLogout={handleLogout}>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intelligent Search Section */}
        <div className="card shadow-unia-card border-none rounded-[2rem] bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
          
          <div className="flex justify-center mb-4">
            <span className="text-4xl animate-bounce">🩺</span>
          </div>
          <h2 className="text-3xl font-black text-unia-purple tracking-tight mb-6 text-center drop-shadow-sm">
            Search Healthcare Professionals
          </h2>
          
          <div className="relative max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="Search by name, email, role, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white/90 backdrop-blur border-2 border-white focus:border-unia-purple shadow-sm rounded-2xl text-lg transition-all outline-none"
            />
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <span className="text-2xl opacity-60">🔍</span>
            </div>
            {searchQuery && (
              <div className="absolute top-full left-0 mt-3 text-sm font-bold text-unia-purple bg-white py-1 px-4 rounded-full shadow-sm">
                ✨ Found {filteredDoctors.length} professional{filteredDoctors.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 px-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span className="text-3xl">👨‍⚕️👩‍⚕️</span> Healthcare Professionals
            </h2>
            <span className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full font-bold text-sm shadow-sm">
              {filteredDoctors.length} professional{filteredDoctors.length !== 1 ? 's' : ''} found
            </span>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-6xl animate-bounce">🩺</div>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12 bg-white/50 rounded-3xl border border-white">
              <span className="text-5xl mb-4 block opacity-50">🔍</span>
              <p className="text-xl font-bold text-slate-600">
                {searchQuery 
                  ? `No doctors found matching "${searchQuery}".`
                  : 'No doctors found.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor, index) => {
                const colors = ['bg-unia-purple-light text-unia-purple', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700'];
                const colorTheme = colors[index % colors.length];
                
                return (
                <div key={doctor._id} className="bg-white rounded-[2rem] shadow-unia-card hover:shadow-unia-card-hover transition-all duration-300 hover:-translate-y-2 border border-slate-100 p-6 flex flex-col relative overflow-hidden group">
                  {/* Top Background shape */}
                  <div className={`absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 rounded-full blur-3xl opacity-50 ${colorTheme.split(' ')[0]}`}></div>
                  
                  <div className="flex items-center gap-4 mb-5 relative z-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm transform -rotate-3 group-hover:rotate-0 transition-transform ${colorTheme}`}>
                      {doctor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800 leading-tight">
                        {doctor.name}
                      </h3>
                      <p className="text-sm font-bold text-slate-500">
                        {getRoleDisplayName(doctor.role)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 mb-6 flex-grow">
                    <div className="bg-slate-50 rounded-xl px-4 py-2.5 flex items-center gap-3 border border-slate-100">
                       <span className="text-lg">⭐</span>
                       <span className="text-sm font-bold text-slate-700 line-clamp-1">{doctor.specialization || 'General Specialist'}</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 py-2.5 flex items-center gap-3 border border-slate-100">
                       <span className="text-lg">✉️</span>
                       <span className="text-sm font-bold text-slate-700 truncate">{doctor.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-auto relative z-10">
                    <button 
                      onClick={() => handleViewProfile(doctor)}
                      className="flex-1 bg-white border-2 border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:border-unia-purple hover:text-unia-purple transition-all"
                    >
                      Profile
                    </button>
                    <button 
                      onClick={() => handleContact(doctor)}
                      className="flex-1 btn-primary py-2.5 px-4 flex justify-center items-center gap-2 relative"
                    >
                      💬 Chat
                      {doctor.unreadCount && doctor.unreadCount > 0 && (
                        <NotificationBadge count={doctor.unreadCount} className="absolute -top-2 -right-2 ring-2 ring-white" />
                      )}
                    </button>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-center text-white shadow-unia-card transform hover:scale-105 transition-transform border-4 border-white">
            <h3 className="text-3xl font-black mb-1">{doctors.length}</h3>
            <p className="font-bold text-sm opacity-90">Total Providers</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl p-6 text-center text-white shadow-unia-card transform hover:scale-105 transition-transform border-4 border-white">
            <h3 className="text-3xl font-black mb-1">
              {doctors.filter(d => d.role === 'child_psychiatrist').length}
            </h3>
            <p className="font-bold text-sm opacity-90">Psychiatrists</p>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-sky-500 rounded-3xl p-6 text-center text-white shadow-unia-card transform hover:scale-105 transition-transform border-4 border-white">
            <h3 className="text-3xl font-black mb-1">
              {doctors.filter(d => d.role === 'speech_therapist').length}
            </h3>
            <p className="font-bold text-sm opacity-90">Speech Therapy</p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl p-6 text-center text-white shadow-unia-card transform hover:scale-105 transition-transform border-4 border-white">
            <h3 className="text-3xl font-black mb-1">
              {doctors.filter(d => d.role === 'occupational_therapist').length}
            </h3>
            <p className="font-bold text-sm opacity-90">Occupational OT</p>
          </div>
        </div>
      </div>

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
    </DashboardLayout>
  )
} 