"use client"

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface Student {
  _id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  diagnosis: string;
  assignedUsers?: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
}

interface Note {
  _id: string;
  content: string;
  student: string;
  createdBy: {
    name: string;
    role: string;
  };
  createdAt: string;
}

interface Appointment {
  _id: string;
  title: string;
  description: string;
  student: {
    name: string;
  };
  attendees: Array<{
    name: string;
    email: string;
    role: string;
  }>;
  startTime: string;
  endTime: string;
  status: string;
  createdBy: {
    name: string;
    role: string;
  };
}

interface ProgressReport {
  _id: string;
  student: string;
  reportDate: string;
  category: string;
  description: string;
  goals: string;
  achievements: string;
  nextSteps: string;
  createdBy: {
    name: string;
    role: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isAdmin?: boolean;
}

interface CollaborationAccess {
  hasAccess: boolean;
  reason: string;
  requestId?: string;
}

export default function CollaborationPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'appointments' | 'reports'>('notes');
  
  // Collaboration request states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState('all');
  const [requestReason, setRequestReason] = useState('');
  const [collaborationAccess, setCollaborationAccess] = useState<CollaborationAccess | null>(null);

  // Collaboration requests states
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Search states
  const [searchMinistryCode, setSearchMinistryCode] = useState('');
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);

  // Form states
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    attendees: [] as string[]
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    reportDate: '',
    category: '',
    description: '',
    goals: '',
    achievements: '',
    nextSteps: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch students after user data is loaded
  useEffect(() => {
    if (user) {
      fetchStudents();
      fetchMyRequests();
    }
  }, [user]);

  // Periodically refresh students list to check for new assignments
  useEffect(() => {
    if (user && !user.isAdmin) {
      // Only refresh for non-admin users (they might get new assignments)
      const interval = setInterval(() => {
        fetchStudents();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  // Refresh students list when collaboration access changes
  useEffect(() => {
    if (collaborationAccess?.hasAccess && !user?.isAdmin) {
      // If user just got access, refresh the students list immediately
      fetchStudents();
      toast.success("You now have access to this student! The student has been added to your list.");
    }
  }, [collaborationAccess]);

  useEffect(() => {
    if (selectedStudent) {
      checkCollaborationAccess();
      fetchCollaborationData();
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      // Admin sees all students, doctors and other professionals see only their assigned students
      const endpoint = user?.isAdmin ? '/api/students/' : '/api/students/my-assigned';
      
      const response = await axios.get(`https://autism-support-platform-production.up.railway.app${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      setLoadingRequests(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`https://autism-support-platform-production.up.railway.app/api/collaboration-requests/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyRequests(response.data);
    } catch (err: any) {
      console.error("Failed to fetch my requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Search for student by ministry code
  const handleSearchStudent = async () => {
    if (!searchMinistryCode.trim()) {
      toast.error("Please enter a ministry code");
      return;
    }

    setSearchingStudent(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://autism-support-platform-production.up.railway.app/api/students/search-for-collaboration?ministryCode=${searchMinistryCode}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSearchedStudent(response.data);
      toast.success("Student found!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Student not found");
      setSearchedStudent(null);
    } finally {
      setSearchingStudent(false);
    }
  };

  // Select searched student for collaboration
  const handleSelectSearchedStudent = () => {
    if (searchedStudent) {
      setSelectedStudent(searchedStudent);
      setSearchedStudent(null);
      setSearchMinistryCode('');
      
      // If this student is not already in the students list, add it
      if (!user?.isAdmin && !students.find(s => s._id === searchedStudent._id)) {
        setStudents(prev => [...prev, searchedStudent]);
        toast.success("Student added to your list!");
      }
    }
  };

  const checkCollaborationAccess = async () => {
    if (!selectedStudent) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://autism-support-platform-production.up.railway.app/api/collaboration-requests/access/${selectedStudent._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCollaborationAccess(response.data);
      
      // If user just got access and is not admin, refresh students list
      if (response.data.hasAccess && !user?.isAdmin) {
        fetchStudents();
      }
    } catch (err: any) {
      console.error("Failed to check collaboration access:", err);
    }
  };

  const fetchCollaborationData = async () => {
    if (!selectedStudent) return;
    
    try {
      const token = localStorage.getItem("token");
      
      // Fetch notes
      const notesResponse = await axios.get(
        `https://autism-support-platform-production.up.railway.app/api/collaboration/notes/student/${selectedStudent._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(notesResponse.data);
      
      // Fetch appointments
      const appointmentsResponse = await axios.get(
        `https://autism-support-platform-production.up.railway.app/api/collaboration/appointments?studentId=${selectedStudent._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(appointmentsResponse.data);
      
      // Fetch progress reports
      const reportsResponse = await axios.get(
        `https://autism-support-platform-production.up.railway.app/api/collaboration/progress-reports/student/${selectedStudent._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgressReports(reportsResponse.data);
    } catch (err: any) {
      console.error("Failed to fetch collaboration data:", err);
    }
  };

  const handleCreateRequest = async () => {
    if (!selectedStudent || !requestReason.trim()) {
      toast.error("Please provide a reason for the collaboration request");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://autism-support-platform-production.up.railway.app/api/collaboration-requests",
        {
          studentId: selectedStudent._id,
          requestType,
          reason: requestReason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Collaboration request submitted successfully");
      setShowRequestModal(false);
      setRequestReason('');
      checkCollaborationAccess();
      fetchMyRequests(); // Refresh the requests list
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    }
  };

  const handleCreateNote = async () => {
    if (!selectedStudent || !noteContent.trim()) {
      toast.error("Please enter note content");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://autism-support-platform-production.up.railway.app/api/collaboration/notes",
        {
          content: noteContent,
          studentId: selectedStudent._id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Note created successfully");
      setShowNoteModal(false);
      setNoteContent('');
      fetchCollaborationData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create note");
    }
  };

  const handleCreateAppointment = async () => {
    if (!selectedStudent || !appointmentForm.title || !appointmentForm.startTime || !appointmentForm.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://autism-support-platform-production.up.railway.app/api/collaboration/appointments",
        {
          ...appointmentForm,
          studentId: selectedStudent._id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Appointment created successfully");
      setShowAppointmentModal(false);
      setAppointmentForm({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        attendees: []
      });
      fetchCollaborationData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create appointment");
    }
  };

  const handleCreateReport = async () => {
    if (!selectedStudent || !reportForm.reportDate || !reportForm.category || !reportForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://autism-support-platform-production.up.railway.app/api/collaboration/progress-reports",
        {
          ...reportForm,
          studentId: selectedStudent._id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Progress report created successfully");
      setShowReportModal(false);
      setReportForm({
        reportDate: '',
        category: '',
        description: '',
        goals: '',
        achievements: '',
        nextSteps: ''
      });
      fetchCollaborationData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create progress report");
    }
  };

  const canCollaborate = () => {
    if (!user || !selectedStudent) return false;
    
    // Admins can always collaborate
    if (user.isAdmin) return true;
    
    // Check if user is assigned to this student
    const isAssignedToStudent = selectedStudent.assignedUsers?.some(
      (assignedUser: any) => assignedUser._id === user.id
    );
    
    if (isAssignedToStudent) return true;
    
    // Check if user has approved access through collaboration request
    if (collaborationAccess) {
      return collaborationAccess.hasAccess;
    }
    
    return false;
  };

  const canRequestCollaboration = () => {
    if (!user) return false;
    
    // Ministry staff cannot request collaboration
    if (user.role === 'ministry_staff') return false;
    
    // All other users can request collaboration for students they haven't created or been assigned to
    return true;
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Collaboration</h1>
        <p className="text-gray-600">Manage notes, appointments, and progress reports for students</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => {
              fetchStudents();
              toast.success("Student list refreshed!");
            }}
            className="btn-secondary text-sm"
          >
            Refresh Student List
          </button>
          {!user?.isAdmin && (
            <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
              💡 Tip: If you just got approval for a collaboration request, click "Refresh Student List" to see the student in the dropdown.
            </div>
          )}
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Important:</strong> Collaboration requests are now reviewed and approved by the platform administrator only. 
            Please submit your request and wait for admin approval before accessing collaboration features.
          </p>
        </div>
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            <strong>Student Assignment:</strong> If you are assigned to a student by an administrator, you automatically have collaboration access. 
            You can add notes, schedule appointments, and create progress reports for your assigned students.
          </p>
        </div>
      </div>

      {/* Search for Student by Ministry Code */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search for Student by Ministry Code</h2>
        <p className="text-sm text-gray-600 mb-4">
          If you know a student's ministry code, you can search for them and request collaboration access.
        </p>
        
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter ministry code"
            value={searchMinistryCode}
            onChange={(e) => setSearchMinistryCode(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleSearchStudent}
            disabled={searchingStudent}
            className="btn-primary px-6"
          >
            {searchingStudent ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {searchedStudent && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-semibold text-green-900 mb-2">Student Found</h3>
            <div className="text-sm text-green-800 mb-3">
              <p><strong>Name:</strong> {searchedStudent.name}</p>
              <p><strong>Date of Birth:</strong> {new Date(searchedStudent.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <button
              onClick={handleSelectSearchedStudent}
              className="btn-primary"
            >
              Select This Student for Collaboration
            </button>
          </div>
        )}
      </div>

      {/* Student Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Student
        </label>
        <select
          value={selectedStudent?._id || ""}
          onChange={(e) => {
            const student = students.find(s => s._id === e.target.value);
            setSelectedStudent(student || null);
          }}
          className="w-full p-3 border border-gray-300 rounded-md"
        >
          <option value="">Choose a student...</option>
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name}
            </option>
          ))}
        </select>
      </div>

      {/* My Collaboration Requests Status */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="font-semibold text-gray-900 mb-3">My Collaboration Requests</h3>
        {loadingRequests ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading requests...</p>
          </div>
        ) : myRequests.length === 0 ? (
          <p className="text-gray-500 text-sm">No collaboration requests found.</p>
        ) : (
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
            <div className="divide-y divide-gray-200">
              {myRequests.map((request) => (
                <div key={request._id} className="p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {request.student?.name || 'Unknown Student'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Ministry Code: {request.student?.ministryCode || 'N/A'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {getStatusDisplayName(request.status)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    <p><strong>Request Type:</strong> {request.requestType}</p>
                    <p><strong>Reason:</strong> {request.reason}</p>
                    <p><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                    {request.approvedBy && (
                      <p><strong>Approved by:</strong> {request.approvedBy.name}</p>
                    )}
                    {request.adminResponse && (
                      <p><strong>Admin Response:</strong> {request.adminResponse}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-3">
          <button
            onClick={() => {
              fetchMyRequests();
              toast.success("Requests refreshed!");
            }}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            Refresh Requests
          </button>
        </div>
      </div>

      {selectedStudent && (
        <>
          {/* Collaboration Access Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Collaboration Status</h3>
            <div>
              {canCollaborate() ? (
                <div>
                  {user?.isAdmin ? (
                    <p className="text-green-600">✓ Admin access - You can collaborate with all students</p>
                  ) : collaborationAccess?.reason === 'creator' ? (
                    <p className="text-green-600">✓ Creator access - You created this student and can collaborate</p>
                  ) : collaborationAccess?.reason === 'assigned' ? (
                    <p className="text-green-600">✓ Assigned access - You are assigned to this student and can collaborate</p>
                  ) : selectedStudent?.assignedUsers?.some((assignedUser: any) => assignedUser._id === user?.id) ? (
                    <p className="text-green-600">✓ Assigned access - You are assigned to this student and can collaborate</p>
                  ) : collaborationAccess?.hasAccess ? (
                    <p className="text-green-600">✓ Approved access - You have approved collaboration access</p>
                  ) : (
                    <p className="text-green-600">✓ You have access to collaborate with this student</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-red-600 mb-2">
                    ✗ You need approval to collaborate with this student
                  </p>
                  {user?.role === 'ministry_staff' || collaborationAccess?.reason === 'ministry_staff_no_access' ? (
                    <p className="text-orange-600">Ministry staff cannot submit collaboration requests. Please contact an administrator for access.</p>
                  ) : collaborationAccess?.reason === 'pending_request' ? (
                    <p className="text-yellow-600">Your request is pending approval</p>
                  ) : canRequestCollaboration() && collaborationAccess?.reason === 'no_request' ? (
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="btn-primary"
                    >
                      Request Collaboration
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Collaboration Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'notes'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Notes
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'appointments'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Appointments
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reports'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Progress Reports
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow">
            {activeTab === 'notes' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Notes</h3>
                  {canCollaborate() && (
                    <button 
                      onClick={() => setShowNoteModal(true)}
                      className="btn-primary"
                    >
                      Add Note
                    </button>
                  )}
                </div>
                {notes.length === 0 ? (
                  <p className="text-gray-500">No notes found for this student.</p>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note._id} className="border rounded-lg p-4">
                        <p className="text-gray-700 mb-2">{note.content}</p>
                        <div className="text-sm text-gray-500">
                          By {note.createdBy.name} ({note.createdBy.role}) • {new Date(note.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Appointments</h3>
                  {canCollaborate() && (
                    <button 
                      onClick={() => setShowAppointmentModal(true)}
                      className="btn-primary"
                    >
                      Schedule Appointment
                    </button>
                  )}
                </div>
                {appointments.length === 0 ? (
                  <p className="text-gray-500">No appointments found for this student.</p>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment._id} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900">{appointment.title}</h4>
                        <p className="text-gray-600 mb-2">{appointment.description}</p>
                        <div className="text-sm text-gray-500">
                          {new Date(appointment.startTime).toLocaleString()} - {new Date(appointment.endTime).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Status: {appointment.status} • Created by {appointment.createdBy.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Progress Reports</h3>
                  {canCollaborate() && (
                    <button 
                      onClick={() => setShowReportModal(true)}
                      className="btn-primary"
                    >
                      Create Report
                    </button>
                  )}
                </div>
                {progressReports.length === 0 ? (
                  <p className="text-gray-500">No progress reports found for this student.</p>
                ) : (
                  <div className="space-y-4">
                    {progressReports.map((report) => (
                      <div key={report._id} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900">{report.category}</h4>
                        <p className="text-gray-600 mb-2">{report.description}</p>
                        <div className="text-sm text-gray-500">
                          Date: {new Date(report.reportDate).toLocaleDateString()} • Created by {report.createdBy.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Collaboration Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Request Collaboration</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Type
              </label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Collaboration Types</option>
                <option value="notes">Notes Only</option>
                <option value="appointments">Appointments Only</option>
                <option value="progress_reports">Progress Reports Only</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Collaboration
              </label>
              <textarea
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Explain why you need to collaborate with this student..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateRequest}
                className="btn-primary flex-1"
              >
                Submit Request
              </button>
              <button
                onClick={() => setShowRequestModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Note</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note Content
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={6}
                placeholder="Enter your note..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateNote}
                className="btn-primary flex-1"
              >
                Create Note
              </button>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteContent('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Schedule Appointment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={appointmentForm.title}
                  onChange={(e) => setAppointmentForm({...appointmentForm, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Appointment title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={appointmentForm.description}
                  onChange={(e) => setAppointmentForm({...appointmentForm, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Appointment description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={appointmentForm.startTime}
                    onChange={(e) => setAppointmentForm({...appointmentForm, startTime: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={appointmentForm.endTime}
                    onChange={(e) => setAppointmentForm({...appointmentForm, endTime: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateAppointment}
                className="btn-primary flex-1"
              >
                Schedule Appointment
              </button>
              <button
                onClick={() => {
                  setShowAppointmentModal(false);
                  setAppointmentForm({
                    title: '',
                    description: '',
                    startTime: '',
                    endTime: '',
                    attendees: []
                  });
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Progress Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Progress Report</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Date *
                  </label>
                  <input
                    type="date"
                    value={reportForm.reportDate}
                    onChange={(e) => setReportForm({...reportForm, reportDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={reportForm.category}
                    onChange={(e) => setReportForm({...reportForm, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select category</option>
                    <option value="academic">Academic</option>
                    <option value="social">Social</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="communication">Communication</option>
                    <option value="motor">Motor Skills</option>
                    <option value="emotional">Emotional</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Describe the progress..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goals
                </label>
                <textarea
                  value={reportForm.goals}
                  onChange={(e) => setReportForm({...reportForm, goals: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={2}
                  placeholder="Enter goals..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Achievements
                </label>
                <textarea
                  value={reportForm.achievements}
                  onChange={(e) => setReportForm({...reportForm, achievements: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={2}
                  placeholder="Enter achievements..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Steps
                </label>
                <textarea
                  value={reportForm.nextSteps}
                  onChange={(e) => setReportForm({...reportForm, nextSteps: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={2}
                  placeholder="Enter next steps..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateReport}
                className="btn-primary flex-1"
              >
                Create Report
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportForm({
                    reportDate: '',
                    category: '',
                    description: '',
                    goals: '',
                    achievements: '',
                    nextSteps: ''
                  });
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 