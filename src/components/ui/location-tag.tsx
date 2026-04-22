"use client"

import { useState } from "react"

export function LocationTag() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a
      href="https://maps.app.goo.gl/D4kREnSSBSXDhoyi6"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex items-center gap-3 rounded-full border border-border/60 bg-secondary/50 px-4 py-2.5 transition-all duration-500 ease-out hover:border-foreground/20 hover:bg-secondary/80 hover:shadow-[0_0_20px_rgba(0,0,0,0.04)] w-max"
    >
      {/* Live pulse indicator */}
      <div className="relative flex items-center justify-center">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      </div>

      {/* Location text */}
      <div className="flex items-center gap-2 overflow-hidden h-5 w-[130px] relative">
        <span
          className="absolute inset-y-0 left-0 flex items-center text-sm font-medium text-foreground transition-all duration-500"
          style={{
            transform: isHovered ? "translateY(-100%)" : "translateY(0)",
            opacity: isHovered ? 0 : 1,
          }}
        >
          Colombo, Sri Lanka
        </span>

        <span
          className="absolute inset-y-0 left-0 flex items-center text-sm font-medium text-foreground transition-all duration-500"
          style={{
            transform: isHovered ? "translateY(0)" : "translateY(100%)",
            opacity: isHovered ? 1 : 0,
          }}
        >
          Open in Maps
        </span>
      </div>

      {/* Arrow indicator */}
      <svg
        className="h-3.5 w-3.5 text-foreground transition-all duration-300"
        style={{
          transform: isHovered ? "translateX(2px) rotate(-45deg)" : "translateX(0) rotate(0)",
          opacity: isHovered ? 1 : 0.8,
        }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
      </svg>
    </a>
  )
}
