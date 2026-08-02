'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

export type DialogSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER' | 'CRITICAL';

export interface IDialogConfig {
  id?: string;
  type?: 'CONFIRM' | 'VALIDATION' | 'LOADING' | 'INFO';
  title: string;
  description?: string;
  severity?: DialogSeverity;
  confirmText?: string;
  cancelText?: string;
  errors?: string[];
  focusElementId?: string;
  progressPercent?: number;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface IToastConfig {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

interface IDialogContext {
  openDialog: (config: IDialogConfig) => void;
  closeDialog: () => void;
  showToast: (config: Omit<IToastConfig, 'id'>) => void;
  showValidationErrors: (title: string, errors: string[], firstErrorInputId?: string) => void;
  confirmDelete: (itemTitle: string, itemType: string, onConfirm: () => void) => void;
  confirmBulkDelete: (count: number, itemType: string, onConfirm: () => void) => void;
}

const DialogContext = createContext<IDialogContext | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [activeDialog, setActiveDialog] = useState<IDialogConfig | null>(null);
  const [toasts, setToasts] = useState<IToastConfig[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  const openDialog = (config: IDialogConfig) => {
    triggerElementRef.current = document.activeElement as HTMLElement;
    setActiveDialog({ ...config, severity: config.severity || 'INFO' });
  };

  const closeDialog = () => {
    setActiveDialog(null);
    if (triggerElementRef.current) {
      triggerElementRef.current.focus();
    }
  };

  const showToast = (toast: Omit<IToastConfig, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const showValidationErrors = (title: string, errors: string[], firstErrorInputId?: string) => {
    openDialog({
      type: 'VALIDATION',
      title: title || 'Validation Errors Found',
      errors,
      focusElementId: firstErrorInputId,
      severity: 'WARNING',
      confirmText: 'Go to First Error',
      cancelText: 'Close',
      onConfirm: () => {
        closeDialog();
        if (firstErrorInputId) {
          const el = document.getElementById(firstErrorInputId);
          if (el) el.focus();
        }
      },
    });
  };

  const confirmDelete = (itemTitle: string, itemType: string, onConfirm: () => void) => {
    openDialog({
      type: 'CONFIRM',
      title: `Delete ${itemType}?`,
      description: `This action will permanently move "${itemTitle}" to Trash. This cannot be undone.`,
      severity: 'DANGER',
      confirmText: `Delete ${itemType}`,
      cancelText: 'Cancel',
      onConfirm,
    });
  };

  const confirmBulkDelete = (count: number, itemType: string, onConfirm: () => void) => {
    openDialog({
      type: 'CONFIRM',
      title: `Delete ${count} ${itemType}s?`,
      description: `You are about to permanently delete ${count} ${itemType} items.`,
      severity: 'CRITICAL',
      confirmText: `Delete ${count} ${itemType}s`,
      cancelText: 'Cancel',
      onConfirm,
    });
  };

  // Keyboard navigation & trap focus inside modal (WCAG 2.2 AAA)
  useEffect(() => {
    if (!activeDialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDialog();
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeDialog]);

  // Focus modal primary button when opened
  useEffect(() => {
    if (activeDialog && dialogRef.current) {
      const primaryBtn = dialogRef.current.querySelector<HTMLElement>('.btn-primary-modal');
      if (primaryBtn) primaryBtn.focus();
    }
  }, [activeDialog]);

  return (
    <DialogContext.Provider
      value={{ openDialog, closeDialog, showToast, showValidationErrors, confirmDelete, confirmBulkDelete }}
    >
      {children}

      {/* WCAG 2.2 AAA Accessible Modal Backdrop */}
      {activeDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-desc"
          ref={dialogRef}
        >
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            {/* Header / Severity Badge */}
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-extrabold px-2.5 py-1 rounded uppercase tracking-wider ${
                  activeDialog.severity === 'DANGER' || activeDialog.severity === 'CRITICAL'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    : activeDialog.severity === 'WARNING'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    : 'bg-sky-950/80 text-sky-300 border border-sky-800'
                }`}
              >
                {activeDialog.severity}
              </span>
              <button
                onClick={closeDialog}
                aria-label="Close dialog"
                className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded focus:ring-2 focus:ring-sky-500"
              >
                ✕
              </button>
            </div>

            {/* Title & Description */}
            <div>
              <h2 id="dialog-title" className="text-lg font-extrabold text-white">
                {activeDialog.title}
              </h2>
              {activeDialog.description && (
                <p id="dialog-desc" className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {activeDialog.description}
                </p>
              )}
            </div>

            {/* Validation Error List */}
            {activeDialog.type === 'VALIDATION' && activeDialog.errors && (
              <div className="bg-slate-950 border border-amber-900/50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">The following issues must be resolved:</p>
                <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                  {activeDialog.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  if (activeDialog.onCancel) activeDialog.onCancel();
                  closeDialog();
                }}
                className="px-4 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg focus:ring-2 focus:ring-slate-400"
              >
                {activeDialog.cancelText || 'Cancel'}
              </button>
              <button
                onClick={async () => {
                  if (activeDialog.onConfirm) await activeDialog.onConfirm();
                  closeDialog();
                }}
                className={`btn-primary-modal px-4 py-2 text-xs font-bold text-white rounded-lg focus:ring-2 ${
                  activeDialog.severity === 'DANGER' || activeDialog.severity === 'CRITICAL'
                    ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-400'
                    : 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-400'
                }`}
              >
                {activeDialog.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accessible Toast Container (aria-live) */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-between shadow-lg ${
              toast.type === 'error'
                ? 'bg-rose-950 border-rose-800 text-rose-200'
                : toast.type === 'warning'
                ? 'bg-amber-950 border-amber-800 text-amber-200'
                : 'bg-emerald-950 border-emerald-800 text-emerald-200'
            }`}
          >
            <span>✓ {toast.message}</span>
            {toast.actionLabel && (
              <button
                onClick={toast.onAction}
                className="ml-3 underline font-bold hover:text-white"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within DialogProvider');
  return ctx;
}
