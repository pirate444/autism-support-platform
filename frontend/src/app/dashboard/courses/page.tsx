'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import CourseAccessRequest from '../../../components/CourseAccessRequest'
import { useLanguage } from '../../../contexts/LanguageContext';
import DashboardLayout from '../DashboardLayout';

interface Course {
  _id: string
  title: string
  description: string
  content: string
  category: string
  duration: number
  courseType: 'text' | 'video' | 'mixed'
  videoUrl?: string
  thumbnailUrl?: string
  attachments?: Array<{
    filename: string
    originalName: string
    url: string
    fileType: string
  }>
  isPublished: boolean
  isFree?: boolean
  price?: number
  createdBy: {
    _id: string
    name: string
    role: string
  }
  createdAt: string
}

interface CourseProgress {
  _id: string
  course: Course
  isCompleted: boolean
  progress: number
  completedAt: string
  createdAt: string
}

const courseCategories = [
  'autism awareness',
  'teaching strategies',
  'behavioral management',
  'communication skills',
  'sensory integration',
  'social skills training',
  'parent support',
  'assessment methods'
]

export default function CoursesPage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([])
  const [myProgress, setMyProgress] = useState<CourseProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTitle, setSearchTitle] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPublished, setFilterPublished] = useState('')
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    duration: '',
    courseType: 'text',
    thumbnailUrl: ''
  })
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [user, setUser] = useState<any>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      const parsedUser = userData ? JSON.parse(userData) : null;
      console.log('Loaded user data:', parsedUser);
      setUser(parsedUser);
      setUserLoaded(true);
    }
  }, []);

  const isTrainer = user?.role === 'specialist_educator';

  // Get auth token and user info
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Load courses
  const loadCourses = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTitle) params.append('title', searchTitle)
      if (filterCategory) params.append('category', filterCategory)
      if (filterPublished !== '') params.append('isPublished', filterPublished)

      const response = await axios.get(
        `http://localhost:5000/api/courses/?${params.toString()}`,
        { headers: getAuthHeaders() }
      )
      setCourses(response.data)
    } catch (error: any) {
      console.error('Error loading courses:', error)
      toast.error(t('failedToLoadCourses'))
    } finally {
      setLoading(false)
    }
  }

  // Load my progress
  const loadMyProgress = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/courses/progress/user',
        { headers: getAuthHeaders() }
      )
      setMyProgress(response.data)
    } catch (error: any) {
      console.error('Error loading progress:', error)
    }
  }

  useEffect(() => {
    loadCourses()
    loadMyProgress()
  }, [searchTitle, filterCategory, filterPublished])

  // Create new course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!createForm.title || !createForm.description) {
      toast.error(t('pleaseFillRequiredFields'))
      return
    }

    try {
      const courseData = {
        ...createForm,
        duration: parseInt(createForm.duration) || 0
      }

      const response = await axios.post(
        'http://localhost:5000/api/courses/',
        courseData,
        { headers: getAuthHeaders() }
      )
      
      toast.success(t('courseCreatedSuccessfully'))
      setShowCreateForm(false)
      setCreateForm({ 
        title: '', 
        description: '', 
        content: '', 
        category: '', 
        duration: '', 
        courseType: 'text',
        thumbnailUrl: ''
      })
      loadCourses()
    } catch (error: any) {
      const message = error.response?.data?.message || t('failedToCreateCourse')
      toast.error(message)
    }
  }

  // Enroll in course
  const handleEnroll = async (courseId: string) => {
    try {
      await axios.post(
        `http://localhost:5000/api/courses/${courseId}/enroll`,
        {},
        { headers: getAuthHeaders() }
      )
      toast.success(t('enrolledSuccessfully'))
      loadMyProgress()
    } catch (error: any) {
      const message = error.response?.data?.message || t('failedToEnroll')
      toast.error(message)
    }
  }

  // Update progress
  const handleUpdateProgress = async (courseId: string, progress: number, isCompleted: boolean = false) => {
    try {
      await axios.put(
        `http://localhost:5000/api/courses/${courseId}/progress`,
        { progress, isCompleted },
        { headers: getAuthHeaders() }
      )
      toast.success(t('progressUpdated'))
      loadMyProgress()
    } catch (error: any) {
      toast.error(t('failedToUpdateProgress'))
    }
  }

  // Toggle publish status
  const handleTogglePublish = async (courseId: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/courses/${courseId}/publish`,
        {},
        { headers: getAuthHeaders() }
      )
      toast.success(t('courseStatusUpdated'))
      loadCourses()
    } catch (error: any) {
      toast.error(t('failedToUpdateCourseStatus'))
    }
  }

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setCreateForm({
      ...createForm,
      [e.target.name]: e.target.value
    })
  }

  // Upload thumbnail image
  const handleThumbnailUpload = async () => {
    if (!thumbnailFile) {
      toast.error(t('pleaseSelectThumbnailImage'))
      return
    }

    setUploadingThumbnail(true)
    try {
      const formData = new FormData()
      formData.append('thumbnail', thumbnailFile)

      const response = await axios.post(
        'http://localhost:5000/api/courses/upload/thumbnail',
        formData,
        { 
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setCreateForm(prev => ({
        ...prev,
        thumbnailUrl: response.data.thumbnailUrl
      }))
      toast.success(t('thumbnailUploadedSuccessfully'))
    } catch (error: any) {
      const message = error.response?.data?.message || t('failedToUploadThumbnail')
      toast.error(message)
    } finally {
      setUploadingThumbnail(false)
    }
  }

  const clearFilters = () => {
    setSearchTitle('')
    setFilterCategory('')
    setFilterPublished('')
  }

  const getMyProgress = (courseId: string) => {
    return myProgress.find(p => p.course._id === courseId)
  }

  const isEnrolled = (courseId: string) => {
    return myProgress.some(p => p.course._id === courseId)
  }

  if (!userLoaded || !user) return null;
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
              <strong>{t('note')}:</strong> {t('onlyTrainersCoursesNotice')}
            </p>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('searchFilterCourses')}</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('searchByTitle')}
              </label>
              <input
                type="text"
                placeholder={t('enterCourseTitle')}
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('category')}
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-field"
              >
                <option value="">{t('allCategories')}</option>
                {courseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('status')}
              </label>
              <select
                value={filterPublished}
                onChange={(e) => setFilterPublished(e.target.value)}
                className="input-field"
              >
                <option value="">{t('allCourses')}</option>
                <option value="true">{t('publishedOnly')}</option>
                <option value="false">{t('draftOnly')}</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn-secondary w-full"
              >
                {t('clearFilters')}
              </button>
            </div>
          </div>
        </div>

        {/* My Courses Section */}
        {myProgress.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('myCourses')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProgress.map((progress) => (
                <div key={progress.course._id} className="card hover:shadow-xl transition-shadow bg-gradient-to-br from-pink-100 via-yellow-100 to-blue-100 border-4 border-pink-200 rounded-3xl">
                  {/* Thumbnail with playful border */}
                  {progress.course.thumbnailUrl && (
                    <div className="mb-3 relative flex justify-center">
                      <img 
                        src={progress.course.thumbnailUrl} 
                        alt={progress.course.title}
                        className="w-28 h-28 object-cover rounded-full border-4 border-blue-200 shadow-lg"
                      />
                    </div>
                  )}
                  {/* Add a fun icon for each course */}
                  <div className="flex justify-center mb-2">
                    <span className="text-3xl">🎉</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-pink-600 mb-1 text-center drop-shadow">
                    {progress.course.title}
                  </h3>
                  <p className="text-blue-600 text-base mb-2 line-clamp-2 text-center">
                    {progress.course.description}
                  </p>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-blue-600 mb-1">
                      <span>{t('progress')}</span>
                      <span>{progress.progress}%</span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-3">
                      <div
                        className="bg-pink-400 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button
                    className="btn-primary w-full mt-2 text-lg font-bold rounded-full shadow-md hover:bg-pink-500 transition-colors"
                    onClick={() => {
                      window.location.href = `/dashboard/course-player/${progress.course._id}`
                    }}
                  >
                    🚀 {t('continue')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses List */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('availableCourses')}</h2>
            <span className="text-sm text-gray-600">
              {courses.filter(course => course.isPublished || (user && user.id === course.createdBy._id)).length} {t('course', { count: courses.filter(course => course.isPublished || (user && user.id === course.createdBy._id)).length })}{courses.filter(course => course.isPublished || (user && user.id === course.createdBy._id)).length !== 1 ? t('pluralS') : ''} {t('found')}
            </span>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t('loadingCourses')}</p>
            </div>
          ) : courses.filter(course => course.isPublished || (user && user.id === course.createdBy._id)).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">{t('noCoursesFound')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.filter(course => course.isPublished || (user && user.id === course.createdBy._id)).map((course) => {
                const enrolled = isEnrolled(course._id);
                const progress = getMyProgress(course._id);
                return (
                  <div key={course._id} className="card hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 border-4 border-blue-200 rounded-3xl">
                    {/* Video Thumbnail with playful border */}
                    {course.thumbnailUrl && (
                      <div className="mb-3 relative flex justify-center">
                        <img 
                          src={course.thumbnailUrl} 
                          alt={course.title}
                          className="w-28 h-28 object-cover rounded-full border-4 border-pink-200 shadow-lg"
                        />
                        {course.courseType === 'video' && (
                          <div className="absolute top-2 right-2 bg-yellow-300 bg-opacity-80 text-blue-900 px-2 py-1 rounded-full text-xs shadow">
                            🎥 {t('videoCourse')}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Add a fun icon for each course */}
                    <div className="flex justify-center mb-2">
                      <span className="text-3xl">🌈</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-extrabold text-blue-600 drop-shadow">
                        {course.title}
                      </h3>
                      <div className="flex gap-2">
                        {course.courseType === 'video' && (
                          <span className="text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded-full shadow">
                            🎥 {t('video')}
                          </span>
                        )}
                        {course.courseType === 'mixed' && (
                          <span className="text-xs bg-pink-200 text-pink-900 px-2 py-1 rounded-full shadow">
                            📚 {t('mixed')}
                          </span>
                        )}
                        {!course.isPublished && (
                          <span className="text-xs bg-yellow-200 text-yellow-900 px-2 py-1 rounded-full shadow">
                            {t('draft')}
                          </span>
                        )}
                        {enrolled && (
                          <span className="text-xs bg-green-200 text-green-900 px-2 py-1 rounded-full shadow">
                            {t('enrolled')}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-pink-600 text-base mb-3 line-clamp-2 text-center">
                      {course.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      {course.category && (
                        <div className="text-xs text-blue-500">
                          {t('category')}: {course.category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </div>
                      )}
                      {course.duration > 0 && (
                        <div className="text-xs text-pink-500">
                          {t('duration')}: {course.duration} {t('minutes')}
                        </div>
                      )}
                      <div className="text-xs text-blue-500">
                        {t('by')}: {course.createdBy.name} ({course.createdBy.role.replace('_', ' ')})
                      </div>
                      <div className="text-xs text-pink-500">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                      {/* Pricing Information */}
                      <div className="text-xs">
                        {course.isFree ? (
                          <span className="text-green-600 font-bold">🆓 {t('freeCourse')}</span>
                        ) : (
                          <span className="text-blue-600 font-bold">💰 ${course.price} USD</span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for Enrolled Users */}
                    {enrolled && progress && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-blue-600 mb-1">
                          <span>{t('progress')}</span>
                          <span>{progress.progress}%</span>
                        </div>
                        <div className="w-full bg-yellow-200 rounded-full h-3">
                          <div
                            className="bg-pink-400 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap justify-center">
                      {!enrolled && course.isPublished ? (
                        <CourseAccessRequest
                          courseId={course._id}
                          courseTitle={course.title}
                          isFree={course.isFree || false}
                          price={course.price}
                          onAccessGranted={() => handleEnroll(course._id)}
                        />
                      ) : enrolled ? (
                        <button
                          onClick={() => handleUpdateProgress(course._id, Math.min(100, (progress?.progress || 0) + 25))}
                          className="btn-primary text-lg px-4 py-2 rounded-full shadow-md"
                        >
                          🎯 {t('updateProgress')}
                        </button>
                      ) : null}

                      {isTrainer && user && user.id === course.createdBy._id && (
                        <button
                          onClick={() => handleTogglePublish(course._id)}
                          className="btn-secondary text-lg px-4 py-2 rounded-full shadow-md"
                        >
                          {course.isPublished ? t('unpublish') : t('publish')}
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          setSelectedCourse(course)
                          setShowCourseModal(true)
                        }}
                        className="btn-secondary text-lg px-4 py-2 rounded-full shadow-md"
                      >
                        🧐 {t('viewDetails')}
                      </button>
                      {user && user.id === course.createdBy._id && (
                        <a
                          href={`/dashboard/courses/builder/${course._id}`}
                          className="btn-primary text-lg px-4 py-2 rounded-full shadow-md"
                          style={{ textDecoration: 'none' }}
                        >
                          🛠️ {t('builder')}
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* My Progress Summary */}
        {myProgress.length > 0 && (
          <div className="card mt-8">
            <h3 className="text-lg font-semibold mb-4">{t('myLearningProgress')}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {myProgress.length}
                </div>
                <div className="text-sm text-gray-600">{t('enrolledCourses')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {myProgress.filter(p => p.isCompleted).length}
                </div>
                <div className="text-sm text-gray-600">{t('completed')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(myProgress.reduce((sum, p) => sum + p.progress, 0) / myProgress.length)}%
                </div>
                <div className="text-sm text-gray-600">{t('averageProgress')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Course Detail Modal */}
        {showCourseModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCourse.title}
                  </h2>
                  <button
                    onClick={() => setShowCourseModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Video Player */}
                {selectedCourse.videoUrl && (
                  <div className="mb-6">
                    <video
                      controls
                      className="w-full h-64 md:h-96 bg-black rounded-lg"
                      poster={selectedCourse.thumbnailUrl}
                      onError={(e) => {
                        console.error('Video loading error:', e);
                        toast.error(t('failedToLoadVideo'));
                      }}
                    >
                      <source src={selectedCourse.videoUrl} type="video/mp4" />
                      <source src={selectedCourse.videoUrl} type="video/webm" />
                      <source src={selectedCourse.videoUrl} type="video/ogg" />
                      {t('browserNoVideoSupport')}
                    </video>
                    {selectedCourse.videoUrl && (
                      <p className="text-sm text-gray-600 mt-2">
                        {t('videoUrl')}: {selectedCourse.videoUrl}
                      </p>
                    )}
                  </div>
                )}

                {/* Course Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('courseInformation')}</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>{t('description')}:</strong> {selectedCourse.description}</p>
                      {selectedCourse.category && (
                        <p><strong>{t('category')}:</strong> {selectedCourse.category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                      )}
                      {selectedCourse.duration > 0 && (
                        <p><strong>{t('duration')}:</strong> {selectedCourse.duration} {t('minutes')}</p>
                      )}
                      <p><strong>{t('type')}:</strong> {selectedCourse.courseType ? selectedCourse.courseType.charAt(0).toUpperCase() + selectedCourse.courseType.slice(1) : t('na')}</p>
                      <p><strong>{t('pricing')}:</strong> {selectedCourse.isFree ? t('freeCourse') : `💰 $${selectedCourse.price} USD`}</p>
                      <p><strong>{t('createdBy')}:</strong> {selectedCourse.createdBy.name}</p>
                      <p><strong>{t('created')}:</strong> {new Date(selectedCourse.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('courseContent')}</h3>
                    {selectedCourse.content ? (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="whitespace-pre-wrap text-sm">{selectedCourse.content}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">{t('noAdditionalContent')}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {!isEnrolled(selectedCourse._id) && selectedCourse.isPublished ? (
                    <button
                      onClick={() => {
                        handleEnroll(selectedCourse._id)
                        setShowCourseModal(false)
                      }}
                      className="btn-primary"
                    >
                      {t('enrollInCourse')}
                    </button>
                  ) : isEnrolled(selectedCourse._id) ? (
                    <button
                      onClick={() => {
                        const progress = getMyProgress(selectedCourse._id)
                        if (progress) {
                          handleUpdateProgress(selectedCourse._id, Math.min(100, (progress.progress || 0) + 25))
                        }
                        setShowCourseModal(false)
                      }}
                      className="btn-primary"
                    >
                      {t('updateProgress')}
                    </button>
                  ) : null}
                  
                  <button
                    onClick={() => setShowCourseModal(false)}
                    className="btn-secondary"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 