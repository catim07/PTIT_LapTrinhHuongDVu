export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

type Listener = (toast: ToastMessage) => void;
let listeners: Listener[] = [];

export const toast = {
  add: (message: string, type: ToastType = 'info') => {
    const newToast = { id: Date.now().toString() + Math.random(), type, message };
    listeners.forEach(l => l(newToast));
  },
  success: (message: string) => toast.add(message, 'success'),
  error: (message: string) => toast.add(message, 'error'),
  info: (message: string) => toast.add(message, 'info'),
  warning: (message: string) => toast.add(message, 'warning'),
  subscribe: (listener: Listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};
