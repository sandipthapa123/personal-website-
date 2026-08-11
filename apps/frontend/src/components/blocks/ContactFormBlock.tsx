'use client';

import React, { useState } from 'react';
import { CheckIcon } from '../ui/Icon';

export interface ContactFormBlockProps {
  heading?: string;
  description?: string;
  apiEndpoint?: string;
  isNewsletter?: boolean;
}

export const ContactFormBlock: React.FC<ContactFormBlockProps> = ({
  heading = 'Contact',
  description = 'For research inquiries, keynote speaking, or legal consulting, reach out via the secure portal.',
  apiEndpoint = 'http://127.0.0.1:4000/api/v1/contact',
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
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name || 'Subscriber',
          email: form.email,
          subject: isNewsletter ? `Newsletter Signup: ${form.email}` : form.subject,
          message: isNewsletter ? 'Newsletter Subscription Request' : form.message,
          isNewsletter,
        }),
      });
      if (!res.ok) {
        throw new Error('API returned an error');
      }
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="bg-ink-elevated border border-ink-border rounded-2xl p-8 space-y-6">
      <div className="space-y-2">
        <h2 className="font-serif-display text-2xl font-semibold text-ink-100 tracking-tight">{heading}</h2>
        {description && <p className="text-sm text-ink-400">{description}</p>}
      </div>

      {status === 'success' ? (
        <div className="p-4 bg-emerald-950/50 border border-emerald-800/40 rounded-xl text-emerald-300 text-sm font-semibold text-center inline-flex items-center justify-center gap-2 w-full">
          <CheckIcon className="text-base" /> {isNewsletter ? 'Successfully subscribed! You will receive quarterly updates.' : 'Message sent successfully. We will respond within 2-3 business days.'}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isNewsletter && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-ink-400 uppercase tracking-wider" htmlFor="contact-name">
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
                  className="w-full px-4 py-2.5 bg-ink border border-ink-border rounded-lg text-ink-100 text-sm outline-none focus:border-gold transition-colors placeholder:text-ink-400/60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-ink-400 uppercase tracking-wider" htmlFor="contact-email">
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
                  className="w-full px-4 py-2.5 bg-ink border border-ink-border rounded-lg text-ink-100 text-sm outline-none focus:border-gold transition-colors placeholder:text-ink-400/60"
                />
              </div>
            </div>
          )}

          {isNewsletter && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-ink-400 uppercase tracking-wider" htmlFor="newsletter-email">
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
                className="w-full px-4 py-2.5 bg-ink border border-ink-border rounded-lg text-ink-100 text-sm outline-none focus:border-gold transition-colors placeholder:text-ink-400/60"
              />
            </div>
          )}

          {!isNewsletter && (
            <>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-ink-400 uppercase tracking-wider" htmlFor="contact-subject">
                  Subject
                </label>
                <select
                  id="contact-subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-ink border border-ink-border rounded-lg text-ink-100 text-sm outline-none focus:border-gold transition-colors"
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
                <label className="block text-[11px] font-bold text-ink-400 uppercase tracking-wider" htmlFor="contact-message">
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
                  className="w-full px-4 py-2.5 bg-ink border border-ink-border rounded-lg text-ink-100 text-sm outline-none focus:border-gold transition-colors placeholder:text-ink-400/60 resize-none"
                />
              </div>
            </>
          )}

          {status === 'error' && (
            <p className="text-xs text-red-400 font-semibold">
              Failed to send. Please try again later.
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="px-6 py-2.5 bg-gold hover:brightness-110 disabled:opacity-60 text-ink font-bold text-sm rounded-xl transition-all shadow-md shadow-gold/10"
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
