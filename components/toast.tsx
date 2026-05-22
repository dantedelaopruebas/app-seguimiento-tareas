"use client";

import { create } from "zustand";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

interface ToastState {
  message: string | null;
  show: (m: string) => void;
  hide: () => void;
}
export const useToast = create<ToastState>((set) => ({
  message: null,
  show: (m) => set({ message: m }),
  hide: () => set({ message: null }),
}));

export function Toaster() {
  const { message, hide } = useToast();
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(hide, 1800);
    return () => clearTimeout(t);
  }, [message, hide]);

  if (!message) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-2 bg-bg-surface border border-border rounded-lg px-3 py-2 shadow-xl">
        <CheckCircle2 className="w-4 h-4 text-accent" />
        <span className="text-[13px]">{message}</span>
      </div>
    </div>
  );
}
