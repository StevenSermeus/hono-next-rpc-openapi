'use client';

import React from 'react';

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<ErrorBoundaryProps>> {
  state: {
    hasError: boolean;
  } = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error) {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
