'use client';

import { useState } from 'react';
import { testimonials } from '../data';

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  return (
    <section id="testimonials" className="py-24 px-6 bg-[#0d0d0d] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227] to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227] to-transparent"></div>

      <div className="max-w-4xl mx-auto text-center">
        <h2 className="section-title font-playfair text-4xl md:text-5xl">
          Client <span className="text-[#c9a227]">Reviews</span>
        </h2>
        <p className="section-subtitle text-white/60">
          What our clients say about their experience
        </p>

        <div className="mt-16 relative">
          <div className="bg-[#1a1a1a] p-8 md:p-12 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[#c9a227] text-6xl font-playfair">"</div>

            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < testimonials[current].rating ? 'text-[#c9a227]' : 'text-white/20'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-8 italic">
              {testimonials[current].text}
            </p>

            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-[#c9a227] rounded-full flex items-center justify-center">
                <span className="text-[#1a1a1a] font-bold text-lg">
                  {testimonials[current].name.charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">{testimonials[current].name}</p>
                <p className="text-white/40 text-sm">{testimonials[current].date}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  current === index ? 'bg-[#c9a227] w-8' : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}