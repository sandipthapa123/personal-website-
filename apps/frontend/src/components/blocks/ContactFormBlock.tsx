'use client';

import React, { useId, useState } from 'react';
import { CheckIcon } from '../ui/Icon';
import { useAnnounce } from '../../hooks/useAnnounce';
import { Section, SectionHeading, buttonStyles, slugifyId } from '../ui/primitives';

export interface ContactFormBlockProps {
  heading?: string;
  description?: string;
  apiEndpoint?: string;
  isNewsletter?: boolean;
}

type FormErrors = Partial<Record<'name' | 'email' | 'subject' | 'message', string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ContactFormBlock: React.FC<ContactFormBlockProps> = ({
  heading = 'Contact',
  description = 'For research inquiries, keynote speaking, or legal consulting, reach out via the secure portal.',
  // Falls back to the configured API origin rather than a hardcoded localhost
  // address, which silently failed for every visitor in production whenever the
  // CMS did not supply an explicit endpoint.
  apiEndpoint = `${(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1').replace(/\/+$/, '')}/contact`,
  isNewsletter = false,
}) => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const announce = useAnnounce();
  const idPrefix = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
    setErrors((prev) => (prev[name as keyof FormErrors] ? { ...prev, [name]: undefined } : prev));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.email.trim()) {
      next.email = 'Email address is required.';
    } else if (!EMAIL_PATTERN.test(form.email)) {
      next.email = 'Enter a valid email address.';
    }
    if (!isNewsletter) {
      if (!form.name.trim()) next.name = 'Full name is required.';
      if (!form.subject.trim()) next.subject = 'Select an inquiry type.';
      if (!form.message.trim()) next.message = 'Message is required.';
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      announce(`Form has ${Object.keys(validationErrors).length} error${Object.keys(validationErrors).length > 1 ? 's' : ''}. Please review the highlighted fields.`);
      const firstErrorField = Object.keys(validationErrors)[0];
      document.getElementById(`${idPrefix}-${firstErrorField}`)?.focus();
      return;
    }

    setStatus('sending');
    announce(isNewsletter ? 'Subscribing…' : 'Sending message…');
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
      setErrors({});
      setForm({ name: '', email: '', subject: '', message: '' });
      announce(isNewsletter ? 'Successfully subscribed to the newsletter.' : 'Message sent successfully.');
    } catch {
      setStatus('error');
      announce('Failed to send. Please try again later.');
    }
  };

  const fieldId = (name: string) => `${idPrefix}-${name}`;
  const errorId = (name: string) => `${idPrefix}-${name}-error`;

  /** One source of truth for field styling. `min-h-[44px]` meets the WCAG 2.2
   *  AAA target-size rule that the previous padding-only inputs fell short of. */
  const fieldClass = (hasError: boolean, extra = '') =>
    [
      'w-full min-h-[44px] rounded-lg border bg-ink px-4 py-2.5 text-sm text-ink-100 outline-none transition-colors placeholder:text-ink-400/60',
      hasError ? 'border-errorText' : 'border-ink-border hover:border-ink-border focus:border-gold-text',
      extra,
    ]
      .filter(Boolean)
      .join(' ');

  const headingId = slugifyId(heading || 'contact', 'form');

  return (
    <Section labelledBy={headingId} tone="panel" className="edge-lit space-y-7">
      <SectionHeading id={headingId} title={heading} description={description} />

      <div role="status" aria-live="polite" className="sr-only">
        {status === 'sending' && (isNewsletter ? 'Subscribing…' : 'Sending message…')}
        {status === 'success' && (isNewsletter ? 'Successfully subscribed to the newsletter.' : 'Message sent successfully.')}
        {status === 'error' && 'Failed to send. Please try again later.'}
      </div>

      {status === 'success' ? (
        <div className="p-4 bg-successText/10 border border-successText/40 rounded-xl text-successText text-sm font-semibold text-center inline-flex items-center justify-center gap-2 w-full">
          <CheckIcon className="text-base" /> {isNewsletter ? 'Successfully subscribed! You will receive quarterly updates.' : 'Message sent successfully. We will respond within 2-3 business days.'}
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {!isNewsletter && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-ink-400 uppercase tracking-wider" htmlFor={fieldId('name')}>
                  Full Name
                </label>
                <input
                  id={fieldId('name')}
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? errorId('name') : undefined}
                  placeholder="Your full name"
                  className={fieldClass(Boolean(errors.name))}
                />
                {errors.name && (
                  <p id={errorId('name')} className="text-xs font-semibold text-errorText">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-ink-400 uppercase tracking-wider" htmlFor={fieldId('email')}>
                  Email Address
                </label>
                <input
                  id={fieldId('email')}
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? errorId('email') : undefined}
                  placeholder="your@email.com"
                  className={fieldClass(Boolean(errors.email))}
                />
                {errors.email && (
                  <p id={errorId('email')} className="text-xs font-semibold text-errorText">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          )}

          {isNewsletter && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-ink-400 uppercase tracking-wider" htmlFor={fieldId('email')}>
                Email Address
              </label>
              <input
                id={fieldId('email')}
                type="email"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
                aria-required="true"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? errorId('email') : undefined}
                placeholder="your@email.com"
                className={fieldClass(Boolean(errors.email))}
              />
              {errors.email && (
                <p id={errorId('email')} className="text-xs font-semibold text-errorText">
                  {errors.email}
                </p>
              )}
            </div>
          )}

          {!isNewsletter && (
            <>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-ink-400 uppercase tracking-wider" htmlFor={fieldId('subject')}>
                  Subject
                </label>
                <select
                  id={fieldId('subject')}
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? errorId('subject') : undefined}
                  className={fieldClass(Boolean(errors.subject))}
                >
                  <option value="">Select inquiry type...</option>
                  <option value="Legal Research Inquiry">Legal Research Inquiry</option>
                  <option value="Academic Collaboration">Academic Collaboration</option>
                  <option value="Keynote Speaking Request">Keynote Speaking Request</option>
                  <option value="Accessibility Consulting">Accessibility Consulting</option>
                  <option value="Translation Services">Translation Services</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
                {errors.subject && (
                  <p id={errorId('subject')} className="text-xs font-semibold text-errorText">
                    {errors.subject}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-ink-400 uppercase tracking-wider" htmlFor={fieldId('message')}>
                  Message
                </label>
                <textarea
                  id={fieldId('message')}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? errorId('message') : undefined}
                  rows={4}
                  placeholder="Describe your inquiry..."
                  className={fieldClass(Boolean(errors.message), 'min-h-[8rem] resize-y')}
                />
                {errors.message && (
                  <p id={errorId('message')} className="text-xs font-semibold text-errorText">
                    {errors.message}
                  </p>
                )}
              </div>
            </>
          )}

          {status === 'error' && (
            <p className="text-xs text-errorText font-semibold">
              Failed to send. Please try again later.
            </p>
          )}

          <button type="submit" disabled={status === 'sending'} className={buttonStyles('primary', 'w-full sm:w-auto')}>
            {status === 'sending'
              ? (isNewsletter ? 'Subscribing...' : 'Sending...')
              : (isNewsletter ? 'Subscribe to Newsletter' : 'Send Message')}
          </button>
        </form>
      )}
    </Section>
  );
};
