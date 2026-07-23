import { Component, type ErrorInfo, type ReactNode } from 'react'

interface SceneErrorBoundaryProps { children: ReactNode }
interface SceneErrorBoundaryState { hasError: boolean }

export class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  state: SceneErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // The control plane remains usable when an optional WebGL runtime fails.
  }

  render() {
    if (this.state.hasError) {
      return <div className="neural-scene scene-unavailable" role="status"><strong>NEURAL RUNTIME UNAVAILABLE</strong><span>3D visualization is unavailable. Agent controls remain operational.</span></div>
    }
    return this.props.children
  }
}
