'use client';

import React, { useState } from 'react';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('lafasandip15@gmail.com');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const res = await fetch('http://localhost:4000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMsg(data.message || 'Password reset link sent to your registered email.');
    } catch {
      setMsg('Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 text-white font-sans">
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center font-black text-xl mx-auto shadow-md">
            🔒
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Forgot Password</h1>
          <p className="text-xs text-slate-400">Enter your email to receive a secure password reset link</p>
        </div>

        {msg && (
          <div role="status" className="p-3 bg-sky-950/80 border border-sky-800 text-sky-300 rounded-lg text-xs font-semibold">
            ℹ️ {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Registered Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lafasandip15@gmail.com"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-lg transition-all focus-visible:ring disabled:opacity-50"
          >
            {loading ? 'Sending Reset Token...' : 'Send Password Reset Link'}
          </button>
        </form>

        <div className="text-center pt-2">
          <a href="/admin/login" className="text-xs font-semibold text-sky-400 hover:underline">
            ← Back to Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}
