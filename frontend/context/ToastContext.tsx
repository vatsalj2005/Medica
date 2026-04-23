"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";
interface Toast { id: number; message: string; type: ToastType; }
interface ToastContextType { showToast: (message: string, type: ToastType) => void; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const styles: Record<ToastType, { border: string; text: string; icon: string; bg: string }> = {
  success: { border: "border-green-500",  text: "text-green-400",  icon: "✓", bg: "bg-green-500/10" },
  error:   { border: "border-red-500",    text: "text-red-400",    icon: "✗", bg: "bg-red-500/10"   },
  info:    { border: "border-blue-500",   text: "text-blue-400",   icon: "ℹ", bg: "bg-blue-500/10"  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => {
          const s = styles[t.type];
          return (
            <div
              key={t.id}
              className={`animate-toast-slide pointer-events-auto ${s.bg} border-l-4 ${s.border} rounded-xl shadow-2xl shadow-black/50 px-4 py-3 min-w-[280px] max-w-sm flex items-center gap-3`}
            >
              <span className={`text-base font-bold ${s.text} shrink-0`}>{s.icon}</span>
              <p className="text-sm text-[#e8f5e8] font-medium leading-snug">{t.message}</p>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
