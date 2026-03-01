import { Component } from 'react';

/**
 * Catches React render errors so the app shows a message instead of a blank screen.
 * Errors are logged to console so they are visible even if console level is "Info".
 */
export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[LUFEL] Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ceramic-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Ceva nu a mers bine</h1>
            <p className="text-gray-600 mb-4">
              A apărut o eroare. Verifică consola din Developer Tools (F12) pentru detalii.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Încearcă din nou
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
