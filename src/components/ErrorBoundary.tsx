import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  attempt: number;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, attempt: 0 };

  static getDerivedStateFromError(): State {
    return { hasError: true, attempt: 0 };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  private handleReset = () => {
    // Remount children via a fresh key so the same error doesn't replay.
    this.setState((prev) => ({ hasError: false, attempt: prev.attempt + 1 }));
  };

  render() {
    if (!this.state.hasError) {
      return <div key={this.state.attempt}>{this.props.children}</div>;
    }

    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-24 bg-[#0d0b09] text-white">
        <div className="max-w-lg text-center space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">
            Something went wrong
          </p>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            This page could not load
          </h1>
          <p className="text-sm text-white/55 leading-relaxed">
            Please try again, or return home and continue browsing the inventory.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full sm:w-auto px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-black"
              style={{ background: 'linear-gradient(135deg,#E5C158 0%,#D4AF37 100%)' }}
            >
              Try again
            </button>
            <Link
              to="/"
              onClick={this.handleReset}
              className="w-full sm:w-auto px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-white/80 border border-white/15"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
