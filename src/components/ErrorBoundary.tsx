import React, { type ReactNode, type ReactElement } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactElement;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary
 * 
 * Catches errors in child components and displays a fallback UI.
 * Prevents entire app crash due to component errors.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ? (
        this.props.fallback(this.state.error!)
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--c-black)',
          color: 'var(--c-white)',
          padding: '20px',
          fontFamily: 'inherit',
        }}>
          <div style={{
            maxWidth: '500px',
            textAlign: 'center',
          }}>
            <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>
              ⚠️ Something went wrong
            </h1>
            <p style={{
              color: 'var(--c-grey2)',
              marginBottom: '20px',
              lineHeight: '1.6',
            }}>
              We encountered an unexpected error. Please try refreshing the page or contact support if the issue persists.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                background: 'linear-gradient(to bottom, #1F87FC, #1873DA)',
                border: 'none',
                color: 'white',
                padding: '11px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Refresh Page
            </button>
            {import.meta.env.DEV && (
              <details style={{
                marginTop: '20px',
                padding: '12px',
                background: 'rgba(234, 67, 53, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(234, 67, 53, 0.2)',
                textAlign: 'left',
                cursor: 'pointer',
              }}>
                <summary style={{ color: '#EA4335', fontWeight: 600 }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                  color: '#EA4335',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {this.state.error?.message}
                  {'\n\n'}
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
