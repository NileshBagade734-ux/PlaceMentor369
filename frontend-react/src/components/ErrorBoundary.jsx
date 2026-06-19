import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorInfo: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.header}>Oops! Something went wrong.</h1>
            <p style={styles.text}>
              An unexpected error occurred in the application. We have been notified and are looking into it.
            </p>
            {process.env.NODE_ENV === 'development' && (
               <details style={styles.details}>
                 <summary>Error Details</summary>
                 <pre style={styles.pre}>{this.state.errorInfo?.toString()}</pre>
               </details>
            )}
            <div style={styles.buttonGroup}>
              <button 
                onClick={() => window.location.reload()} 
                style={styles.primaryButton}
              >
                Reload Page
              </button>
              <button 
                onClick={() => window.location.href = '/'} 
                style={styles.secondaryButton}
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  card: {
    backgroundColor: 'white',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center'
  },
  header: {
    color: '#ef4444',
    marginTop: '0',
    marginBottom: '1rem',
    fontSize: '1.5rem',
    fontWeight: '600'
  },
  text: {
    color: '#475569',
    marginBottom: '1.5rem',
    lineHeight: '1.5'
  },
  details: {
    textAlign: 'left',
    marginTop: '1rem',
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: '#fee2e2',
    borderRadius: '6px',
    color: '#991b1b',
    fontSize: '0.875rem'
  },
  pre: {
    whiteSpace: 'pre-wrap',
    marginTop: '0.5rem',
    fontFamily: 'monospace'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    color: '#475569',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  }
};

export default ErrorBoundary;
