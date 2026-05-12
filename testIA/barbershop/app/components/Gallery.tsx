'use client';

import { useState } from 'react';
import { galleryImages } from '../data';

export default function Gallery() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section id="gallery" className="py-24 px-6 bg-[#111111]">
      <div className="max-w-7xl mx-auto">
        <h2 className="section-title font-playfair text-4xl md:text-5xl">
          Our <span className="text-[#c9a227]">Gallery</span>
        </h2>
        <p className="section-subtitle text-white/60">
          A glimpse of our work - fresh cuts and satisfied clients
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12">
          {galleryImages.map((img, index) => (
            <div
              key={index}
              className={`relative overflow-hidden cursor-pointer group ${
                index === 0 || index === 3 ? 'md:col-span-2' : ''
              }`}
              onClick={() => setLightbox(index)}
            >
              <img
                src={img}
                alt={`Gallery ${index + 1}`}
                className="w-full h-48 md:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#c9a227]/0 group-hover:bg-[#c9a227]/20 transition-colors duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-display text-4xl">
                  +
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="#booking"
            className="inline-block border-2 border-[#c9a227] text-[#c9a227] px-8 py-3 font-semibold uppercase tracking-wider hover:bg-[#c9a227] hover:text-[#1a1a1a] transition-all"
          >
            Book Your Session
          </a>
        </div>
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-[#c9a227] text-4xl"
            onClick={() => setLightbox(null)}
          >
            &times;
          </button>
          <img
            src={galleryImages[lightbox]}
            alt={`Gallery ${lightbox + 1}`}
            className="max-w-4xl max-h-[80vh] object-contain"
          />
          <button
            className="absolute left-6 text-white/60 hover:text-[#c9a227] text-4xl"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(lightbox === 0 ? galleryImages.length - 1 : lightbox - 1);
            }}
          >
            &#8249;
          </button>
          <button
            className="absolute right-6 text-white/60 hover:text-[#c9a227] text-4xl"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((lightbox + 1) % galleryImages.length);
            }}
          >
            &#8250;
          </button>
        </div>
      )}
    </section>
  );
}