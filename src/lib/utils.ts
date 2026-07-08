import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Values that mean "no real data" — includes the field labels themselves, which
// occasionally get saved as the value (e.g. transmission === "Transmission").
const SPEC_PLACEHOLDERS = new Set([
  '', 'n/a', 'na', '-', '–', '—', 'unknown', 'undefined', 'null', 'none',
  'transmission', 'fuel', 'fuel type', 'body type', 'bodytype', 'condition', 'make', 'model',
])

// Returns a spec value only if it carries real information, otherwise null so the
// UI can hide the field or show a graceful fallback instead of a broken label.
export function cleanSpec(value?: string | null): string | null {
  const v = String(value ?? '').trim()
  if (!v || SPEC_PLACEHOLDERS.has(v.toLowerCase())) return null
  return v
}
