import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children

    // Pantalla de fallo pensada para la persona que usa la app: mensaje claro,
    // salida a mano y el stack solo si se despliega.
    return (
      <div style={{
        padding: 24,
        background: 'var(--color-fondo, #0f0f0f)',
        color: 'var(--color-text, #f3f4f6)',
        minHeight: '100dvh',
        fontFamily: "'Inter', system-ui, sans-serif"
      }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Algo se rompio</h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary, #9ca3af)', marginBottom: 16 }}>
          Tus datos siguen guardados en este dispositivo. Recarga la app para continuar.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--color-teal, #1D9E75)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Recargar
        </button>
        <details style={{ marginTop: 20 }}>
          <summary style={{ fontSize: 12, color: 'var(--color-muted, #6b7280)', cursor: 'pointer' }}>
            Detalles tecnicos
          </summary>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, lineHeight: 1.4, color: 'var(--color-muted, #6b7280)', marginTop: 8 }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        </details>
      </div>
    )
  }
}
