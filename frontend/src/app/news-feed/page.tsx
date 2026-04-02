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

  const isPostLiked = (post: Post) => {
    return user ? post.likes.some(like => like.user === user.id) : false
  }

  const getUniaGradient = (index: number) => {
    const gradients = [
      'bg-unia-gradient-primary text-white', // Purple/Pink
      'bg-gradient-to-r from-blue-400 to-sky-300 text-white', // Blue
      'bg-gradient-to-r from-green-400 to-emerald-300 text-white', // Green
      'bg-gradient-to-r from-orange-400 to-amber-300 text-white', // Orange
    ]
    return gradients[index % gradients.length]
  }

  return (
    <div className="bg-transparent">
      {/* Inline Header */}
      <div className="flex justify-between items-center mb-8 px-2">
        <h1 className="text-3xl font-black text-unia-purple tracking-tight flex items-center gap-3">
          <span className="text-4xl animate-spin-slow">☀️</span> Community News Feed
        </h1>
        {newPostsCount > 0 && (
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-purple-100 animate-pulse text-unia-purple font-bold">
            ✨ {newPostsCount} new posts!
          </div>
        )}
        <div className="text-lg text-slate-800 font-bold hidden sm:block">
          {user ? `Welcome, ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}!` : 'Welcome!'}
        </div>
      </div>
        {/* Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-12"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-2xl">
                  🔍
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-1 max-w-md">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
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

        {/* Posts List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-6xl animate-bounce">🦋</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-2xl">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post, index) => {
              const gradientClass = getUniaGradient(index);
              return (
              <article key={post._id} className={`rounded-[2rem] shadow-unia-card hover:shadow-unia-card-hover transition-all duration-300 border-none overflow-hidden group ${gradientClass} p-6 pb-4`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm pr-4 rounded-full pl-1 py-1">
                    <div className="w-10 h-10 bg-white text-slate-800 rounded-full flex items-center justify-center font-black shadow-sm text-xl">
                      {post.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg leading-tight">{post.author.name}</h4>
                      <p className="text-xs text-white/90 font-semibold">{post.author.specialization || post.author.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-white/90 flex items-center gap-1 mb-1">
                      📅 {formatDate(post.createdAt).split(' ')[0]} {formatDate(post.createdAt).split(' ')[1]}
                    </span>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-[1.5rem] p-6 text-slate-800 shadow-sm relative mt-2">
                  <h3 className="text-2xl font-black mb-3">
                    {post.title}
                  </h3>
                  <p className="font-medium text-lg leading-snug mb-4">
                    {post.content}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-4 py-1.5 bg-white shadow-sm text-slate-700 text-sm font-bold rounded-full border border-gray-100 italic">
                        #{getCategoryLabel(post.category)}
                      </span>
                      {post.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-4 py-1.5 bg-white shadow-sm text-slate-700 text-sm font-bold rounded-full border border-gray-100 italic">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 border-l-2 border-slate-200 pl-4">
                       <button
                         onClick={() => handleLike(post._id)}
                         className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm hover:scale-105 transition-all outline outline-1 outline-gray-200"
                       >
                         <span className="text-xl">{isPostLiked(post) ? '❤️' : '🤍'}</span>
                         <span className="text-lg font-bold text-slate-700">{post.likeCount}</span>
                       </button>
                    </div>
                  </div>
                  
                  {post.media && post.media.length > 0 && (
                    <div className="mt-4 grid gap-2">
                      {post.media.slice(0, 2).map((media, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                          {media.type === 'image' ? (
                            <img
                              src={media.url}
                              alt={media.alt || post.title}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <video
                              src={media.url}
                              className="w-full h-48 object-cover"
                              controls
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </article>
            );
          })}
        </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10">
            <div className="flex space-x-2 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-6 py-2 btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-12 h-12 rounded-full font-bold flex items-center justify-center transition-all ${
                    currentPage === page ? 'bg-unia-purple text-white shadow-md' : 'text-slate-600 hover:bg-unia-purple-light'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-6 py-2 btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
  )
}



