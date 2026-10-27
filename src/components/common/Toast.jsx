import React from 'react';
import { useShopping } from '../../context/ShoppingContext.jsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, dismissToast } = useShopping();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg text-sm transition-all duration-200 ${
              isSuccess
                ? 'bg-emerald-950 text-emerald-50 border-emerald-800'
                : isError
                ? 'bg-rose-950 text-rose-50 border-rose-800'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-slate-400" />}
            </div>

            <div className="flex-1 font-medium leading-snug">{toast.message}</div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
