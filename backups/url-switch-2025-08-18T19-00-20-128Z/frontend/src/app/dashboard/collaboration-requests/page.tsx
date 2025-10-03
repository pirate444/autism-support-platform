"use client"

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { apiUrl, getAuthHeaders } from '../../../utils/api';

interface CollaborationRequest {
  _id: string;
  requester: {
    _id: string;
    name: string;
    email: string;
    role: string;
    specialization?: string;
  };
  student: {
    _id: string;
    name: string;
  };
  requestType: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  approvedBy?: {
    name: string;
  };
  approvedAt?: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isAdmin?: boolean;
}

export default function CollaborationRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [adminResponse, setAdminResponse] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if user is admin for admin features
      if (parsedUser.isAdmin) {
        fetchAllRequests();
      } else {
        fetchMyRequests();
      }
    }
  }, []);

  const fetchAllRequests = async () => {
    try {
      const response = await axios.get<CollaborationRequest[]>(
        apiUrl('/api/collaboration-requests/all'),
        { headers: getAuthHeaders() }
      );
      setRequests(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await axios.get<CollaborationRequest[]>(
        apiUrl('/api/collaboration-requests/my'),
        { headers: getAuthHeaders() }
      );
      setRequests(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        apiUrl(`/api/collaboration-requests/${requestId}/status`),
        {
          status,
          adminResponse: adminResponse || undefined
        },
        { headers: getAuthHeaders() }
      );
      
      toast.success(`Request ${status}`);
      setAdminResponse("");
      if (user?.isAdmin) {
        fetchAllRequests();
      } else {
        fetchMyRequests();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update request");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  // Check if user is admin for admin features
  const isAdmin = user?.isAdmin;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isAdmin ? "Collaboration Requests (Admin)" : "My Collaboration Requests"}
        </h1>
        <p className="text-gray-600">
          {isAdmin 
            ? "Review and manage all collaboration requests from healthcare professionals" 
            : "Track your collaboration requests with students"
          }
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => isAdmin ? fetchAllRequests() : fetchMyRequests()}
            className="btn-secondary text-sm"
          >
            Refresh Requests
          </button>
          {isAdmin && (
            <button
              onClick={() => router.push('/dashboard/admin')}
              className="btn-primary text-sm"
            >
              Admin Dashboard
            </button>
          )}
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No collaboration requests found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isAdmin 
                      ? `${request.requester?.name || "Unknown User"} → ${request.student?.name || "Unknown Student"}`
                      : `Request for ${request.student?.name || "Unknown Student"}`
                    }
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isAdmin 
                      ? `${request.requester?.role || "Unknown Role"} • ${request.requester?.specialization || 'No specialization'}`
                      : `Request Type: ${request.requestType.replace('_', ' ')}`
                    }
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 mb-2"><strong>Reason:</strong></p>
                <p className="text-gray-600 bg-gray-50 p-3 rounded">{request.reason}</p>
              </div>

              {request.adminResponse && (
                <div className="mb-4">
                  <p className="text-gray-700 mb-2"><strong>Admin Response:</strong></p>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">{request.adminResponse}</p>
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Requested: {formatDate(request.createdAt)}</span>
                {request.approvedBy && (
                  <span>Approved by: {request.approvedBy.name} on {formatDate(request.approvedAt!)}</span>
                )}
              </div>

              {isAdmin && request.status === "pending" && (
                <div className="mt-4 pt-4 border-t">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Response (optional):
                    </label>
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Add a response to the requester..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleStatusUpdate(request._id, 'approved')}
                      className="btn-primary"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(request._id, 'rejected')}
                      className="btn-secondary bg-red-600 hover:bg-red-700 text-white"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 