'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sidebarLinks = [
  { href: '/dashboard', label: 'Community News', icon: '📰' },
  { href: '/dashboard/students', label: 'Students', icon: '🧑‍🎓' },
  { href: '/dashboard/doctors', label: 'Doctors', icon: '👨‍⚕️👩‍⚕️' },
  { href: '/dashboard/activities', label: 'Activities', icon: '🧩' },
  { href: '/dashboard/collaboration', label: 'Collaboration', icon: '🤝' },
  { href: '/dashboard/courses', label: 'Courses', icon: '📘' },
  { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
  { href: '/dashboard/chat', label: 'Messages', icon: '✉️' },
];

export default function DashboardLayout({ user, notificationCount, unreadCount, handleLogout, children }: any) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-[#fffdf5]">
      {/* Sidebar */}
      <aside className="w-64 bg-unia-purple-light shadow-xl flex flex-col py-8 px-0 z-10 border-r border-purple-200">
        <div className="px-6 mb-8 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <h2 className="text-3xl font-black text-unia-purple tracking-tight">Dashboard</h2>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {sidebarLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} 
                className={`flex items-center gap-3 py-3 px-4 rounded-xl font-bold transition-all ${
                  isActive 
                    ? 'bg-purple-200 text-purple-900 shadow-sm' 
                    : 'text-gray-700 hover:bg-purple-100 hover:text-purple-800'
                }`}>
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
          
          {user?.isAdmin && (
            <div className="mt-6 border-t border-purple-200 pt-4 space-y-1">
              <Link href="/dashboard/admin" 
                className={`flex items-center gap-3 py-3 px-4 rounded-xl font-bold transition-all ${
                  pathname === '/dashboard/admin' ? 'bg-red-100 text-red-800 shadow-sm' : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
                }`}>
                <span className="text-xl">⚙️</span> Admin Dashboard
              </Link>
              <Link href="/dashboard/collaboration-requests" 
                className={`flex items-center gap-3 py-3 px-4 rounded-xl font-bold transition-all ${
                  pathname === '/dashboard/collaboration-requests' ? 'bg-blue-100 text-blue-800 shadow-sm' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}>
                <span className="text-xl">📄</span> Collab Requests
              </Link>
            </div>
          )}
        </div>
        
        <div className="px-4 mt-6">
          <button onClick={handleLogout} className="w-full py-3 px-4 bg-white text-gray-700 font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left flex items-center gap-3">
            <span className="text-xl">🚪</span> Logout
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-100/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
}
