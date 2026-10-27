import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isDestructive ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 id="confirm-modal-title" className="text-base font-semibold text-slate-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-sm'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-sm'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
