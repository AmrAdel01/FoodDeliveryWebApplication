import { Component } from 'react';

// Catches render-time errors so a single broken component shows a message
// instead of a blank white screen.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Render error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="page section">
          <div className="container empty-state">
            <h2>Something went wrong</h2>
            <p>The page hit an unexpected error. Please try again.</p>
            <button className="button primary" onClick={this.handleReload}>Back to home</button>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}
