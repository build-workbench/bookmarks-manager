import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-lg font-medium text-slate-200 mb-2">页面加载失败</h2>
          <p className="text-sm text-slate-400 mb-4 max-w-md">
            {this.state.error?.message || '发生了未知错误'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Wrapper for lazy-loaded components with error boundary
 */
export function LazyErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-lg font-medium text-slate-200 mb-2">组件加载失败</h2>
          <p className="text-sm text-slate-400 mb-4">
            请检查网络连接后刷新页面重试
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            刷新页面
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
