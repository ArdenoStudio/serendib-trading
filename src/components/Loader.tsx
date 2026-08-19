interface LoaderProps {
  /** Full-page overlay for route/auth waits. Inline loaders should pass false. */
  fullScreen?: boolean;
}

export default function Loader({ fullScreen = true }: LoaderProps) {
  return (
    <div
      className={
        fullScreen
          ? 'flex min-h-screen items-center justify-center bg-[#0d0b09]'
          : 'flex items-center justify-center py-24'
      }
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37]" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
