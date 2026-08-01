'use client';

import React, { useState } from 'react';

export default function AdminResetPasswordPage() {
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPass: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password.');

      setMsg(data.message || 'Password reset successfully!');
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 text-white font-sans">
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center font-black text-xl mx-auto shadow-md">
            🔑
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Set New Password</h1>
          <p className="text-xs text-slate-400">Enter your password reset token and new credentials</p>
        </div>

        {errorMsg && (
          <div role="alert" className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-lg text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {msg && (
          <div role="status" className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-semibold">
            ✓ {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label htmlFor="reset-token" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Reset Token
            </label>
            <input
              id="reset-token"
              type="text"
              required
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              placeholder="Paste reset token here..."
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors font-mono text-xs"
            />
          </div>

          <div>
            <label htmlFor="new-pass" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              New Password
            </label>
            <input
              id="new-pass"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="confirm-pass" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Confirm New Password
            </label>
            <input
              id="confirm-pass"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-lg transition-all focus-visible:ring disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Reset Password'}
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
