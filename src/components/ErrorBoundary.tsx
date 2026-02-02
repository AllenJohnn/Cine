import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the 
 * component tree that crashed.
 * 
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error("Error Boundary caught an error:", error, errorInfo);
    
    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided by parent
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-2xl w-full space-y-6">
            <Alert variant="destructive" className="border-2">
              <AlertCircle className="h-6 w-6" />
              <AlertTitle className="text-xl font-bold">
                Oops! Something went wrong
              </AlertTitle>
              <AlertDescription className="mt-3 text-base">
                We're sorry, but something unexpected happened. This error has been
                logged and we'll look into it.
              </AlertDescription>
            </Alert>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-muted p-4 rounded-lg border">
                <h3 className="font-semibold mb-2 text-destructive">
                  Error Details (Development Only):
                </h3>
                <pre className="text-xs overflow-auto max-h-96 text-muted-foreground">
                  {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      {"\n\n"}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button type="button" onClick={this.handleReset} variant="default" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button type="button" onClick={this.handleGoHome} variant="outline" size="lg">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              If this problem persists, please contact support or try again later.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
