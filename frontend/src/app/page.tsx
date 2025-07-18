'use client'

import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Autism Support Platform
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login" className="btn-secondary">
                Login
              </Link>
              <Link href="/auth/register" className="btn-primary">
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Supporting Students with Autism
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive platform connecting doctors, educators, and families to provide 
            the best support for students with autism spectrum disorders.
          </p>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Doctor Collaboration</h3>
              <p className="text-gray-600">
                Connect with specialists, share notes, and coordinate care for students.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Educational Resources</h3>
              <p className="text-gray-600">
                Access training courses, activities, and games designed for autism support.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Student Tracking</h3>
              <p className="text-gray-600">
                Monitor progress, schedule appointments, and maintain comprehensive records.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 space-x-4">
            <Link href="/auth/register" className="btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link href="/about" className="btn-secondary text-lg px-8 py-3">
              Learn More
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
} 