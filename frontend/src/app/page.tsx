'use client';

import React from 'react';
import Link from 'next/link';
import { ImageSlider } from '../components/ImageSlider';
import toast from 'react-hot-toast';


// --- Reusable SVG for a playful, wavy section divider ---
const WavyDivider = ({ color = "text-amber-100" }) => (
  <div className={`w-full overflow-hidden leading-[0]`}>
    <svg className={`relative block w-full h-[60px] sm:h-[120px] ${color}`} data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-current"></path>
    </svg>
  </div>
);

// --- Advanced Interactive Mascot with Fun & Professional Appeal ---
const AnimatedMascot = () => (
  <div className="fixed bottom-8 right-8 z-50 flex items-end gap-3 pointer-events-none">
    {/* Chat Bubble */}
    <div className="bg-white px-5 py-3 rounded-2xl rounded-br-none shadow-unia-card-hover border border-white/50 animate-bounce pointer-events-auto">
      <span className="text-gray-800 font-bold text-lg">Hi! 👋</span>
    </div>
    
    {/* Mascot */}
    <div className="w-16 h-16 bg-unia-purple-light rounded-full flex items-center justify-center text-3xl shadow-unia-card border-2 border-white overflow-hidden pointer-events-auto cursor-pointer hover:scale-110 transition-transform">
      🦋
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
  <header className="sticky top-0 bg-white/60 backdrop-blur-md rounded-b-[2rem] mx-4 mt-2 z-50 shadow-sm border border-white/50 border-t-0 p-4 px-6 flex justify-between items-center transition-all">
    <Link href="/" className="flex items-center space-x-3 group">
      <div className="relative flex items-center justify-center w-12 h-12 bg-unia-purple-light rounded-2xl shadow-sm border border-white transform group-hover:-rotate-6 transition-transform">
        <span className="text-2xl">🦋</span>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-unia-gradient-primary tracking-tight">
            UNIA
          </span>
          <span className="text-2xl animate-spin-slow">☀️</span>
        </div>
        <p className="text-xs text-slate-800 font-semibold -mt-1 tracking-wide">
          Autism Support Platform
        </p>
      </div>
    </Link>
    <nav className="flex items-center space-x-6">
      <Link href="/auth/login" className="flex items-center gap-2 text-slate-800 font-bold hover:text-unia-purple transition-colors">
        <span className="text-xl">🔑</span> Sign In
      </Link>
      <Link href="/auth/register" className="btn-primary shadow-unia-card-hover group flex items-center gap-2 px-6 py-2.5">
        <span className="text-xl group-hover:animate-bounce">🚀</span> Get Started
      </Link>
    </nav>
  </header>
);

const AnimatedBackground = () => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />;

  return (
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
};

