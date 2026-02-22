// Loading Overlay Component
// Full screen loading overlay

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({ 
  isLoading, 
  message = 'Cargando...',
  fullScreen = false 
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        flex flex-col items-center justify-center gap-4
        ${fullScreen 
          ? 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50' 
          : 'absolute inset-0 bg-theme-card/80 backdrop-blur-sm rounded-xl'
        }
      `}
    >
      <Loader2 className="w-8 h-8 text-accent animate-spin" />
      {message && (
        <p className="text-theme-secondary text-sm">{message}</p>
      )}
    </motion.div>
  );

  return fullScreen ? (
    <>{content}</>
  ) : (
    <div className="absolute inset-0">{content}</div>
  );
}

// Loading Button Component
import type { LucideIcon } from 'lucide-react';

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: LucideIcon;
}

export function LoadingButton({ 
  isLoading, 
  children, 
  className = '',
  disabled = false,
  icon: Icon 
}: LoadingButtonProps) {
  return (
    <button
      className={className}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Cargando...
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {children}
        </>
      )}
    </button>
  );
}

// Loading Spinner
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ size = 'md' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`${sizes[size]} text-accent animate-spin`} />
  );
}

export default LoadingOverlay;
