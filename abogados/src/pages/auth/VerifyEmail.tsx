import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, CheckCircle, AlertCircle, ArrowRight, Loader2,
  Mail
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggleSimple } from '@/components/ThemeToggle';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const { verifyEmail } = useAuth();

  useEffect(() => {
    if (token) {
      verifyEmailToken();
    } else {
      setStatus('error');
      setError('Token de verificación no válido o faltante');
    }
  }, [token]);

  const verifyEmailToken = async () => {
    try {
      await verifyEmail(token!);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Error al verificar el email');
    }
  };

  return (
    <div className="min-h-screen bg-theme-primary flex">
      {/* Left Side - Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-theme-primary" />
        <div className="absolute inset-0 bg-[linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-theme-primary">DERECHO<span className="text-amber-500">.ERP</span></span>
          </Link>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-theme-primary leading-tight">
              Verificación de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                correo electrónico
              </span>
            </h2>
            <p className="text-theme-secondary text-lg max-w-md">
              Confirma tu dirección de correo para acceder a todas las funcionalidades del sistema.
            </p>
          </div>

          <div className="text-sm text-theme-tertiary">
            © 2026 Derecho ERP. Todos los derechos reservados.
          </div>
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto relative">
        <div className="absolute top-6 right-6">
          <ThemeToggleSimple />
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-theme-primary">DERECHO<span className="text-amber-500">.ERP</span></span>
          </div>

          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Loader2 className="w-16 h-16 text-amber-500 mx-auto mb-6 animate-spin" />
              <h2 className="text-2xl font-bold text-theme-primary mb-2">Verificando email...</h2>
              <p className="text-theme-secondary">Por favor espera mientras verificamos tu correo electrónico.</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-500 mb-4">¡Email verificado!</h2>
              <p className="text-theme-secondary mb-6">
                Tu correo electrónico ha sido verificado exitosamente. Ya puedes acceder a todas las funcionalidades del sistema.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                Ir al login
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-red-500 mb-4">Error de verificación</h2>
              <p className="text-theme-secondary mb-6">{error}</p>
              <p className="text-theme-secondary mb-6">
                El enlace puede haber expirado o ser inválido. Solicita un nuevo email de verificación.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all"
                >
                  Ir al login
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          )}

          {!token && status !== 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-theme-secondary border border-theme rounded-xl text-center"
            >
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-12 h-12 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-theme-primary mb-4">Verificación de email</h2>
              <p className="text-theme-secondary mb-6">
                Revisa tu bandeja de entrada. Te hemos enviado un email con un enlace para verificar tu cuenta.
              </p>
              <p className="text-theme-tertiary text-sm">
                Si no encuentras el email, revisa tu carpeta de spam o solicita un nuevo enlace desde tu perfil.
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium"
                >
                  <ArrowRight className="w-4 h-4" />
                  Ir al login
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
