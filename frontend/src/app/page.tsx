'use client';

import React from 'react';
import Link from 'next/link';
import { ImageSlider } from '../components/ImageSlider';


// --- Reusable SVG for a playful, wavy section divider ---
const WavyDivider = ({ color = "text-amber-100" }) => (
  <div className={`w-full overflow-hidden leading-[0]`}>
    <svg className={`relative block w-full h-[60px] sm:h-[120px] ${color}`} data-name="Layer 1" xmlns="http://www.w.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-current"></path>
    </svg>
  </div>
);

// --- Advanced Interactive Mascot with Fun & Professional Appeal ---
const AnimatedMascot = () => (
  <div className="fixed bottom-6 right-6 z-50">
    <div className="relative group cursor-pointer">
      {/* Main Mascot */}
      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl shadow-2xl border-4 border-white/30 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-indigo-500/40">
        🦋
      </div>
      
      {/* Fun Interactive Elements */}
      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-800 text-xs px-3 py-1.5 rounded-full font-bold animate-bounce shadow-lg border-2 border-white">
        Hi! 👋
      </div>
      
      {/* Advanced Animation Effects */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-600/30 animate-ping opacity-75"></div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500/20 to-yellow-400/20 animate-pulse"></div>
      
      {/* Fun Sparkles */}
      <div className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-300 rounded-full animate-sparkle"></div>
      <div className="absolute top-1 -right-1 w-2 h-2 bg-pink-300 rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-1 -left-1 w-2.5 h-2.5 bg-blue-300 rounded-full animate-sparkle" style={{ animationDelay: '1s' }}></div>
    </div>
  </div>
);

// --- Advanced Learning Environment Section - Fun & Professional ---
const LearningEnvironmentSection = () => (
  <section className="container mx-auto px-4 mb-20">
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-10 rounded-3xl shadow-2xl border-2 border-indigo-200/50 backdrop-blur-sm relative overflow-hidden">
      {/* Fun Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 text-6xl animate-float">🌟</div>
        <div className="absolute top-20 right-20 text-5xl animate-float" style={{ animationDelay: '2s' }}>🎈</div>
        <div className="absolute bottom-20 left-20 text-4xl animate-float" style={{ animationDelay: '4s' }}>🌈</div>
        <div className="absolute bottom-10 right-10 text-5xl animate-float" style={{ animationDelay: '1s' }}>🎨</div>
      </div>
      
      <div className="text-center mb-10 relative z-10">
        <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-4">
          🎮 Explore Our Amazing Learning World! 🎮
            </h3>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Discover the super cool tools and awesome features that make learning fun, exciting, and totally amazing! 
          <span className="block mt-2 text-lg font-semibold text-indigo-600">✨ Where every child becomes a learning superhero! ✨</span>
        </p>
      </div>
      
      {/* Advanced Image Slider */}
      <div className="mb-10">
            <ImageSlider />
      </div>
          </div>
        </section>
);

const Header = () => (
  <header className="sticky top-0 bg-white/95 backdrop-blur-lg border-b-2 border-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 z-50 shadow-xl">
    <div className="container mx-auto flex justify-between items-center p-6">
      <Link href="/" className="flex items-center space-x-4 group">
        <div className="relative">
          <img src="/L.jpg" alt="UNIA Logo" className="w-16 h-16 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-xl border-2 border-indigo-200" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse shadow-lg border-2 border-white"></div>
          {/* Fun Sparkle Effect */}
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-300 rounded-full animate-sparkle"></div>
        </div>
        <div>
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 group-hover:from-indigo-700 group-hover:via-purple-700 group-hover:to-pink-700 transition-all duration-300">
            UNIA
          </span>
          <p className="text-sm text-slate-500 -mt-1 font-semibold">🌟 Autism Support Platform 🌟</p>
        </div>
      </Link>
      <nav className="flex items-center space-x-6">
        <Link href="/auth/login" className="px-6 py-3 text-base font-bold text-slate-600 hover:text-indigo-600 transition-colors hover:scale-105 group">
          <span className="group-hover:animate-bounce">🔑</span> Sign In
        </Link>
        <Link href="/auth/register" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold transition-all hover:scale-105 shadow-xl hover:shadow-2xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 border-2 border-white/20 group">
          <span className="group-hover:animate-bounce">🚀</span> Get Started
        </Link>
      </nav>
    </div>
  </header>
);

const AnimatedBackground = () => (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
            opacity: '0.3',
          }}
        >
          {['📚', '🎓', '✏️', '🌟', '🔍', '📝', '📊', '🦉'][i % 8]}
        </div>
      ))}
    </div>
);

