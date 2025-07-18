'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface NotificationBadgeProps {
  count: number
  className?: string
}

export default function NotificationBadge({ count, className = '' }: NotificationBadgeProps) {
  if (count === 0) return null

  return (
    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full ${className}`}>
      {count > 99 ? '99+' : count}
    </span>
  )
} 