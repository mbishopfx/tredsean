'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log error for debugging
    if (typeof window !== 'undefined') {
      // Send error to logging service in production
      console.error('Component Error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.retry} />;
      }

      return (
        <div className="min-h-screen bg-tech-background flex items-center justify-center p-4">
          <div className="bg-tech-card rounded-lg shadow-tech max-w-md w-full overflow-hidden">
            <div className="h-1 bg-gradient-danger"></div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-status-danger bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-status-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold text-tech-foreground mb-2">
                Oops! Something went wrong
              </h2>
              
              <p className="text-gray-400 text-sm mb-6">
                The application encountered an unexpected error. This might be due to multiple users accessing the system simultaneously.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4 text-left">
                  <summary className="text-sm text-gray-400 cursor-pointer mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="bg-tech-secondary p-3 rounded text-xs text-gray-300 overflow-auto max-h-32">
                    <div className="font-medium text-status-danger mb-1">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    <pre className="whitespace-pre-wrap text-xs">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </details>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={this.retry}
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-200"
                >
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-tech-secondary text-tech-foreground py-2 px-4 rounded-md hover:bg-tech-border transition-colors duration-200"
                >
                  Refresh Page
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                If this problem persists, please refresh the page or contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 