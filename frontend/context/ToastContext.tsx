"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";
interface Toast { id: number; message: string; type: ToastType; }
interface ToastContextType { showToast: (message: string, type: ToastType) => void; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const colors = { success: "border-green-500 text-green-400", error: "border-red-500 text-red-400", info: "border-blue-500 text-blue-400" };
  const icons  = { success: "✓", error: "✗", info: "ℹ" };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`animate-slide-in bg-[#1a1d27] border-l-4 rounded-xl shadow-2xl p-4 min-w-[300px] flex items-center gap-3 ${colors[t.type]}`}>
            <span className="text-lg">{icons[t.type]}</span>
            <p className="text-sm text-[#f1f5f9] font-medium">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
