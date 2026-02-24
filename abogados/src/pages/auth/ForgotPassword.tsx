import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, Mail, ArrowLeft, CheckCircle, ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggleSimple } from '@/components/ThemeToggle';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el email de recuperación');
    } finally {
      setIsLoading(false);
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
              Recupera el acceso a tu{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                cuenta
              </span>
            </h2>
            <p className="text-theme-secondary text-lg max-w-md">
              Te enviaremos un enlace para restablecer tu contraseña de forma segura.
            </p>
          </div>

          <div className="text-sm text-theme-tertiary">
            © 2026 Derecho ERP. Todos los derechos reservados.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
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

          <div className="text-center">
            <h1 className="text-3xl font-bold text-theme-primary mb-2">Recuperar contraseña</h1>
            <p className="text-theme-secondary">
              ¿Recordaste tu contraseña?{' '}
              <Link to="/login" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
                Iniciar sesión
              </Link>
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center"
            >
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-emerald-500 mb-2">Email enviado</h3>
              <p className="text-theme-secondary mb-4">
                Si existe una cuenta con el email proporcionado, recibirás instrucciones para restablecer tu contraseña.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@despacho.com"
                    className="w-full pl-12 pr-4 py-4 bg-theme-secondary border border-theme rounded-xl text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Enviar instrucciones
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              <div className="text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-theme-tertiary hover:text-theme-secondary transition-colors text-sm">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
