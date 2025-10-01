'use client';

import React, { useState, useEffect } from 'react';

// Interactive Sound Button Component
export const SoundButton = ({ soundType = 'success', children, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playSound = () => {
    setIsPlaying(true);
    
    // Create audio context for web audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different sound patterns for different types
    switch (soundType) {
      case 'success':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        break;
      case 'click':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05);
        break;
      case 'notification':
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
        break;
      default:
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
    
    setTimeout(() => setIsPlaying(false), 200);
  };

  return (
    <button
      onClick={playSound}
      className={`relative overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 ${className}`}
      disabled={isPlaying}
    >
      {children}
      {isPlaying && (
        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
      )}
    </button>
  );
};

// Animated Progress Circle Component
export const ProgressCircle = ({ progress, size = 120, strokeWidth = 8, color = '#8b5cf6' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-block">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-purple-700">{progress}%</span>
      </div>
    </div>
  );
};

// Interactive Achievement Badge with Animation
export const InteractiveAchievementBadge = ({ 
  icon, 
  title, 
  description, 
  earned = false, 
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (onClick) {
      setIsClicked(true);
      onClick();
      setTimeout(() => setIsClicked(false), 300);
    }
  };

  return (
    <div
      className={`relative p-6 rounded-2xl text-center transition-all duration-300 cursor-pointer ${
        earned 
          ? 'bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg' 
          : 'bg-gray-200 opacity-60'
      } ${isHovered ? 'scale-105' : ''} ${isClicked ? 'scale-95' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className={`text-5xl mb-3 transition-transform duration-300 ${
        earned ? 'animate-bounce' : ''
      } ${isHovered ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <h4 className="font-bold text-gray-800 mb-2 text-lg">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
      
      {/* Sparkle effect when earned */}
      {earned && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 text-yellow-500 animate-sparkle">✨</div>
          <div className="absolute top-2 right-2 text-yellow-500 animate-sparkle" style={{ animationDelay: '0.5s' }}>✨</div>
          <div className="absolute bottom-2 left-2 text-yellow-500 animate-sparkle" style={{ animationDelay: '1s' }}>✨</div>
          <div className="absolute bottom-2 right-2 text-yellow-500 animate-sparkle" style={{ animationDelay: '1.5s' }}>✨</div>
        </div>
      )}
    </div>
  );
};

// Sensory-Friendly Toggle Component
export const SensoryToggle = ({ 
  label, 
  isOn, 
  onChange, 
  onColor = '#8b5cf6', 
  offColor = '#e5e7eb' 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    onChange(!isOn);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
          isOn ? 'bg-purple-600' : 'bg-gray-200'
        }`}
        disabled={isAnimating}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
            isOn ? 'translate-x-6' : 'translate-x-1'
          } ${isAnimating ? 'scale-110' : ''}`}
        />
      </button>
    </div>
  );
};

// Animated Welcome Message Component
export const AnimatedWelcomeMessage = ({ message, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`transition-all duration-1000 ease-out ${
      isVisible 
        ? 'opacity-100 transform translate-y-0' 
        : 'opacity-0 transform translate-y-8'
    }`}>
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border-2 border-purple-200 shadow-lg">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <span className="text-3xl animate-bounce">🎉</span>
          <h3 className="text-xl font-bold text-purple-700">Welcome!</h3>
          <span className="text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎉</span>
        </div>
        <p className="text-center text-purple-600 text-lg">{message}</p>
      </div>
    </div>
  );
};

// Interactive Learning Path Component
export const LearningPathStep = ({ 
  step, 
  title, 
  description, 
  isCompleted = false, 
  isCurrent = false,
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative p-4 rounded-xl transition-all duration-300 cursor-pointer ${
        isCompleted 
          ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300' 
          : isCurrent
          ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-lg'
          : 'bg-gray-100 border-2 border-gray-200'
      } ${isHovered ? 'scale-105 shadow-xl' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
          isCompleted 
            ? 'bg-green-500 text-white' 
            : isCurrent
            ? 'bg-purple-500 text-white animate-pulse'
            : 'bg-gray-400 text-white'
        }`}>
          {isCompleted ? '✓' : step}
        </div>
        <div className="flex-1">
          <h4 className={`font-bold text-lg ${
            isCompleted ? 'text-green-700' : isCurrent ? 'text-purple-700' : 'text-gray-600'
          }`}>
            {title}
          </h4>
          <p className={`text-sm ${
            isCompleted ? 'text-green-600' : isCurrent ? 'text-purple-600' : 'text-gray-500'
          }`}>
            {description}
          </p>
        </div>
        {isCurrent && (
          <div className="text-2xl animate-bounce">🎯</div>
        )}
      </div>
    </div>
  );
};




