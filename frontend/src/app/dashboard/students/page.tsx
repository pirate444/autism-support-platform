'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

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
      setStudents(response.data)
    } catch (error: any) {
      console.error('Error loading students:', error)
      console.error('Error response:', error.response?.data)
      toast.error(`Failed to load students: ${error.response?.data?.message || error.message}`)
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
      toast.error(`Failed to load unassigned students: ${error.response?.data?.message || error.message}`);
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
      
      toast.success('Student claimed successfully!');
      // Reload both assigned and unassigned students
      loadStudents();
      loadUnassignedStudents();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to claim student';
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
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/students/',
        createForm,
        { headers: getAuthHeaders() }
      )
      
      toast.success('Student created successfully!')
      setShowCreateForm(false)
      setCreateForm({ name: '', dateOfBirth: '', ministryCode: '' })
      // Reload students to show the new one
      loadStudents()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create student'
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
      toast.error('Failed to load professionals')
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
      
      toast.success('Professionals assigned successfully!')
      setShowAssignModal(false)
      setSelectedStudent(null)
      setSelectedProfessionals([])
      // Reload students to show updated assignments
      loadStudents()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to assign professionals'
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
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${studentId}`, { headers: getAuthHeaders() });
      toast.success('Student deleted successfully!');
      setShowDetailsModal(false);
      loadStudents();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete student';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.isAdmin ? 'Students Management' : 'My Assigned Students'}
              </h1>
            </div>
            {canAddStudents ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                Add New Student
              </button>
            ) : (
              <div className="text-sm text-gray-600 bg-yellow-50 px-3 py-2 rounded-md">
                Only teachers, parents, and trainers can add students
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notice for users who can't add students */}
        {!canAddStudents && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Only teachers (School Support Assistants), parents, and trainers (Specialist Educators) can add new students. 
              You can search and view existing students below.
            </p>
          </div>
        )}

        {/* Notice about admin-only assignment */}
        {!canAssignProfessionals && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-md">
            <p className="text-sm text-purple-800">
              <strong>Note:</strong> Only administrators can assign healthcare professionals to students. 
              You can view student details and assigned professionals below.
            </p>
          </div>
        )}

        {/* Notice about student visibility */}
        {user?.isAdmin ? (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Admin View:</strong> You can see all students in the system and assign healthcare professionals to them.
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Professional View:</strong> You can see only the students assigned to you. Contact an administrator if you need access to additional students.
            </p>
          </div>
        )}

        {/* Create Student Form */}
        {showCreateForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Student</h2>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateFormChange}
                  className="input-field"
                  placeholder="Enter student name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
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
                  Ministry Code
                </label>
                <input
                  type="text"
                  name="ministryCode"
                  value={createForm.ministryCode}
                  onChange={handleCreateFormChange}
                  className="input-field"
                  placeholder="Enter ministry code (optional)"
                />
              </div>
              
              <div className="flex gap-4">
                <button type="submit" className="btn-primary">
                  Create Student
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Students List */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            {user?.isAdmin ? 'All Students' : 'My Assigned Students'}
          </h2>
          {/* Intelligent Search Bar */}
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Search by name, ministry code, assigned professional, or creator..."
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
                Found {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </div>
            )}
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {searchQuery
                  ? `No students found matching "${searchQuery}". Try a different search term.`
                  : (user?.isAdmin
                    ? 'No students found in the system. This could mean: 1) No students have been created yet, 2) There is a database connection issue, or 3) There is an authentication problem. Check the browser console for debugging information.'
                    : 'No students are currently assigned to you. Contact an administrator to request student assignments.'
                  )}
              </p>
              {user?.isAdmin && !searchQuery && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Debug Info:</strong> User ID: {user?.id}, Role: {user?.role}, isAdmin: {user?.isAdmin?.toString()}
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
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date of Birth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Professionals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                          {student.assignedUsers?.length || 0} professionals
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleViewDetails(student)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          View Details
                        </button>
                        {canAssignProfessionals && (
                          <button 
                            onClick={() => handleAssignProfessionals(student)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Assign Users
                          </button>
                        )}
                        {(user?.isAdmin || (student.createdBy && student.createdBy._id === user.id)) && (
                          <button
                            onClick={() => handleDeleteStudent(student._id)}
                            className="text-red-600 hover:text-red-900 ml-4"
                          >
                            Delete
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
                <h2 className="text-xl font-semibold">Unassigned Students</h2>
                <button
                  onClick={() => setShowUnassignedStudents(!showUnassignedStudents)}
                  className="text-primary-600 hover:text-primary-900 text-sm"
                >
                  {showUnassignedStudents ? 'Hide' : 'Show'} Unassigned Students
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> These are students that were created but not assigned to any parent. 
                  If you created any of these students before the recent update, you can claim them by clicking "Claim Student".
                </p>
              </div>

              {showUnassignedStudents && (
                <>
                  {loadingUnassigned ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading unassigned students...</p>
                    </div>
                  ) : unassignedStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No unassigned students found.</p>
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
                              Date of Birth
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
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
                                  Claim Student
                                </button>
                                <button 
                                  onClick={() => handleViewDetails(student)}
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  View Details
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
      </main>

      {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">{selectedStudent.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedStudent.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Professionals</label>
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
                    <p className="text-sm text-gray-500">No professionals assigned</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedStudent.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {/* Show ministry code to the creator or admin */}
                {selectedStudent.ministryCode && 
                  (user?.isAdmin || (selectedStudent.createdBy && selectedStudent.createdBy._id === user.id)) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ministry Code</label>
                      <p className="text-sm text-gray-900">{selectedStudent.ministryCode}</p>
                    </div>
                  )}
                {(user?.isAdmin || (selectedStudent.createdBy && selectedStudent.createdBy._id === user.id)) && (
                  <button
                    onClick={() => handleDeleteStudent(selectedStudent._id)}
                    className="btn-danger w-full mt-4"
                  >
                    Delete Student
                  </button>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-primary w-full"
                >
                  Close
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
                Assign Users to {selectedStudent.name}
              </h3>
              
              {loadingProfessionals ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading professionals...</p>
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
                  Assign Selected
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedStudent(null)
                    setSelectedProfessionals([])
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 