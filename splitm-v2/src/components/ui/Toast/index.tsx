import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../../core/utils/helpers';
import { Button } from '../Button';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000); // Auto dismiss after 4s
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none px-4 sm:px-0">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-center justify-between p-4 rounded-lg shadow-lg border animate-in slide-in-from-bottom-5 duration-300",
                t.type === 'success' && "bg-slate-800 border-success text-slate-100",
                t.type === 'error' && "bg-danger border-red-800 text-white",
                t.type === 'info' && "bg-slate-800 border-primary text-slate-100"
              )}
              role="alert"
            >
              <div className="flex items-center gap-3">
                {t.type === 'success' && <CheckCircle className="h-5 w-5 text-success" />}
                {t.type === 'error' && <AlertCircle className="h-5 w-5 text-white" />}
                {t.type === 'info' && <Info className="h-5 w-5 text-primary" />}
                <p className="text-sm font-medium">{t.message}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-black/10"
                onClick={() => removeToast(t.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
