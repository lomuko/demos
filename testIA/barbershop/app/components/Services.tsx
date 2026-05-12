'use client';

import { services } from '../data';

export default function Services() {
  return (
    <section id="services" className="py-24 px-6 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto">
        <h2 className="section-title font-playfair text-4xl md:text-5xl">
          Our <span className="text-[#c9a227]">Services</span>
        </h2>
        <p className="section-subtitle text-white/60 max-w-2xl mx-auto">
          From classic cuts to modern styles, we deliver premium grooming experiences
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="group relative bg-[#1a1a1a] overflow-hidden card-hover"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
                <div className="absolute bottom-4 right-4 bg-[#c9a227] text-[#1a1a1a] px-3 py-1 font-display text-xl">
                  ${service.price}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-playfair text-xl text-white group-hover:text-[#c9a227] transition-colors">
                    {service.name}
                  </h3>
                  <span className="text-white/40 text-sm">{service.duration}</span>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#c9a227] transform rotate-45 translate-x-8 -translate-y-8"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-4 text-white/60">
            <span className="w-12 h-[1px] bg-[#c9a227]"></span>
            <span className="font-display text-lg tracking-wider">WALK-INS WELCOME</span>
            <span className="w-12 h-[1px] bg-[#c9a227]"></span>
          </div>
        </div>
      </div>
    </section>
  );
}