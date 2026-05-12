'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0d0d0d]/95 backdrop-blur-sm py-3 shadow-lg' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="font-display text-3xl tracking-wider text-white">
          CUTS <span className="text-[#c9a227]">&</span> CO.
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#services"
            onClick={(e) => scrollToSection(e, 'services')}
            className="text-white/80 hover:text-[#c9a227] transition-colors relative group"
          >
            Services
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#c9a227] transition-all group-hover:w-full"></span>
          </a>
          <a
            href="#gallery"
            onClick={(e) => scrollToSection(e, 'gallery')}
            className="text-white/80 hover:text-[#c9a227] transition-colors relative group"
          >
            Gallery
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#c9a227] transition-all group-hover:w-full"></span>
          </a>
          <a
            href="#testimonials"
            onClick={(e) => scrollToSection(e, 'testimonials')}
            className="text-white/80 hover:text-[#c9a227] transition-colors relative group"
          >
            Reviews
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#c9a227] transition-all group-hover:w-full"></span>
          </a>
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, 'contact')}
            className="text-white/80 hover:text-[#c9a227] transition-colors relative group"
          >
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#c9a227] transition-all group-hover:w-full"></span>
          </a>
          <button
            onClick={(e) => scrollToSection(e, 'booking')}
            className="bg-[#c9a227] text-[#1a1a1a] px-6 py-2 font-semibold uppercase text-sm hover:bg-[#d4af37] transition-all"
          >
            Book Now
          </button>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className={`w-6 h-5 relative flex flex-col justify-between ${menuOpen ? 'open' : ''}`}>
            <span className={`w-full h-[2px] bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-full h-[2px] bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-full h-[2px] bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      <div className={`md:hidden absolute top-full left-0 right-0 bg-[#0d0d0d]/98 backdrop-blur-sm transition-all ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-6 py-4 flex flex-col gap-4">
          <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="text-white/80 hover:text-[#c9a227]">Services</a>
          <a href="#gallery" onClick={(e) => scrollToSection(e, 'gallery')} className="text-white/80 hover:text-[#c9a227]">Gallery</a>
          <a href="#testimonials" onClick={(e) => scrollToSection(e, 'testimonials')} className="text-white/80 hover:text-[#c9a227]">Reviews</a>
          <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="text-white/80 hover:text-[#c9a227]">Contact</a>
          <button onClick={(e) => scrollToSection(e, 'booking')} className="bg-[#c9a227] text-[#1a1a1a] px-6 py-2 font-semibold uppercase text-sm">Book Now</button>
        </div>
      </div>
    </nav>
  );
}