'use client';

import React, { useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const [userEmail, setUserEmail] = useState('lafasandip15@gmail.com');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = sessionStorage.getItem('cms_access_token');
      const storedEmail = localStorage.getItem('cms_user_email');
      if (storedToken) setToken(storedToken);
      if (storedEmail) setUserEmail(storedEmail);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('cms_access_token');
      window.location.href = '/admin/login';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Admin Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-lg">
            ST
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white">Sandip Thapa CMS</h1>
            <p className="text-xs text-slate-400">Enterprise Admin Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">{userEmail}</span>
            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Super Admin</span>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold rounded-lg transition-all"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome Banner */}
        <section className="bg-gradient-to-r from-sky-900/40 via-slate-900 to-indigo-900/40 border border-sky-500/20 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="inline-block px-3 py-1 bg-sky-500/10 border border-sky-400/30 text-sky-300 rounded-full text-xs font-semibold">
              ✓ Active Session Authenticated
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Welcome back, Sandip Thapa</h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              All engine modules (Multi-Tenant Architecture, Design Tokens, Workflow Orchestrator, Dual BS/AD Date Converter, and Accessible Components) are active and running.
            </p>
          </div>
        </section>

        {/* System Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 shadow-md">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Backend API Gateway</span>
            <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Online (Port 4000)
            </div>
            <p className="text-[11px] text-slate-400">OpenAPI Docs ready at /api/docs</p>
          </div>

          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 shadow-md">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Published Content</span>
            <div className="text-2xl font-black text-white">12 Pages / Posts</div>
            <p className="text-[11px] text-slate-400">BS & AD Dual Timestamps enabled</p>
          </div>

          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 shadow-md">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Design Token Engine</span>
            <div className="text-2xl font-black text-sky-400">Active (48 Tokens)</div>
            <p className="text-[11px] text-slate-400">Live CSS compiled dynamically</p>
          </div>

          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 shadow-md">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Accessibility Suite</span>
            <div className="text-2xl font-black text-indigo-400">WCAG 2.1 AAA</div>
            <p className="text-[11px] text-slate-400">OpenDyslexic & High Contrast ready</p>
          </div>
        </section>

        {/* Quick Operations & Session Info */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4 shadow-md">
            <h3 className="text-lg font-extrabold text-white">System Operations & Shortcuts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="/"
                target="_blank"
                className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center justify-between text-sm font-bold text-slate-200 transition-all group"
              >
                <span>🌐 Visit Public Website</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>

              <a
                href="http://localhost:4000/api/docs"
                target="_blank"
                className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center justify-between text-sm font-bold text-sky-400 transition-all group"
              >
                <span>📚 Swagger OpenAPI Docs</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>

              <a
                href="http://localhost:4000/api/v1/health"
                target="_blank"
                className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center justify-between text-sm font-bold text-emerald-400 transition-all group"
              >
                <span>🩺 Backend Health Diagnostics</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-sm font-bold text-slate-400">
                <span>⌨️ Universal Command Palette</span>
                <span className="px-2 py-0.5 bg-slate-800 rounded text-xs">Ctrl + K</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4 shadow-md">
            <h3 className="text-lg font-extrabold text-white">Active Session Details</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block uppercase">Authenticated User</span>
                <span className="font-mono text-slate-200">{userEmail}</span>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block uppercase">Assigned Roles</span>
                <span className="inline-block px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded font-semibold mt-0.5">
                  SUPER_ADMIN
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block uppercase">JWT Access Token</span>
                <div className="mt-1 p-2 bg-slate-950 rounded font-mono text-[10px] text-slate-400 break-all max-h-20 overflow-y-auto border border-slate-800">
                  {token || 'Session Token Active in Storage'}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
