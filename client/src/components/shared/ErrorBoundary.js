import { Component } from "react";
import { Icon } from "@iconify/react";

// Catches render/runtime errors anywhere below it and shows a recoverable
// fallback instead of a blank white screen.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In a real deployment this would report to Sentry/LogRocket/etc.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("Moodwave crashed:", error, info);
    }
  }

  handleRetry = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="h-full w-full min-h-screen flex items-center justify-center bg-ink-950 p-6">
        <div className="max-w-md w-full text-center bg-ink-850 border border-ink-800 rounded-2xl p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/15 text-red-400 flex items-center justify-center mb-4">
            <Icon icon="mdi:alert-circle-outline" width={36} />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-ink-400 mb-6">
            An unexpected error interrupted Moodwave. You can try again, or head
            back home.
          </p>
          {process.env.NODE_ENV !== "production" && this.state.error && (
            <pre className="text-left text-xs text-red-300 bg-ink-900 border border-ink-800 rounded-lg p-3 mb-6 overflow-auto max-h-40">
              {String(this.state.error.message || this.state.error)}
            </pre>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={this.handleRetry}
              className="bg-brand hover:bg-brand-light text-black font-bold px-6 py-2.5 rounded-full transition"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.assign("/home")}
              className="text-ink-300 hover:text-white font-semibold px-4 py-2.5"
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
