'use client';

export default function Hero() {
  const scrollToBooking = () => {
    const element = document.getElementById('booking');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&h=1080&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d]/90 via-[#0d0d0d]/70 to-[#0d0d0d]/90"></div>
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMzAgMzBoMnYzSDMwVjMweiIgZmlsbD0iI2M5YTIyNyIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+Cjwvc3ZnPg==')] opacity-30"></div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="font-display text-[#c9a227] text-xl tracking-[0.3em] mb-4 animate-fade-in">ESTABLISHED 2018</p>
        <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight animate-fade-in animate-delay-1">
          THE ART OF
          <br />
          <span className="text-[#c9a227]">PRECISION CUTS</span>
        </h1>
        <p className="text-white/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-fade-in animate-delay-2">
          Where tradition meets modern style. Experience grooming at its finest in an atmosphere that feels like home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animate-delay-3">
          <button
            onClick={scrollToBooking}
            className="bg-[#c9a227] text-[#1a1a1a] px-8 py-4 font-semibold uppercase tracking-wider hover:bg-[#d4af37] transition-all transform hover:-translate-y-1"
          >
            Book Appointment
          </button>
          <a
            href="#services"
            className="border-2 border-white/30 text-white px-8 py-4 font-semibold uppercase tracking-wider hover:border-[#c9a227] hover:text-[#c9a227] transition-all"
          >
            Our Services
          </a>
        </div>

        <div className="mt-16 flex justify-center gap-12 animate-fade-in animate-delay-4">
          <div className="text-center">
            <p className="font-display text-4xl text-[#c9a227]">5000+</p>
            <p className="text-white/50 text-sm uppercase tracking-wider">Happy Clients</p>
          </div>
          <div className="text-center">
            <p className="font-display text-4xl text-[#c9a227]">7+</p>
            <p className="text-white/50 text-sm uppercase tracking-wider">Years Experience</p>
          </div>
          <div className="text-center">
            <p className="font-display text-4xl text-[#c9a227]">4.9</p>
            <p className="text-white/50 text-sm uppercase tracking-wider">Rating</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <a href="#services" className="text-white/50 hover:text-[#c9a227] transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </div>
    </section>
  );
}