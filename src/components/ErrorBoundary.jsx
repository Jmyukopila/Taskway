import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null, info: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.setState({ info })
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, background: '#0f0f0f', color: '#f3f4f6', fontFamily: 'monospace', minHeight: '100dvh' }}>
          <h2 style={{ color: '#ef4444', marginBottom: 12, fontSize: 18 }}>Error:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.5, color: '#fca5a5' }}>
            {this.state.error.message}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, lineHeight: 1.4, color: '#9ca3af', marginTop: 12 }}>
            {this.state.error.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