const HeroSection = () => (
  <section className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-20 pb-24 text-center overflow-hidden">
    <div className="container mx-auto px-4 z-10 relative">
      <div className="mb-8">
        <div className="inline-block animate-bounce">
          <span className="text-7xl">🎉</span>
        </div>
      </div>
      <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-8 leading-tight">
        Welcome to Your
        <span className="block bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
          Learning Adventure!
        </span>
      </h1>
      <p className="text-2xl sm:text-3xl text-slate-600 max-w-5xl mx-auto mb-12 leading-relaxed">
        A <span className="font-bold text-indigo-600">magical place</span> where amazing specialists work together to help you learn, grow, and shine! 
        <span className="block mt-3 text-xl font-semibold text-purple-600">✨ Explore fun activities, play games, and discover your superpowers! ✨</span>
      </p>
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <Link href="/auth/register" className="group bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-2xl px-14 py-6 rounded-full font-black transition-all hover:scale-110 shadow-2xl hover:shadow-indigo-500/25 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 border-2 border-white/20">
          <span className="group-hover:animate-bounce">🚀</span> Start Your Adventure!
        </Link>
        <Link href="/news-feed" className="group bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 text-white text-2xl px-14 py-6 rounded-full font-black transition-all hover:scale-110 shadow-2xl hover:shadow-green-500/25 hover:from-green-600 hover:via-teal-600 hover:to-blue-600 border-2 border-white/20">
          <span className="group-hover:animate-bounce">📰</span> Explore Community!
        </Link>
        <Link href="/activities" className="group bg-white text-slate-800 text-2xl px-14 py-6 rounded-full font-black transition-all hover:scale-110 shadow-2xl hover:shadow-slate-500/25 border-2 border-slate-200 hover:border-indigo-300">
          <span className="group-hover:animate-bounce">🎨</span> Explore Activities!
      </Link>
      </div>
    </div>
    <WavyDivider color="text-white" />
  </section>
);

