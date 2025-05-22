import React, { createContext, useContext, useState } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };

    setToasts(prev => [...prev, newToast]);

    // Auto dismiss after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        dismiss(id);
      }, toast.duration || 3000);
    }
  };

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}

      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-0 right-0 p-4 z-50 flex flex-col gap-2">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`p-4 rounded shadow-lg max-w-sm animate-in slide-in-from-right-5
                ${toast.variant === 'destructive' ? 'bg-red-100 border-l-4 border-red-500 text-red-700' :
                  toast.variant === 'success' ? 'bg-green-100 border-l-4 border-green-500 text-green-700' :
                  'bg-white border-l-4 border-blue-500 text-gray-700'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{toast.title}</h3>
                  {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
                </div>
                <button
                  onClick={() => dismiss(toast.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Export both the hook and the provider
export { ToastProvider };
export default { useToast, ToastProvider };
