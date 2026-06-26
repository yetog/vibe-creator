import { Component, type ReactNode } from 'react';

interface Props  { children: ReactNode; }
interface State  { hasError: boolean; message: string; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: { componentStack: string }) {
    console.error('[Vibe Creator] Uncaught error:', err, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 p-8"
        style={{ background: 'var(--bg)', color: 'var(--text)' }}
      >
        <p className="font-cinzel text-4xl font-bold" style={{ color: 'var(--gold)' }}>
          SIGNAL LOST
        </p>
        <p className="text-sm text-center max-w-sm" style={{ color: 'var(--muted)' }}>
          {this.state.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 rounded-lg font-medium text-sm transition-opacity hover:opacity-80"
          style={{ background: 'var(--gold)', color: 'var(--bg)' }}
        >
          REBOOT
        </button>
      </div>
    );
  }
}
