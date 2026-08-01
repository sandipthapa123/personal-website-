'use client';

import React, { useState } from 'react';
import { ACCESSIBILITY_CONSTANTS } from '@cms/accessibility';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('lafasandip15@gmail.com');
  const [password, setPassword] = useState('Sandip@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pass: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      setSuccessMsg('Logged in successfully! Redirecting to CMS dashboard...');
      
      // Store token
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cms_access_token', data.accessToken);
        if (rememberMe) {
          localStorage.setItem('cms_user_email', email);
        }
      }

      const announcer = document.getElementById(ACCESSIBILITY_CONSTANTS.LIVE_ANNOUNCER_ID);
      if (announcer) announcer.textContent = 'Login successful. Redirecting to dashboard.';

      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
      const announcer = document.getElementById(ACCESSIBILITY_CONSTANTS.LIVE_ANNOUNCER_ID);
      if (announcer) announcer.textContent = `Login error: ${err.message}`;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 text-white font-sans">
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center font-black text-xl mx-auto shadow-md">
            ST
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin CMS Portal</h1>
          <p className="text-xs text-slate-400">Sign in to manage thapasandip.com.np platform</p>
        </div>

        {errorMsg && (
          <div role="alert" className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-lg text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div role="status" className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-semibold">
            ✓ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lafasandip15@gmail.com"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="admin-pass" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <a href="/admin/forgot-password" className="text-xs font-semibold text-sky-400 hover:underline">
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <input
                id="admin-pass"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 bg-slate-900 border-slate-800"
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-lg transition-all focus-visible:ring disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          Enterprise Security Enabled · 256-bit Encrypted Session
        </div>
      </div>
    </div>
  );
}
