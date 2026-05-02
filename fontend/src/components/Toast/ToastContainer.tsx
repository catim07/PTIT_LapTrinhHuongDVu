import React, { useState, useEffect } from 'react';
import { toast } from './toastEvent';
import type { ToastMessage } from './toastEvent';

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsub = toast.subscribe((newToast) => {
      setToasts(prev => [...prev, newToast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 4000);
    });
    return () => {
        unsub();
        setToasts([]);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div 
          key={t.id} 
          className={`pointer-events-auto flex items-center gap-3 min-w-[300px] max-w-sm px-4 py-3 bg-white dark:bg-slate-800 border-l-4 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all animate-fade-in
          ${t.type === 'success' ? 'border-green-500' : 
            t.type === 'error' ? 'border-red-500' : 
            t.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'}
          `}
        >
          {t.type === 'success' && <span className="material-symbols-outlined text-green-500">check_circle</span>}
          {t.type === 'error' && <span className="material-symbols-outlined text-red-500">error</span>}
          {t.type === 'info' && <span className="material-symbols-outlined text-blue-500">info</span>}
          {t.type === 'warning' && <span className="material-symbols-outlined text-yellow-500">warning</span>}
          
          <div className="flex-1 font-medium text-sm text-slate-800 dark:text-slate-200">
            {t.message}
          </div>
          
          <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
export default ToastContainer;
