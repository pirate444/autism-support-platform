'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

const roles = [
  { value: 'child_psychiatrist', label: 'Child Psychiatrist' },
  { value: 'specialist_educator', label: 'Specialist Educator' },
  { value: 'occupational_therapist', label: 'Occupational Therapist' },
  { value: 'psychologist', label: 'Psychologist' },
  { value: 'school_support_assistant', label: 'School Support Assistant' },
  { value: 'speech_therapist', label: 'Speech Therapist' },
  { value: 'parent', label: 'Parent/Guide' },
  { value: 'ministry_staff', label: 'Ministry Staff' }
]

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    specialization: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Sending registration data:', formData)
      const response = await axios.post('http://localhost:5000/api/auth/register', formData)
      
      console.log('Registration response:', response.data)
      
      // Clear any existing session data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Auto-login the user after successful registration
      try {
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password
        })
        
        // Store token and user data
        localStorage.setItem('token', loginResponse.data.token)
        localStorage.setItem('user', JSON.stringify(loginResponse.data.user))
        
        toast.success('Account created and logged in successfully!')
        router.push('/dashboard')
      } catch (loginError: any) {
        console.error('Auto-login error:', loginError)
        // If auto-login fails, redirect to login page
        toast.success(`Account created successfully! Please sign in with ${formData.email}`)
        router.push('/auth/login')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      console.error('Error response:', error.response?.data)
      
      let message = 'Registration failed'
      if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (error.message) {
        message = error.message
      }
      
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Optional: Auto-login after registration
  const handleAutoLogin = async () => {
    setLoading(true)
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      })
      
      // Store token and user data
      localStorage.setItem('token', loginResponse.data.token)
      localStorage.setItem('user', JSON.stringify(loginResponse.data.user))
      
      toast.success('Registration and login successful!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Auto-login error:', error)
      toast.error('Registration successful, but auto-login failed. Please sign in manually.')
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your existing account
            </Link>
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Admin accounts are created separately. 
              Contact your platform administrator for admin access.
            </p>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field mt-1"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field mt-1"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input-field mt-1"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className="input-field mt-1"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Select your role</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                Specialization (Optional)
              </label>
              <input
                id="specialization"
                name="specialization"
                type="text"
                className="input-field mt-1"
                placeholder="Enter your specialization"
                value={formData.specialization}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center py-3"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 