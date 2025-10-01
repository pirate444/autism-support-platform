'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface CourseAccessRequestProps {
  courseId: string
  courseTitle: string
  isFree: boolean
  price?: number
  onAccessGranted?: () => void
}

interface AccessStatus {
  hasAccess: boolean
  reason: 'free_course' | 'approved_request' | 'pending_request' | 'rejected_request' | 'no_request'
  adminResponse?: string
}

export default function CourseAccessRequest({ 
  courseId, 
  courseTitle, 
  isFree, 
  price, 
  onAccessGranted 
}: CourseAccessRequestProps) {
  const [accessStatus, setAccessStatus] = useState<AccessStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestReason, setRequestReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Check access status
  const checkAccess = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/course-access/check/${courseId}`,
        { headers: getAuthHeaders() }
      )
      setAccessStatus(response.data)
    } catch (error: any) {
      console.error('Error checking access:', error)
      toast.error('Failed to check course access')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAccess()
  }, [courseId])

  // Request access
  const handleRequestAccess = async () => {
    if (!requestReason.trim()) {
      toast.error('Please provide a reason for requesting access')
      return
    }

    console.log('Submitting access request for course:', courseId)
    setSubmitting(true)
    try {
      const response = await axios.post(
        'http://localhost:5000/api/course-access/request',
        {
          courseId,
          requestReason: requestReason.trim()
        },
        { headers: getAuthHeaders() }
      )
      
      console.log('Access request submitted successfully:', response.data)
      toast.success('Access request submitted successfully')
      setShowRequestModal(false)
      setRequestReason('')
      checkAccess() // Refresh access status
    } catch (error: any) {
      console.error('Error requesting access:', error)
      const message = error.response?.data?.message || 'Failed to submit access request'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    )
  }

  if (!accessStatus) {
    return null
  }

  // Free courses are always accessible
  if (isFree || accessStatus.hasAccess) {
    return (
      <button
        onClick={onAccessGranted}
        className="btn-primary text-sm px-3 py-1"
      >
        {isFree ? 'Access Course' : 'Start Learning'}
      </button>
    )
  }

  // Render the main component content
  const renderContent = () => {
    // Show different states based on access status
    switch (accessStatus.reason) {
      case 'pending_request':
        return (
          <div className="text-center">
            <div className="text-sm text-yellow-600 mb-2">
              ⏳ Access Request Pending
            </div>
            <div className="text-xs text-gray-500">
              Your request is being reviewed by admin
            </div>
          </div>
        )

      case 'rejected_request':
        return (
          <div className="text-center">
            <div className="text-sm text-red-600 mb-2">
              ❌ Access Request Rejected
            </div>
            {accessStatus.adminResponse && (
              <div className="text-xs text-gray-500 mb-2">
                Reason: {accessStatus.adminResponse}
              </div>
            )}
            <button
              onClick={() => {
                console.log('Opening request modal for rejected course:', courseTitle)
                setShowRequestModal(true)
              }}
              className="btn-secondary text-xs px-2 py-1"
            >
              Request Again
            </button>
          </div>
        )

      case 'no_request':
      default:
        return (
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">
              🔒 Paid Course
            </div>
            <div className="text-xs text-gray-500 mb-2">
              {price ? `$${price}` : 'Contact admin for pricing'}
            </div>
            <button
              onClick={() => {
                console.log('Opening request modal for course:', courseTitle)
                setShowRequestModal(true)
              }}
              className="btn-primary text-sm px-3 py-1"
            >
              Request Access
            </button>
          </div>
        )
    }
  }

  return (
    <>
      {renderContent()}
      
      {/* Request Access Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Request Access to Course
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Course: <span className="font-medium">{courseTitle}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Price: <span className="font-medium">{price ? `$${price}` : 'Contact admin'}</span>
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why do you need access to this course? *
                </label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Please explain why you need access to this course..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestAccess}
                  disabled={submitting || !requestReason.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 