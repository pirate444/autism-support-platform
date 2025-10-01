'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useLanguage } from '../../../contexts/LanguageContext';
import LanguageSwitcher from '../../../components/LanguageSwitcher'
import DashboardLayout from '../DashboardLayout';

interface Activity {
  _id: string
  title: string
  description: string
  type: string
  category: string
  fileUrl: string
  createdBy: {
    _id: string
    name: string
    role: string
  }
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

const activityTypes = [
  'game',
  'activity',
  'pdf',
  'video',
  'worksheet'
]

const activityCategories = [
  'social skills',
  'educational puzzle',
  'communication',
  'behavioral',
  'sensory',
  'motor skills',
  'cognitive',
  'emotional regulation'
]

export default function ActivitiesPage() {
  const { t } = useLanguage();
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [searchTitle, setSearchTitle] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: '',
    category: '',
    fileUrl: ''
  })
  const [uploadingFile, setUploadingFile] = useState(false)

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  // Check if user is a trainer
  const isTrainer = user?.role === 'specialist_educator'

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Load activities
  const loadActivities = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTitle) params.append('title', searchTitle)
      if (filterType) params.append('type', filterType)
      if (filterCategory) params.append('category', filterCategory)

      const response = await axios.get(
        `http://localhost:5000/api/activities/?${params.toString()}`,
        { headers: getAuthHeaders() }
      )
      setActivities(response.data)
    } catch (error: any) {
      console.error('Error loading activities:', error)
      toast.error('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivities()
  }, [searchTitle, filterType, filterCategory])

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(
        'http://localhost:5000/api/upload/',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      setUploadForm({
        ...uploadForm,
        fileUrl: response.data.fileUrl
      })
      toast.success('File uploaded successfully!')
    } catch (error: any) {
      toast.error('Failed to upload file')
    } finally {
      setUploadingFile(false)
    }
  }

  // Create new activity
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!uploadForm.title || !uploadForm.description || !uploadForm.type) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/activities/',
        uploadForm,
        { headers: getAuthHeaders() }
      )
      
      toast.success('Activity created successfully!')
      setShowUploadForm(false)
      setUploadForm({ title: '', description: '', type: '', category: '', fileUrl: '' })
      loadActivities()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create activity'
      toast.error(message)
    }
  }

  const handleUploadFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUploadForm({
      ...uploadForm,
      [e.target.name]: e.target.value
    })
  }

  const clearFilters = () => {
    setSearchTitle('')
    setFilterType('')
    setFilterCategory('')
  }

  const getTypeDisplayName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getCategoryDisplayName = (category: string) => {
    return category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

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
        {/* Notice for non-trainers */}
        {!isTrainer && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>{t('note')}:</strong> {t('onlyTrainersNotice')}
            </p>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="card mb-8">
          <div className="flex justify-center mb-2">
            <span className="text-3xl">🎲</span>
          </div>
          <h2 className="text-xl font-extrabold text-pink-600 mb-4 text-center drop-shadow">{t('searchFilterActivities')}</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('searchByTitle')}
              </label>
              <input
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder={t('searchActivitiesPlaceholder')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('filterByType')}
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field"
              >
                <option value="">{t('allTypes')}</option>
                {activityTypes.map(type => (
                  <option key={type} value={type}>{getTypeDisplayName(type)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('filterByCategory')}
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-field"
              >
                <option value="">{t('allCategories')}</option>
                {activityCategories.map(category => (
                  <option key={category} value={category}>{getCategoryDisplayName(category)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn-secondary w-full text-lg px-4 py-2 rounded-full shadow-md"
              >
                <span className="text-lg">🧹 {t('clearFilters')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="card mb-8 bg-gradient-to-br from-pink-100 via-yellow-100 to-blue-100 border-4 border-pink-200 rounded-3xl">
            <div className="flex justify-center mb-2">
              <span className="text-3xl">🪁</span>
            </div>
            <h2 className="text-xl font-extrabold text-pink-600 mb-4 text-center drop-shadow">{t('uploadNewActivity')}</h2>
            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('title')} *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={uploadForm.title}
                    onChange={handleUploadFormChange}
                    className="input-field"
                    placeholder={t('enterActivityTitle')}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('type')} *
                  </label>
                  <select
                    name="type"
                    value={uploadForm.type}
                    onChange={handleUploadFormChange}
                    className="input-field"
                    required
                  >
                    <option value="">{t('selectType')}</option>
                    {activityTypes.map((type) => (
                      <option key={type} value={type}>
                        {getTypeDisplayName(type)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('description')} *
                </label>
                <textarea
                  name="description"
                  value={uploadForm.description}
                  onChange={handleUploadFormChange}
                  className="input-field"
                  rows={3}
                  placeholder={t('describeActivityPlaceholder')}
                  required
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('category')}
                  </label>
                  <select
                    name="category"
                    value={uploadForm.category}
                    onChange={handleUploadFormChange}
                    className="input-field"
                  >
                    <option value="">{t('selectCategory')}</option>
                    {activityCategories.map((category) => (
                      <option key={category} value={category}>
                        {getCategoryDisplayName(category)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('uploadFile')}
                  </label>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="input-field"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                    disabled={uploadingFile}
                  />
                  {uploadingFile && (
                    <p className="text-sm text-gray-600 mt-1">{t('uploading')}</p>
                  )}
                  {uploadForm.fileUrl && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">✓ {t('fileUploaded')}</p>
                      {/* Show preview for images */}
                      {/(.jpg|.jpeg|.png|.gif)$/i.test(uploadForm.fileUrl) && (
                        <img src={uploadForm.fileUrl} alt="Preview" style={{ maxWidth: 200, marginTop: 8 }} />
                      )}
                      {/* Show preview for videos */}
                      {/(.mp4|.webm|.ogg)$/i.test(uploadForm.fileUrl) && (
                        <video src={uploadForm.fileUrl} controls style={{ maxWidth: 300, marginTop: 8 }} />
                      )}
                      {/* Download link for other files */}
                      {!/(.jpg|.jpeg|.png|.gif|.mp4|.webm|.ogg)$/i.test(uploadForm.fileUrl) && (
                        <a href={uploadForm.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          {t('downloadFile')}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4">
                <button type="submit" className="btn-primary">
                  {t('createActivity')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="btn-secondary"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Activities List */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('educationalResources')}</h2>
            <span className="text-sm text-gray-600">
              {activities.length} {t('resource', { count: activities.length })}{activities.length !== 1 ? t('pluralS') : ''} {t('found')}
            </span>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t('loadingActivities')}</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">{t('noActivitiesFound')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <div key={activity._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {activity.title}
                    </h3>
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                      {getTypeDisplayName(activity.type)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {activity.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {activity.category && (
                      <div className="text-xs text-gray-500">
                        {t('category')}: {getCategoryDisplayName(activity.category)}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {t('by')}: {activity.createdBy.name} ({getTypeDisplayName(activity.createdBy.role)})
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {activity.fileUrl && (
                      <a
                        href={`${activity.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm px-3 py-1"
                      >
                        {t('download')}
                      </a>
                    )}
                    <button className="btn-secondary text-sm px-3 py-1">
                      {t('viewDetails')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
} 