const FeaturesSection = () => {
  const features = [
    { icon: '🎨', title: 'Creative Activities', description: 'Engaging games and lessons.', color: 'bg-blue-300' },
    { icon: '🤝', title: 'Expert Connect', description: 'Collaborate with specialists.', color: 'bg-green-300' },
    { icon: '🌟', title: 'Milestone Tracking', description: 'Celebrate every achievement.', color: 'bg-yellow-300' },
    { icon: '📖', title: 'Story Library', description: 'A world of interactive stories.', color: 'bg-orange-300' },
  ];

  return (
    <section className="bg-white py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-blue-900 mb-12">What's Inside?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className={`${feature.color} p-8 rounded-3xl text-center transition-transform hover:-translate-y-2 hover:rotate-2 shadow-lg`}>
              <div className="text-6xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-white/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => (
  <section className="relative bg-sky-100 pt-32 pb-20 px-4">
    <div className="absolute top-0 left-0 w-full">
      <WavyDivider color="text-white" />
    </div>
    <div className="container mx-auto text-center">
      <h2 className="text-4xl font-extrabold text-blue-900 mb-16">Just 3 Easy Steps!</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="flex flex-col items-center">
          <div className="bg-yellow-400 text-white text-4xl font-black w-20 h-20 flex items-center justify-center rounded-full shadow-lg mb-4">1</div>
          <h3 className="text-2xl font-bold text-blue-800 mb-2">Create a Profile</h3>
          <p className="text-gray-600">Sign up and tell us a little about your young learner's goals.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-orange-500 text-white text-4xl font-black w-20 h-20 flex items-center justify-center rounded-full shadow-lg mb-4">2</div>
          <h3 className="text-2xl font-bold text-blue-800 mb-2">Explore & Connect</h3>
          <p className="text-gray-600">Browse our library of activities and connect with our team of experts.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-blue-500 text-white text-4xl font-black w-20 h-20 flex items-center justify-center rounded-full shadow-lg mb-4">3</div>
          <h3 className="text-2xl font-bold text-blue-800 mb-2">Watch Them Grow</h3>
          <p className="text-gray-600">Track progress, celebrate milestones, and watch their confidence soar!</p>
        </div>
      </div>
    </div>
  </section>
);

const TestimonialsSection = () => {
  const testimonials = [
    { text: "My daughter looks forward to her 'UNIA time' every day. It's learning that feels like play!", name: "Emily, Parent", image: "https://placehold.co/100x100/FFE4B5/333?text=E", color: "bg-green-200" },
    { text: "An incredible tool for educators. The resources are top-notch and genuinely helpful.", name: "Mr. David, Teacher", image: "https://placehold.co/100x100/ADD8E6/333?text=D", color: "bg-blue-200" },
  ];

  return (
    <section className="bg-white py-20 px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-blue-900 mb-12">Happy Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className={`${testimonial.color} p-8 rounded-3xl shadow-md text-left`}>
              <p className="text-lg text-gray-700 italic mb-6">"{testimonial.text}"</p>
              <div className="flex items-center">
                <img src={testimonial.image} alt={testimonial.name} className="w-14 h-14 rounded-full mr-4 border-4 border-white"/>
                <p className="font-bold text-gray-800">{testimonial.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Advanced Footer - Fun & Professional ---
const Footer = () => (
  <footer className="relative bg-gradient-to-br from-slate-800 to-slate-900 text-white pt-32 pb-16">
    <div className="absolute top-0 left-0 w-full">
      <WavyDivider color="text-white" />
    </div>
    <div className="container mx-auto px-4">
      {/* Main Footer Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Company Information */}
        <div className="lg:col-span-1">
          <div className="flex items-center mb-6">
            <div className="relative">
              <img src="/L.jpg" alt="UNIA Logo" className="w-16 h-16 rounded-full shadow-2xl border-2 border-white/20" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse shadow-lg border border-white"></div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">UNIA</h3>
              <p className="text-sm text-slate-300 font-semibold">Autism Support Platform</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Empowering families and professionals with innovative tools for autism support and education. 
            Making learning accessible, engaging, and effective for every child.
          </p>
          
          {/* Social Media Links */}
          <div className="flex space-x-4">
            <a href="#" className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-indigo-500/25">
              <span className="text-lg">📘</span>
            </a>
            <a href="#" className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-blue-500/25">
              <span className="text-lg">🐦</span>
            </a>
            <a href="#" className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-pink-500/25">
              <span className="text-lg">📷</span>
            </a>
            <a href="#" className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-green-500/25">
              <span className="text-lg">💼</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-1">
          <h4 className="text-xl font-bold text-white mb-6 border-b-2 border-indigo-400 pb-2">Quick Links</h4>
          <ul className="space-y-3">
            <li>
              <a href="/about" className="text-slate-300 hover:text-indigo-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">🏠</span>
                About Us
              </a>
            </li>
            <li>
              <a href="/services" className="text-slate-300 hover:text-indigo-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">🎯</span>
                Our Services
              </a>
            </li>
            <li>
              <a href="/courses" className="text-slate-300 hover:text-indigo-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">📚</span>
                Learning Courses
              </a>
            </li>
            <li>
              <a href="/activities" className="text-slate-300 hover:text-indigo-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">🎮</span>
                Activities & Games
              </a>
            </li>
            <li>
              <a href="/resources" className="text-slate-300 hover:text-indigo-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">📖</span>
                Resource Library
              </a>
            </li>
            <li>
              <a href="/blog" className="text-slate-300 hover:text-indigo-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">✍️</span>
                Blog & News
              </a>
            </li>
          </ul>
        </div>

        {/* Support & Resources */}
        <div className="lg:col-span-1">
          <h4 className="text-xl font-bold text-white mb-6 border-b-2 border-purple-400 pb-2">Support & Resources</h4>
          <ul className="space-y-3">
            <li>
              <a href="/help" className="text-slate-300 hover:text-purple-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">❓</span>
                Help Center
              </a>
            </li>
            <li>
              <a href="/faq" className="text-slate-300 hover:text-purple-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">💡</span>
                FAQ
              </a>
            </li>
            <li>
              <a href="/tutorials" className="text-slate-300 hover:text-purple-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">🎥</span>
                Video Tutorials
              </a>
            </li>
            <li>
              <a href="/community" className="text-slate-300 hover:text-purple-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">👥</span>
                Community Forum
              </a>
            </li>
            <li>
              <a href="/research" className="text-slate-300 hover:text-purple-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">🔬</span>
                Research & Studies
              </a>
            </li>
            <li>
              <a href="/partners" className="text-slate-300 hover:text-purple-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">🤝</span>
                Partner Organizations
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="lg:col-span-1">
          <h4 className="text-xl font-bold text-white mb-6 border-b-2 border-pink-400 pb-2">Contact Us</h4>
          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-start space-x-3">
              <span className="text-pink-400 text-lg mt-1">📍</span>
              <div>
                <p className="text-slate-300 text-sm font-semibold">Main Office</p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  123 Learning Street<br />
                  Autism Support District<br />
                  Education City, EC 12345<br />
                  United States
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center space-x-3">
              <span className="text-pink-400 text-lg">📞</span>
              <div>
                <p className="text-slate-300 text-sm font-semibold">Phone Numbers</p>
                <p className="text-slate-400 text-sm">
                  Main: <a href="tel:+1-555-123-4567" className="hover:text-pink-300 transition-colors">+1 (555) 123-4567</a><br />
                  Support: <a href="tel:+1-555-123-4568" className="hover:text-pink-300 transition-colors">+1 (555) 123-4568</a>
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-3">
              <span className="text-pink-400 text-lg">✉️</span>
              <div>
                <p className="text-slate-300 text-sm font-semibold">Email Addresses</p>
                <p className="text-slate-400 text-sm">
                  General: <a href="mailto:info@unia-platform.com" className="hover:text-pink-300 transition-colors">info@unia-platform.com</a><br />
                  Support: <a href="mailto:support@unia-platform.com" className="hover:text-pink-300 transition-colors">support@unia-platform.com</a><br />
                  Partnerships: <a href="mailto:partnerships@unia-platform.com" className="hover:text-pink-300 transition-colors">partnerships@unia-platform.com</a>
                </p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="flex items-center space-x-3">
              <span className="text-pink-400 text-lg">🕒</span>
              <div>
                <p className="text-slate-300 text-sm font-semibold">Business Hours</p>
                <p className="text-slate-400 text-sm">
                  Monday - Friday: 8:00 AM - 6:00 PM EST<br />
                  Saturday: 9:00 AM - 2:00 PM EST<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-8 rounded-2xl border border-indigo-400/30 mb-12">
        <div className="text-center">
          <h4 className="text-2xl font-bold text-white mb-3">Stay Updated with UNIA! 🌟</h4>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Get the latest news, updates, and learning resources delivered to your inbox. 
            Join our community of educators, specialists, and families!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-300 focus:outline-none focus:border-indigo-400 transition-colors"
            />
            <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold hover:from-indigo-600 hover:to-purple-600 transition-all hover:scale-105 shadow-lg hover:shadow-indigo-500/25">
              Subscribe! 🚀
            </button>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mb-12">
        <Link href="/auth/register" className="group bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-2xl px-14 py-6 rounded-full font-black transition-all hover:scale-105 shadow-2xl hover:shadow-indigo-500/25 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 border-2 border-white/20">
          <span className="group-hover:animate-bounce">🚀</span> Join Our Amazing Community!
      </Link>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-700 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-slate-400">© {new Date().getFullYear()} UNIA Autism Support Platform. All rights reserved.</p>
            <p className="text-slate-500 text-sm mt-1 font-semibold">🌟 Empowering learning, one child at a time 🌟</p>
          </div>
          
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="/privacy" className="text-slate-400 hover:text-indigo-300 transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-slate-400 hover:text-indigo-300 transition-colors">Terms of Service</a>
            <a href="/cookies" className="text-slate-400 hover:text-indigo-300 transition-colors">Cookie Policy</a>
            <a href="/accessibility" className="text-slate-400 hover:text-indigo-300 transition-colors">Accessibility</a>
            <a href="/sitemap" className="text-slate-400 hover:text-indigo-300 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

// --- Main Page Component ---

export default function Home() {
  return (
    <div className="bg-white">
      <AnimatedBackground />
      <div className="relative z-20">
        <Header />
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <LearningEnvironmentSection />
          <TestimonialsSection />
        </main>
        <Footer />
      </div>
      <AnimatedMascot />
    </div>
  );
}