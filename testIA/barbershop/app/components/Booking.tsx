'use client';

import { useState } from 'react';
import { services, timeSlots } from '../data';

export default function Booking() {
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const toggleService = (id: number) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const totalPrice = selectedServices.reduce((sum, id) => {
    const service = services.find(s => s.id === id);
    return sum + (service?.price || 0);
  }, 0);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!selectedDate) newErrors.date = 'Please select a date';
    if (!selectedTime) newErrors.time = 'Please select a time';
    if (selectedServices.length === 0) newErrors.services = 'Please select at least one service';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const booking = {
      id: Date.now(),
      services: selectedServices,
      date: selectedDate,
      time: selectedTime,
      ...formData,
      total: totalPrice
    };

    const existing = JSON.parse(localStorage.getItem('bookings') || '[]');
    localStorage.setItem('bookings', JSON.stringify([...existing, booking]));

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="booking" className="py-24 px-6 bg-[#111111]">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-[#c9a227] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-playfair text-3xl mb-4">Booking Confirmed!</h2>
          <p className="text-white/60 mb-8">
            Your appointment has been scheduled. We&apos;ll send a confirmation to your email.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setStep(1);
              setSelectedServices([]);
              setSelectedDate('');
              setSelectedTime('');
              setFormData({ name: '', email: '', phone: '', notes: '' });
            }}
            className="bg-[#c9a227] text-[#1a1a1a] px-8 py-3 font-semibold uppercase tracking-wider"
          >
            Book Another
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-24 px-6 bg-[#0d0d0d]">
      <div className="max-w-4xl mx-auto">
        <h2 className="section-title font-playfair text-4xl md:text-5xl">
          Book <span className="text-[#c9a227]">Appointment</span>
        </h2>
        <p className="section-subtitle text-white/60">
          Schedule your next visit in just a few steps
        </p>

        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`w-12 h-1 rounded-full transition-all ${
                step >= s ? 'bg-[#c9a227]' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <div className="bg-[#1a1a1a] p-8 md:p-12">
          {step === 1 && (
            <div>
              <h3 className="font-playfair text-2xl mb-6">Select Services</h3>
              {errors.services && <p className="text-red-400 text-sm mb-4">{errors.services}</p>}
              <div className="space-y-3">
                {services.map(service => (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`p-4 border cursor-pointer transition-all ${
                      selectedServices.includes(service.id)
                        ? 'border-[#c9a227] bg-[#c9a227]/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                          selectedServices.includes(service.id) ? 'border-[#c9a227] bg-[#c9a227]' : 'border-white/30'
                        }`}>
                          {selectedServices.includes(service.id) && (
                            <svg className="w-3 h-3 text-[#1a1a1a]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                            </svg>
                          )}
                        </div>
                        <span className="font-semibold">{service.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#c9a227] font-display text-xl">${service.price}</span>
                        <span className="text-white/40 text-sm ml-2">{service.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {selectedServices.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="text-white/60">Total:</span>
                  <span className="text-[#c9a227] font-display text-3xl">${totalPrice}</span>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-playfair text-2xl mb-6">Select Date & Time</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/60 text-sm mb-2">Date</label>
                  <input
                    type="date"
                    min={getMinDate()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-white/10 p-4 text-white focus:border-[#c9a227] outline-none"
                  />
                  {errors.date && <p className="text-red-400 text-sm mt-2">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-white/10 p-4 text-white focus:border-[#c9a227] outline-none"
                  >
                    <option value="">Select a time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.time && <p className="text-red-400 text-sm mt-2">{errors.time}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="font-playfair text-2xl mb-6">Your Details</h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0d0d0d] border border-white/10 p-4 text-white focus:border-[#c9a227] outline-none"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-2">{errors.name}</p>}
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0d0d0d] border border-white/10 p-4 text-white focus:border-[#c9a227] outline-none"
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email}</p>}
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#0d0d0d] border border-white/10 p-4 text-white focus:border-[#c9a227] outline-none"
                  />
                  {errors.phone && <p className="text-red-400 text-sm mt-2">{errors.phone}</p>}
                </div>
                <div>
                  <textarea
                    placeholder="Special requests or notes (optional)"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full bg-[#0d0d0d] border border-white/10 p-4 text-white focus:border-[#c9a227] outline-none resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#0d0d0d] border border-white/10">
                <h4 className="font-semibold mb-2">Booking Summary</h4>
                <div className="text-white/60 text-sm space-y-1">
                  <p>Services: {selectedServices.map(id => services.find(s => s.id === id)?.name).join(', ')}</p>
                  <p>Date: {selectedDate} at {selectedTime}</p>
                  <p className="text-[#c9a227] font-semibold mt-2">Total: ${totalPrice}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="text-white/60 hover:text-white transition-colors"
              >
                &larr; Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && selectedServices.length === 0}
                className="ml-auto bg-[#c9a227] text-[#1a1a1a] px-8 py-3 font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="ml-auto bg-[#c9a227] text-[#1a1a1a] px-8 py-3 font-semibold uppercase tracking-wider hover:bg-[#d4af37]"
              >
                Confirm Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}