'use client';

import { useState, useEffect } from 'react';

interface Testimonial {
  text: string;
  author: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="relative">
      <div className="max-w-4xl mx-auto">
        {/* Quote icon */}
        <div className="text-center mb-8">
          <svg className="w-16 h-16 mx-auto text-accent opacity-30" fill="currentColor" viewBox="0 0 32 32">
            <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
          </svg>
        </div>

        {/* Testimonials */}
        <div className="relative min-h-[280px] md:min-h-[220px]">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-700 ${
                idx === activeIdx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
              <p className="text-xl md:text-2xl text-text-muted text-center leading-relaxed font-light italic mb-8">
                "{testimonial.text}"
              </p>
              <div className="text-center">
                <p className="text-accent font-display font-semibold text-lg">{testimonial.author}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              aria-label={`Go to testimonial ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIdx ? 'w-8 bg-accent' : 'w-2 bg-border hover:bg-text-dim'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
