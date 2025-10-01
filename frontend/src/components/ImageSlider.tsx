// components/ImageSlider.tsx
'use client';

import React, { useState, useEffect } from 'react';
// import useEmblaCarousel from 'embla-carousel-react';
// import Autoplay from 'embla-carousel-autoplay';

const slides = [
  {
    src: '/image1.jpg',
    alt: 'A super cozy and supportive learning space where you can feel safe, happy, and ready to learn! 🌟',
    title: 'Your Amazing Learning Space',
    emoji: '🏠',
    description: 'Our platform creates a magical, welcoming space where every child can shine, grow, and discover their superpowers! ✨',
    funFact: 'Did you know? A happy learning environment helps your brain work better! 🧠'
  },
  {
    src: '/image2.jpg',
    alt: 'Super cool doctors, teachers, and therapists working together as an amazing team to help you! 👨‍⚕️👩‍🏫🤝',
    title: 'Your Superhero Team',
    emoji: '🤝',
    description: 'Meet your amazing team of specialists who work together to make learning fun, exciting, and totally awesome! 🚀',
    funFact: 'Teamwork makes the dream work! When we work together, amazing things happen! 🌈'
  },
  {
    src: '/image3.jpg',
    alt: 'Super fun activities and games that make learning feel like playing! Learning is an adventure! 🎮🎨🎵',
    title: 'Learning is Super Fun!',
    emoji: '🎮',
    description: 'Discover tons of exciting activities, games, and adventures that make learning feel like the best playtime ever! 🎪',
    funFact: 'Playing games while learning helps you remember things better! 🎯'
  },
  {
    src: '/image4.jpg',
    alt: 'A magical library full of amazing books, stories, and learning tools just waiting for you to explore! 📚✨🌟',
    title: 'Your Magical Library',
    emoji: '📚',
    description: 'Explore our treasure chest of books, activities, and learning tools that make every day a new adventure! 🗺️',
    funFact: 'Reading just 20 minutes a day makes you smarter! 📖'
  },
  {
    src: '/image5.jpg',
    alt: 'Express yourself through awesome art, music, and creative activities! Show the world your amazing talents! 🎨🎵🎭',
    title: 'Express Your Superpowers',
    emoji: '🎨',
    description: 'Unleash your creativity with fun art projects, music activities, and ways to show the world how amazing you are! 🎭',
    funFact: 'Being creative helps your brain grow stronger! 🧠💪'
  },
  {
    src: '/image6.jpg',
    alt: 'Celebrate every achievement and see how much you\'ve grown! Every step forward is a victory! 🏆🎉🌟',
    title: 'Celebrate Your Success!',
    emoji: '🎉',
    description: 'Track your amazing progress and celebrate every victory! You\'re growing into an incredible learning superhero! 🦸‍♂️',
    funFact: 'Celebrating small wins helps you achieve big goals! 🎯'
  },
];

export const ImageSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = React.useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const toggleAutoplay = () => {
    if (emblaApi) {
      if (isPlaying) {
        emblaApi.plugins().autoplay?.stop();
      } else {
        emblaApi.plugins().autoplay?.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="embla-wrapper max-w-6xl mx-auto">
      {/* Main Slider */}
      <div className="embla overflow-hidden rounded-3xl shadow-2xl border-2 border-indigo-200/50" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((slide, index) => (
            <div className="embla__slide flex-[0_0_100%] min-w-0" key={index}>
              <div className="relative h-80 md:h-[500px] lg:h-[600px]">
                <img
                  className="w-full h-full object-cover"
                  src={slide.src}
                  alt={slide.alt}
                />
                {/* Fun overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-purple-900/50 to-transparent"></div>
                
                {/* Slide content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-center mb-4">
                    <span className="text-5xl mr-4 animate-bounce">{slide.emoji}</span>
                    <h3 className="text-3xl md:text-4xl font-black text-yellow-300">{slide.title}</h3>
                  </div>
                  <p className="text-lg md:text-xl text-slate-200 max-w-3xl leading-relaxed mb-4">
                    {slide.description}
                  </p>
                  <p className="text-base text-slate-300 max-w-2xl leading-relaxed mb-4">
                    {slide.alt}
                  </p>
                  
                  {/* Fun Fact Section */}
                  <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm p-3 rounded-xl border border-yellow-300/30 max-w-md">
                    <p className="text-sm text-yellow-200 font-semibold">{slide.funFact}</p>
                  </div>
                </div>

                {/* Fun progress indicator */}
                <div className="absolute top-6 right-6 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-white/30 shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {index + 1} of {slides.length} ✨
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Fun Navigation Controls */}
      <div className="flex justify-center items-center mt-8 space-x-8">
        {/* Previous Button */}
        <button 
          className="embla__prev group relative bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl border-2 border-white/30"
          onClick={scrollPrev}
        >
          <div className="flex items-center justify-center w-8 h-8">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          {/* Fun decoration */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
        </button>

        {/* Play/Pause Button */}
        <button 
          onClick={toggleAutoplay}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-800 p-4 rounded-full hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl border-2 border-white/30 group"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            {isPlaying ? (
              <span className="text-2xl group-hover:animate-bounce">⏸️</span>
            ) : (
              <span className="text-2xl group-hover:animate-bounce">▶️</span>
            )}
          </div>
        </button>

        {/* Next Button */}
        <button 
          className="embla__next group relative bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl border-2 border-white/30"
          onClick={scrollNext}
        >
          <div className="flex items-center justify-center w-8 h-8">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          {/* Fun decoration */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-pink-400 rounded-full animate-pulse shadow-lg"></div>
        </button>
      </div>

      {/* Fun Dot Indicators */}
      <div className="flex justify-center mt-8 space-x-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 hover:scale-125 ${
              index === currentSlide 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg scale-125' 
                : 'bg-indigo-300 hover:bg-indigo-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            {index === currentSlide && (
              <div className="w-full h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse"></div>
            )}
          </button>
        ))}
      </div>

      {/* Fun Information Section */}
      <div className="mt-10 bg-gradient-to-r from-indigo-100 to-purple-100 p-8 rounded-2xl border-2 border-indigo-200/50 shadow-xl">
        <div className="text-center">
          <h4 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
            🌟 Fun Facts About Our Amazing Platform! 🌟
          </h4>
          <p className="text-slate-600 leading-relaxed max-w-4xl mx-auto text-lg">
            Each image shows a real part of our <span className="font-bold text-indigo-600">magical learning world</span> where superhero specialists work together to make learning fun, exciting, and totally amazing for everyone! 
            <span className="block mt-2 text-indigo-600 font-semibold">✨ Ready to start your adventure? ✨</span>
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .embla-wrapper {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .embla__slide {
          position: relative;
        }
        
        /* Smooth transitions for better accessibility */
        .embla__slide img {
          transition: transform 0.3s ease;
        }
        
        .embla__slide:hover img {
          transform: scale(1.02);
        }
        
        /* Animation for the emoji in slide titles */
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
};