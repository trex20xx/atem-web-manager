import React from 'react';

// =========================================================================
// ATEM WEB MANAGER - ERROR BOUNDARY (v1.82)
// =========================================================================
// Traps runtime exceptions or socket failures to prevent blank white screens.

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ATEM Panel Error Caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="atem-bus-locked-container">
                    <div className="atem-bus-lock-badge">PANEL EXCEPTION TRAPPED</div>
                    <div className="atem-bus-lock-desc">
                        An error occurred while loading this panel component. Check your bridge daemon or console logs.
                    </div>
                    <button 
                        className="atem-trans-btn" 
                        style={{ marginTop: '12px' }} 
                        onClick={() => this.setState({ hasError: false })}
                    >
                        RELOAD PANEL
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;