const HeroSection = () => (
  <section className="relative pt-24 pb-32 text-center overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
    {/* Rainbow Arch Background Approximation via SVGs/Gradients */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 flex justify-center items-start opacity-70">
      <div className="w-[150%] h-[800px] border-[40px] border-unia-purple-light/50 rounded-[100%] absolute -top-[400px]"></div>
      <div className="w-[130%] h-[700px] border-[40px] border-pink-100/50 rounded-[100%] absolute -top-[300px]"></div>
      <div className="w-[110%] h-[600px] border-[40px] border-orange-50/80 rounded-[100%] absolute -top-[200px]"></div>
    </div>
    
    <div className="container mx-auto px-4 z-10 relative max-w-5xl">
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-unia-purple via-unia-pink to-unia-orange mb-6 leading-tight drop-shadow-sm tracking-tight">
        Welcome to Your Learning Adventure!
      </h1>
      
      <p className="text-2xl sm:text-3xl text-slate-900 font-extrabold mx-auto mb-8 leading-snug tracking-tight">
        A magical place where amazing specialists work together to help you learn, grow, and shine!
      </p>
      
      <p className="text-xl sm:text-2xl text-slate-700 mb-12 font-medium">
        Explore fun activities, play games, and discover your superpowers! ✨
      </p>
      
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <Link href="/auth/register" className="btn-primary text-xl px-8 py-4 shadow-unia-card-hover group flex items-center gap-3">
          <span className="text-2xl group-hover:animate-bounce">🚀</span> Start Your Adventure!
        </Link>
        <Link href="/dashboard" className="btn-teal text-xl px-8 py-4 shadow-unia-card-hover group flex items-center gap-3">
          <span className="text-2xl group-hover:animate-bounce">📰</span> Explore Community!
        </Link>
        <Link href="/dashboard/activities" className="btn-secondary text-xl px-8 py-4 shadow-unia-card-hover group flex items-center gap-3">
          <span className="text-2xl group-hover:rotate-12 transition-transform">🎨</span> Explore Activities!
        </Link>
      </div>
    </div>
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
    { text: "My daughter looks forward to her 'UNIA time' every day. It's learning that feels like play!", name: "Emily, Parent", image: "/L.jpg", color: "bg-green-200" },
    { text: "An incredible tool for educators. The resources are top-notch and genuinely helpful.", name: "Mr. David, Teacher", image: "/L.jpg", color: "bg-blue-200" },
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
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-indigo-500/25">
              <span className="text-lg">📘</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-blue-500/25">
              <span className="text-lg">🐦</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-pink-500/25">
              <span className="text-lg">📷</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-green-500/25">
              <span className="text-lg">💼</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-1">
          <h4 className="text-xl font-bold text-white mb-6 border-b-2 border-indigo-400 pb-2">Quick Links</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/" className="text-slate-300 hover:text-indigo-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">🏠</span>
                About Us
              </Link>
            </li>
            <li>
              <Link href="/" className="text-slate-300 hover:text-indigo-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">🎯</span>
                Our Services
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-slate-300 hover:text-indigo-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">📚</span>
                Learning Courses
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-slate-300 hover:text-indigo-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">🎮</span>
                Activities & Games
              </Link>
            </li>
            <li>
              <Link href="/" className="text-slate-300 hover:text-indigo-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">📖</span>
                Resource Library
              </Link>
            </li>
            <li>
              <Link href="/" className="text-slate-300 hover:text-indigo-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">✍️</span>
                Blog & News
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Resources */}
        <div className="lg:col-span-1">
          <h4 className="text-xl font-bold text-white mb-6 border-b-2 border-purple-400 pb-2">Support & Resources</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/" className="text-slate-300 hover:text-purple-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">❓</span>
                Help Center
              </Link>
            </li>
            <li>
              <Link href="/" className="text-slate-300 hover:text-purple-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">💡</span>
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/" className="text-slate-300 hover:text-purple-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">🎥</span>
                Video Tutorials
              </Link>
            </li>
            <li>
              <Link href="/" className="text-slate-300 hover:text-purple-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">👥</span>
                Community Forum
              </Link>
            </li>
            <li>
              <Link href="/" className="text-slate-300 hover:text-purple-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">🔬</span>
                Research & Studies
              </Link>
            </li>
            <li>
              <Link href="/" className="text-slate-300 hover:text-purple-300 transition-colors duration-300 flex items-center group">
                <span className="mr-2 group-hover:animate-bounce">🤝</span>
                Partner Organizations
              </Link>
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
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              toast.success('🎉 Successfully subscribed to the newsletter!');
            }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto"
          >
            <input 
              type="email" 
              required
              placeholder="Enter your email address" 
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-300 focus:outline-none focus:border-indigo-400 transition-colors"
            />
            <button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold hover:from-indigo-600 hover:to-purple-600 transition-all hover:scale-105 shadow-lg hover:shadow-indigo-500/25">
              Subscribe! 🚀
            </button>
          </form>
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
            <Link href="/" className="text-slate-400 hover:text-indigo-300 transition-colors">Privacy Policy</Link>
            <Link href="/" className="text-slate-400 hover:text-indigo-300 transition-colors">Terms of Service</Link>
            <Link href="/" className="text-slate-400 hover:text-indigo-300 transition-colors">Cookie Policy</Link>
            <Link href="/" className="text-slate-400 hover:text-indigo-300 transition-colors">Accessibility</Link>
            <Link href="/" className="text-slate-400 hover:text-indigo-300 transition-colors">Sitemap</Link>
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