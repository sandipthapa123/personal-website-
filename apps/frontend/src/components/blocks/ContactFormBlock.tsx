'use client';

import React, { useState } from 'react';

export interface ContactFormBlockProps {
  heading?: string;
  description?: string;
  apiEndpoint?: string;
  isNewsletter?: boolean;
}

export const ContactFormBlock: React.FC<ContactFormBlockProps> = ({
  heading = 'Contact',
  description = 'For research inquiries, keynote speaking, or legal consulting, reach out via the secure portal.',
  apiEndpoint = 'http://localhost:4000/api/v1/notifications/send',
  isNewsletter = false,
}) => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'email',
          recipient: 'lafasandip15@gmail.com',
          subject: isNewsletter ? `Newsletter Signup: ${form.email}` : form.subject,
          body: isNewsletter
            ? `New newsletter subscription from: ${form.email}`
            : `From: ${form.name} <${form.email}>\n\nSubject: ${form.subject}\n\n${form.message}`,
        }),
      });
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">{heading}</h2>
        {description && <p className="text-sm text-slate-400">{description}</p>}
      </div>

      {status === 'success' ? (
        <div className="p-4 bg-emerald-950/50 border border-emerald-800/40 rounded-xl text-emerald-300 text-sm font-semibold text-center">
          ✓ {isNewsletter ? 'Successfully subscribed! You will receive quarterly updates.' : 'Message sent successfully. We will respond within 2-3 business days.'}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isNewsletter && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="contact-name">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm outline-none focus:border-sky-600 transition-colors placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="contact-email">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm outline-none focus:border-sky-600 transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          {isNewsletter && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="newsletter-email">
                Email Address
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm outline-none focus:border-sky-600 transition-colors placeholder:text-slate-600"
              />
            </div>
          )}

          {!isNewsletter && (
            <>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="contact-subject">
                  Subject
                </label>
                <select
                  id="contact-subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm outline-none focus:border-sky-600 transition-colors"
                >
                  <option value="">Select inquiry type...</option>
                  <option value="Legal Research Inquiry">Legal Research Inquiry</option>
                  <option value="Academic Collaboration">Academic Collaboration</option>
                  <option value="Keynote Speaking Request">Keynote Speaking Request</option>
                  <option value="Accessibility Consulting">Accessibility Consulting</option>
                  <option value="Translation Services">Translation Services</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe your inquiry..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm outline-none focus:border-sky-600 transition-colors placeholder:text-slate-600 resize-none"
                />
              </div>
            </>
          )}

          {status === 'error' && (
            <p className="text-xs text-red-400 font-semibold">
              Failed to send. Please try again or email directly at lafasandip15@gmail.com
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors shadow-md"
          >
            {status === 'sending'
              ? (isNewsletter ? 'Subscribing...' : 'Sending...')
              : (isNewsletter ? 'Subscribe to Newsletter' : 'Send Message')}
          </button>
        </form>
      )}
    </section>
  );
};
