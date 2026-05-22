"use client";

import { Search, MoreHorizontal } from "lucide-react";
import { useCommandPalette } from "./command-palette";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const open = useCommandPalette((s) => s.open);
  return (
    <header className="h-12 border-b border-border-subtle flex items-center justify-between px-5 shrink-0 bg-bg/80 backdrop-blur">
      <div className="flex items-baseline gap-3">
        <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1>
        {subtitle && <span className="text-[12px] text-fg-subtle">{subtitle}</span>}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={open}
          className="flex items-center gap-2 text-[12px] text-fg-muted hover:text-fg bg-bg-surface hover:bg-bg-elevated border border-border-subtle rounded-md px-2.5 py-1 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          Buscar
          <span className="kbd ml-2">⌘K</span>
        </button>
        <button className="p-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-bg-surface transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
