import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          background: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          margin: '1rem'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>
            Something went wrong
          </h2>
          <details style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '1rem' }}>
              Click to see error details
            </summary>
            <div style={{ 
              background: '#f1f3f4', 
              padding: '1rem', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              <strong>Error:</strong> {this.state.error && this.state.error.toString()}
              <br />
              <strong>Stack trace:</strong>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </div>
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={{
              padding: '0.5rem 1rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;