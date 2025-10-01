import React from 'react';
import Link from 'next/link';

const sidebarLinks = [
  { href: '/dashboard', label: '📰 Community News' },
  { href: '/dashboard/students', label: 'Students' },
  { href: '/dashboard/doctors', label: 'Doctors' },
  { href: '/dashboard/activities', label: 'Activities & Games' },
  { href: '/dashboard/collaboration', label: 'Collaboration' },
  { href: '/dashboard/courses', label: 'Courses' },
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/chat', label: 'Messages' },
];

export default function DashboardLayout({ user, handleLogout, children }: any) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col py-8 px-4 space-y-2">
        <h2 className="text-2xl font-bold text-indigo-700 mb-8">Dashboard</h2>
        {sidebarLinks.map(link => (
          <Link key={link.href} href={link.href} className="block py-2 px-3 rounded-lg hover:bg-indigo-50 text-gray-800 font-medium">
            {link.label}
          </Link>
        ))}
        {user?.isAdmin && (
          <>
            <div className="mt-6 border-t pt-4">
              <Link href="/dashboard/admin" className="block py-2 px-3 rounded-lg hover:bg-red-50 text-red-700 font-semibold">Admin Dashboard</Link>
              <Link href="/dashboard/collaboration-requests" className="block py-2 px-3 rounded-lg hover:bg-blue-50 text-blue-700 font-semibold">Collaboration Requests</Link>
            </div>
          </>
        )}
        <button onClick={handleLogout} className="mt-auto btn-secondary w-full">Logout</button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

