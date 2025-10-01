'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useLanguage } from '../../../contexts/LanguageContext';
import DashboardLayout from '../DashboardLayout';

interface Student {
  _id: string
  name: string
  dateOfBirth: string
  assignedUsers: Array<{
    _id: string
    name: string
    role: string
  }>
  createdAt: string
  createdBy?: {
    _id: string
    name: string
  }
  ministryCode?: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  isAdmin?: boolean
}

interface Professional {
  _id: string
  name: string
  email: string
  role: string
  specialization?: string
}

export default function StudentsPage() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [createForm, setCreateForm] = useState({
    name: '',
    dateOfBirth: '',
    ministryCode: ''
  })
  
  // New state for student details and assignment
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loadingProfessionals, setLoadingProfessionals] = useState(false)
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([])

  // New state for unassigned students (for parents)
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([])
  const [showUnassignedStudents, setShowUnassignedStudents] = useState(false)
  const [loadingUnassigned, setLoadingUnassigned] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  // Check if user can add students
  const canAddStudents = user?.role === 'school_support_assistant' || 
                        user?.role === 'parent' || 
                        user?.role === 'specialist_educator'

  // Check if user can assign professionals - only admin
  const canAssignProfessionals = user?.isAdmin === true

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Load students
  const loadStudents = async () => {
    try {
      // Admin sees all students, doctors and other professionals see only their assigned students
      const endpoint = user?.isAdmin ? '/api/students/' : '/api/students/my-assigned';
      
      console.log('Loading students with endpoint:', endpoint, 'User isAdmin:', user?.isAdmin);
      console.log('User data:', user);
      
      const response = await axios.get(
        `http://localhost:5000${endpoint}`,
        { headers: getAuthHeaders() }
      )
      
      console.log('Students loaded:', response.data);
      console.log('Number of students loaded:', response.data.length);
      setStudents(response.data)
    } catch (error: any) {
      console.error('Error loading students:', error)
      console.error('Error response:', error.response?.data)
      toast.error(`${t('failedToLoadStudents')}: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Load unassigned students for parents
  const loadUnassignedStudents = async () => {
    if (user?.role !== 'parent') return;
    
    setLoadingUnassigned(true);
    try {
      const response = await axios.get(
        'http://localhost:5000/api/students/unassigned',
        { headers: getAuthHeaders() }
      );
      setUnassignedStudents(response.data);
    } catch (error: any) {
      console.error('Error loading unassigned students:', error);
      toast.error(`${t('failedToLoadUnassignedStudents')}: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoadingUnassigned(false);
    }
  };

  // Claim a student (assign parent to student)
  const handleClaimStudent = async (studentId: string) => {
    try {
      await axios.post(
        `http://localhost:5000/api/students/${studentId}/assign-self`,
        {},
        { headers: getAuthHeaders() }
      );
      
      toast.success(`${t('studentClaimedSuccessfully')}`);
      // Reload both assigned and unassigned students
      loadStudents();
      loadUnassignedStudents();
    } catch (error: any) {
      const message = error.response?.data?.message || `${t('failedToClaimStudent')}`;
      toast.error(message);
    }
  };

  useEffect(() => {
    if (user) {
      loadStudents()
      // If user is a parent, also load unassigned students
      if (user.role === 'parent') {
        loadUnassignedStudents()
      }
    }
  }, [user])

  // Periodically refresh students list to check for new assignments
  useEffect(() => {
    if (user && !user.isAdmin) {
      // Only refresh for non-admin users (they might get new assignments)
      const interval = setInterval(() => {
        loadStudents();
        // If user is a parent, also refresh unassigned students
        if (user.role === 'parent') {
          loadUnassignedStudents();
        }
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  // Create new student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!createForm.name || !createForm.dateOfBirth) {
      toast.error(`${t('pleaseFillAllRequiredFields')}`);
      return
    }

    try {
      console.log('Creating student with data:', createForm)
      const response = await axios.post(
        'http://localhost:5000/api/students/',
        createForm,
        { headers: getAuthHeaders() }
      )
      
      console.log('Student created successfully:', response.data)
      toast.success(`${t('studentCreatedSuccessfully')}`);
      setShowCreateForm(false)
      setCreateForm({ name: '', dateOfBirth: '', ministryCode: '' })
      // Reload students to show the new one
      console.log('Reloading students list...')
      loadStudents()
    } catch (error: any) {
      console.error('Error creating student:', error)
      const message = error.response?.data?.message || `${t('failedToCreateStudent')}`
      toast.error(message)
    }
  }

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateForm({
      ...createForm,
      [e.target.name]: e.target.value
    })
  }

  // View student details
  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student)
    setShowDetailsModal(true)
  }

  // Load professionals for assignment
  const loadProfessionals = async () => {
    setLoadingProfessionals(true)
    try {
      let users: Professional[] = [];
      if (user?.isAdmin) {
        // Admin: fetch all users, filter out already assigned and ministry_staff
        const response = await axios.get(
          'http://localhost:5000/api/users/',
          { headers: getAuthHeaders() }
        );
        // Exclude already assigned and ministry_staff
        const assignedIds = selectedStudent?.assignedUsers?.map(u => u._id) || [];
        users = response.data.filter((u: Professional) =>
          u.role !== 'ministry_staff' && !assignedIds.includes(u._id)
        );
      } else {
        // Non-admin: fetch only doctors
        const response = await axios.get(
          'http://localhost:5000/api/doctors/',
          { headers: getAuthHeaders() }
        );
        users = response.data;
      }
      setProfessionals(users)
    } catch (error: any) {
      console.error('Error loading professionals:', error)
      toast.error(`${t('failedToLoadProfessionals')}`);
    } finally {
      setLoadingProfessionals(false)
    }
  }

  // Assign professionals to student
  const handleAssignProfessionals = (student: Student) => {
    setSelectedStudent(student)
    setSelectedProfessionals(student.assignedUsers?.map(u => u._id) || [])
    loadProfessionals()
    setShowAssignModal(true)
  }

  // Submit assignment
  const handleSubmitAssignment = async () => {
    if (!selectedStudent) return

    try {
      const response = await axios.post(
        `http://localhost:5000/api/students/${selectedStudent._id}/assign`,
        { userIds: selectedProfessionals },
        { headers: getAuthHeaders() }
      )
      
      toast.success(`${t('professionalsAssignedSuccessfully')}`);
      setShowAssignModal(false)
      setSelectedStudent(null)
      setSelectedProfessionals([])
      // Reload students to show updated assignments
      loadStudents()
    } catch (error: any) {
      const message = error.response?.data?.message || `${t('failedToAssignProfessionals')}`
      toast.error(message)
    }
  }

  const handleProfessionalToggle = (professionalId: string) => {
    setSelectedProfessionals(prev => 
      prev.includes(professionalId)
        ? prev.filter(id => id !== professionalId)
        : [...prev, professionalId]
    )
  }

  const getRoleDisplayName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm(`${t('confirmDeleteStudent')}`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${studentId}`, { headers: getAuthHeaders() });
      toast.success(`${t('studentDeletedSuccessfully')}`);
      setShowDetailsModal(false);
      loadStudents();
    } catch (error: any) {
      const message = error.response?.data?.message || `${t('failedToDeleteStudent')}`;
      toast.error(message);
    }
  };

  // Filter students based on search query
  const filteredStudents = students.filter(student => {
    const assignedNames = student.assignedUsers?.map(u => u.name).join(' ').toLowerCase() || '';
    const creatorName = student.createdBy?.name?.toLowerCase() || '';
    return (
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.ministryCode && student.ministryCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      assignedNames.includes(searchQuery.toLowerCase()) ||
      creatorName.includes(searchQuery.toLowerCase())
    );
  });

  if (!user) return null;
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };
  return (
    <DashboardLayout user={user} handleLogout={handleLogout}>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notice for users who can't add students */}
        {!canAddStudents && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>{t('note')}:</strong> {t('onlyCertainRolesCanAddStudents')}
            </p>
          </div>
        )}

        {/* Notice about admin-only assignment */}
        {!canAssignProfessionals && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-md">
            <p className="text-sm text-purple-800">
              <strong>{t('note')}:</strong> {t('onlyAdminsAssignNotice')}
            </p>
          </div>
        )}

        {/* Notice about student visibility */}
        {user?.isAdmin ? (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>{t('adminView')}:</strong> {t('adminViewNotice')}
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>{t('professionalView')}:</strong> {t('professionalViewNotice')}
            </p>
          </div>
        )}

        {/* Create Student Form */}
        {showCreateForm && (
          <div className="card mb-8 bg-gradient-to-br from-pink-100 via-yellow-100 to-blue-100 border-4 border-pink-200 rounded-3xl">
            <div className="flex justify-center mb-2">
              <span className="text-3xl">🧑‍🎓</span>
            </div>
            <h2 className="text-xl font-extrabold text-pink-600 mb-4 text-center drop-shadow">{t('createNewStudent')}</h2>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('studentName')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateFormChange}
                  className="input-field"
                  placeholder={t('enterStudentName')}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dateOfBirth')} *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={createForm.dateOfBirth}
                  onChange={handleCreateFormChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('ministryCode')}
                </label>
                <input
                  type="text"
                  name="ministryCode"
                  value={createForm.ministryCode}
                  onChange={handleCreateFormChange}
                  className="input-field"
                  placeholder={t('enterMinistryCodeOptional')}
                />
              </div>
              
              <div className="flex gap-4">
                <button type="submit" className="btn-primary">
                  <span className="text-lg">🎈 {t('createStudent')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary text-lg px-4 py-2 rounded-full shadow-md"
                >
                  <span className="text-lg">❌ {t('cancel')}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Students List */}
        <div className="card bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 border-4 border-blue-200 rounded-3xl">
          <div className="flex justify-center mb-2">
            <span className="text-3xl">👦👧</span>
          </div>
          <h2 className="text-xl font-extrabold text-blue-600 mb-4 text-center drop-shadow">
            {user?.isAdmin ? t('allStudents') : t('myAssignedStudents')}
          </h2>
          {/* Intelligent Search Bar */}
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder={t('searchStudentsPlaceholder')}
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
                {t('foundStudents', { count: filteredStudents.length, query: searchQuery })}
              </div>
            )}
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t('loadingStudents')}</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {searchQuery
                  ? t('noStudentsFoundMatching', { query: searchQuery })
                  : (user?.isAdmin
                    ? t('noStudentsFoundAdmin')
                    : t('noStudentsAssigned'))}
              </p>
              {user?.isAdmin && !searchQuery && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>{t('debugInfo')}:</strong> {t('userId')}: {user?.id}, {t('role')}: {user?.role}, {t('isAdmin')}: {user?.isAdmin?.toString()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dateOfBirth')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('assignedProfessionals')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(student.dateOfBirth).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.assignedUsers?.length || 0} {t('professionals')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleViewDetails(student)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          {t('viewDetails')}
                        </button>
                        {canAssignProfessionals && (
                          <button 
                            onClick={() => handleAssignProfessionals(student)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            {t('assignUsers')}
                          </button>
                        )}
                        {(user?.isAdmin || (student.createdBy && student.createdBy._id === user.id)) && (
                          <button
                            onClick={() => handleDeleteStudent(student._id)}
                            className="text-red-600 hover:text-red-900 ml-4"
                          >
                            {t('delete')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Unassigned Students Section for Parents */}
        {user?.role === 'parent' && (
          <div className="mt-8">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t('unassignedStudents')}</h2>
                <button
                  onClick={() => setShowUnassignedStudents(!showUnassignedStudents)}
                  className="text-primary-600 hover:text-primary-900 text-sm"
                >
                  {showUnassignedStudents ? t('hideUnassignedStudents') : t('showUnassignedStudents')}
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>{t('note')}:</strong> {t('unassignedStudentsNotice')}
                </p>
              </div>

              {showUnassignedStudents && (
                <>
                  {loadingUnassigned ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">{t('loadingUnassignedStudents')}</p>
                    </div>
                  ) : unassignedStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">{t('noUnassignedStudentsFound')}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('name')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('dateOfBirth')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('created')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('actions')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {unassignedStudents.map((student) => (
                            <tr key={student._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(student.dateOfBirth).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(student.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => handleClaimStudent(student._id)}
                                  className="text-green-600 hover:text-green-900 mr-4"
                                >
                                  {t('claimStudent')}
                                </button>
                                <button 
                                  onClick={() => handleViewDetails(student)}
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  {t('viewDetails')}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('studentDetails')}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('name')}</label>
                  <p className="text-sm text-gray-900">{selectedStudent.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('dateOfBirth')}</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedStudent.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('assignedProfessionals')}</label>
                  {selectedStudent.assignedUsers && selectedStudent.assignedUsers.length > 0 ? (
                    <ul className="text-sm text-gray-900 mt-1">
                      {selectedStudent.assignedUsers.map((user) => (
                        <li key={user._id} className="flex justify-between">
                          <span>{user.name}</span>
                          <span className="text-gray-500">{getRoleDisplayName(user.role)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">{t('noProfessionalsAssigned')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('created')}</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedStudent.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {/* Show ministry code to the creator or admin */}
                {selectedStudent.ministryCode && 
                  (user?.isAdmin || (selectedStudent.createdBy && selectedStudent.createdBy._id === user.id)) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('ministryCode')}</label>
                      <p className="text-sm text-gray-900">{selectedStudent.ministryCode}</p>
                    </div>
                  )}
                {(user?.isAdmin || (selectedStudent.createdBy && selectedStudent.createdBy._id === user.id)) && (
                  <button
                    onClick={() => handleDeleteStudent(selectedStudent._id)}
                    className="btn-danger w-full mt-4"
                  >
                    {t('deleteStudent')}
                  </button>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-primary w-full"
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Professionals Modal */}
      {showAssignModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('assignUsersTo', { name: selectedStudent.name })}
              </h3>
              
              {loadingProfessionals ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">{t('loadingProfessionals')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {professionals.map((professional) => (
                    <label key={professional._id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProfessionals.includes(professional._id)}
                        onChange={() => handleProfessionalToggle(professional._id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{professional.name}</p>
                        <p className="text-xs text-gray-500">
                          {getRoleDisplayName(professional.role)}
                          {professional.specialization && ` • ${professional.specialization}`}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleSubmitAssignment}
                  className="btn-primary flex-1"
                  disabled={loadingProfessionals}
                >
                  {t('assignSelected')}
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedStudent(null)
                    setSelectedProfessionals([])
                  }}
                  className="btn-secondary flex-1"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 