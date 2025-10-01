'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import axios from 'axios'
import { apiUrl } from '../../utils/api'
import { useLanguage } from '../../contexts/LanguageContext'

interface User {
  id: string
  name: string
  email: string
  role: string
  isAdmin?: boolean
}

interface Post {
  _id: string
  title: string
  content: string
  category: string
  author: {
    _id: string
    name: string
    role: string
    avatar?: string
    specialization?: string
  }
  media: Array<{
    type: 'image' | 'video'
    url: string
    alt?: string
    caption?: string
  }>
  tags: string[]
  likes: Array<{
    user: string
    likedAt: string
  }>
  likeCount: number
  viewCount: number
  featured: boolean
  createdAt: string
  updatedAt: string
}

interface Category {
  value: string
  label: string
}

export default function NewsFeedPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [newPostsCount, setNewPostsCount] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    loadCategories()
    loadPosts()
    loadNewPostsCount()
  }, [])

  useEffect(() => {
    loadPosts()
  }, [selectedCategory, searchTerm, currentPage])

  const loadCategories = async () => {
    try {
      const response = await axios.get(apiUrl('/api/posts/categories'))
      setCategories(response.data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })

      if (selectedCategory) {
        params.append('category', selectedCategory)
      }

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await axios.get(apiUrl(`/api/posts?${params}`))
      setPosts(response.data.posts)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error loading posts:', error)
      toast.error('Error loading posts')
    } finally {
      setLoading(false)
    }
  }

  const loadNewPostsCount = async () => {
    try {
      const response = await axios.get(apiUrl('/api/posts/new-count'))
      setNewPostsCount(response.data.newPostsCount)
    } catch (error) {
      console.error('Error loading new posts count:', error)
    }
  }

  const handleLike = async (postId: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please log in to like posts')
      return
    }

    try {
      const response = await axios.post(
        apiUrl(`/api/posts/${postId}/like`),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Update the post in the state
      setPosts(posts.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              likeCount: response.data.likeCount,
              likes: response.data.isLiked 
                ? [...post.likes, { user: user?.id || '', likedAt: new Date().toISOString() }]
                : post.likes.filter(like => like.user !== user?.id)
            }
          : post
      ))

      toast.success(response.data.message)
    } catch (error) {
      console.error('Error liking post:', error)
      toast.error('Error liking post')
    }
  }

  const canCreatePosts = user && !['parent', 'ministry_staff'].includes(user.role)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find(cat => cat.value === categoryValue)
    return category ? category.label : categoryValue
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      news_articles: 'bg-blue-100 text-blue-800',
      expert_advice: 'bg-green-100 text-green-800',
      research_updates: 'bg-purple-100 text-purple-800',
      success_stories: 'bg-yellow-100 text-yellow-800',
      event_announcements: 'bg-red-100 text-red-800',
      educational_content: 'bg-indigo-100 text-indigo-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const isPostLiked = (post: Post) => {
    return user ? post.likes.some(like => like.user === user.id) : false
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-indigo-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🌟</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Community News Feed
                </h1>
              </Link>
              {newPostsCount > 0 && (
                <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium">✨ {newPostsCount} new posts!</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700 font-medium">Welcome, {user.name}!</span>
                  <Link href="/dashboard" className="btn-primary">
                    Dashboard
                  </Link>
                </>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/auth/login" className="btn-secondary">
                    Login
                  </Link>
                  <Link href="/auth/register" className="btn-primary">
                    Join Community
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-indigo-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-indigo-400">🔍</span>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-1 max-w-md">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Create Post Button */}
            {canCreatePosts && (
              <Link href="/news-feed/create" className="btn-primary whitespace-nowrap">
                ✨ Create Post
              </Link>
            )}
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100 overflow-hidden group">
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {post.author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
                        <p className="text-sm text-gray-500">{post.author.specialization || post.author.role}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                      {getCategoryLabel(post.category)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {post.content}
                  </p>
                </div>

                {/* Media */}
                {post.media.length > 0 && (
                  <div className="px-6 pb-4">
                    <div className="grid gap-2">
                      {post.media.slice(0, 2).map((media, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden">
                          {media.type === 'image' ? (
                            <img
                              src={media.url}
                              alt={media.alt || post.title}
                              className="w-full h-32 object-cover"
                            />
                          ) : (
                            <video
                              src={media.url}
                              className="w-full h-32 object-cover"
                              controls
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Post Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-indigo-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          isPostLiked(post) 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                        }`}
                      >
                        <span className="text-lg">{isPostLiked(post) ? '❤️' : '🤍'}</span>
                        <span className="text-sm font-medium">{post.likeCount}</span>
                      </button>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <span className="text-sm">👁️</span>
                        <span className="text-sm">{post.viewCount}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-indigo-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-indigo-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}



