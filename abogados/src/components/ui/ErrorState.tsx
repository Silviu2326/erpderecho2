// Error State Component
// Reusable error display with retry option

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home, X } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  onDismiss?: () => void;
}

export function ErrorState({
  title = 'Algo salió mal',
  message = 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.',
  onRetry,
  onGoHome,
  onDismiss
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-theme-primary mb-2">
        {title}
      </h3>
      
      <p className="text-theme-secondary text-center max-w-md mb-8">
        {message}
      </p>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        )}
        
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 px-4 py-2 border border-theme text-theme-secondary rounded-xl hover:bg-theme-tertiary transition-colors"
          >
            <Home className="w-4 h-4" />
            Volver al inicio
          </button>
        )}
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex items-center gap-2 px-4 py-2 text-theme-muted hover:text-theme-primary transition-colors"
          >
            <X className="w-4 h-4" />
            Cerrar
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Inline Error Message
interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-red-500/20 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

// Network Error (specific type)
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Error de conexión"
      message="No se ha podido conectar con el servidor. Comprueba tu conexión a internet e inténtalo de nuevo."
      onRetry={onRetry}
    />
  );
}

// Not Found Error
interface NotFoundErrorProps {
  title?: string;
  resource?: string;
  onGoBack?: () => void;
}

export function NotFoundError({ 
  title = 'No encontrado', 
  resource = 'El recurso solicitado',
  onGoBack 
}: NotFoundErrorProps) {
  return (
    <ErrorState
      title={title}
      message={`${resource} no se ha encontrado o ha sido eliminado.`}
      onGoHome={onGoBack}
    />
  );
}

export default ErrorState;
