import { createRoot } from 'react-dom/client'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { PWAProvider } from './contexts/PWAContext'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <ThemeProvider>
      <PWAProvider>
        <App />
      </PWAProvider>
    </ThemeProvider>
  </ErrorBoundary>,
)
