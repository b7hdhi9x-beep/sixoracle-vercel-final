"use client";

import { useState, useRef, useEffect } from "react";

interface ExportMenuProps {
  sessionId: string | null;
}

export function ExportMenu({ sessionId }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function download(format: "txt" | "csv") {
    if (!sessionId) return;
    window.open(`/api/export/${sessionId}?format=${format}`, "_blank");
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={!sessionId}
        className="text-[#9ca3af] hover:text-[#d4af37] transition-colors p-2 disabled:opacity-30"
        title="エクスポート"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 glass-card rounded-lg border border-[rgba(212,175,55,0.2)] shadow-xl z-50 py-1 min-w-[140px]">
          <button
            onClick={() => download("txt")}
            className="w-full text-left px-4 py-2 text-xs text-[#9ca3af] hover:text-[#d4af37] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            テキスト (.txt)
          </button>
          <button
            onClick={() => download("csv")}
            className="w-full text-left px-4 py-2 text-xs text-[#9ca3af] hover:text-[#d4af37] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            CSV (.csv)
          </button>
        </div>
      )}
    </div>
  );
}
