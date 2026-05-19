import type React from "react";

interface LiquidMetalButtonProps {
  label?: string;
  onClick?: () => void;
  viewMode?: "text" | "icon";
  icon?: React.ReactNode;
  color?: string;
}

export function LiquidMetalButton({
  label = "Get Started",
  onClick,
  viewMode = "text",
  icon,
  color = "#D4AF37",
}: LiquidMetalButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[#D4AF37]/30 bg-black/80 text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37] ${
        viewMode === "icon" ? "size-14" : "h-12 min-w-40 px-7"
      }`}
      style={{ color }}
    >
      <span
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_32%),linear-gradient(135deg,rgba(212,175,55,0.22),transparent_52%)] opacity-90"
        aria-hidden="true"
      />
      <span className="relative z-10 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
        {viewMode === "icon" ? icon : label}
      </span>
    </button>
  );
}
