import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props  { children: ReactNode; }
interface State  { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Vibe Creator] Unhandled error:', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="min-h-screen flex items-center justify-center flex-col gap-4 p-8 text-center"
        style={{ background: 'var(--bg)', color: 'var(--text)' }}
      >
        <p className="font-cinzel text-2xl tracking-widest" style={{ color: 'var(--gold)' }}>
          SIGNAL LOST
        </p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {this.state.error?.message ?? 'Something went wrong.'}
        </p>
        <button
          onClick={this.reset}
          className="px-6 py-2 rounded-lg font-cinzel text-sm tracking-widest transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--gold), var(--cyan))',
            color: 'var(--bg)',
            cursor: 'pointer',
          }}
        >
          REBOOT
        </button>
      </div>
    );
  }
}
