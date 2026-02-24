import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, Mail, Lock, Eye, EyeOff, ArrowRight, 
  Github, Twitter, User, Building2, Phone,
  ArrowLeft, CheckCircle, ChevronRight, ChevronLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    firmName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptNewsletter: false,
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (currentStep: number): boolean => {
    setError('');
    
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError('Por favor completa todos los campos obligatorios');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.firmName) {
        setError('Por favor ingresa el nombre del despacho');
        return false;
      }
    } else if (currentStep === 3) {
      if (formData.password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return false;
      }
      if (!formData.acceptTerms) {
        setError('Debes aceptar los términos de servicio');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateStep(3)) return;
    
    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        nombre: formData.firstName,
        apellido1: formData.lastName,
        rol: 'abogado',
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
    }
  };
  
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const steps = [
    { number: 1, label: 'Datos personales' },
    { number: 2, label: 'Tu despacho' },
    { number: 3, label: 'Seguridad' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Side - Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-slate-950" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Scale className="w-7 h-7 text-slate-950" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">DERECHO<span className="text-amber-500">.ERP</span></span>
          </Link>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-500 font-medium">Prueba gratis 14 días</span>
            </div>
            
            <h2 className="text-4xl font-bold text-white leading-tight">
              Únete a los{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                despachos modernos
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-md">
              Empieza a gestionar tu bufete de forma eficiente. Sin tarjeta de crédito, sin compromiso.
            </p>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 mt-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-3">
                  {['👨‍💼', '👩‍⚖️', '👨‍💻', '👩‍💼'].map((emoji, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-lg">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-400">
                  <span className="text-white font-semibold">500+</span> despachos ya registrados
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-500 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-slate-400">4.9/5 en Trustpilot</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-500">
            © 2026 Derecho ERP. Todos los derechos reservados.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-slate-950" />
            </div>
            <span className="font-bold text-xl text-white">DERECHO<span className="text-amber-500">.ERP</span></span>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Crear cuenta</h1>
            <p className="text-slate-400">¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
                Iniciar sesión
              </Link>
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, i) => (
              <div key={s.number} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  step >= s.number 
                    ? 'bg-amber-500 text-slate-950' 
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}>
                  {step > s.number ? <CheckCircle className="w-5 h-5" /> : s.number}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 transition-colors ${
                    step > s.number ? 'bg-amber-500' : 'bg-slate-800'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Social Sign Up */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: GoogleIcon, label: 'Google' },
              { icon: Github, label: 'GitHub' },
              { icon: Twitter, label: 'Twitter' },
            ].map((provider) => (
              <motion.button
                key={provider.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:border-amber-500/30 hover:text-white transition-colors"
              >
                <provider.icon className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">{provider.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-950 text-slate-500">O regístrate con email</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
            >
              <p className="text-red-400 text-sm text-center">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Nombre</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => updateField('firstName', e.target.value)}
                          placeholder="Juan"
                          className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Apellidos</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => updateField('lastName', e.target.value)}
                          placeholder="García"
                          className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Correo electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="juan@despacho.com"
                        className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="+34 612 345 678"
                        className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del despacho</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={formData.firmName}
                        onChange={(e) => updateField('firmName', e.target.value)}
                        placeholder="García & Asociados"
                        className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-medium text-slate-300">¿Cuál es tu especialidad principal?</p>
                    {['Derecho Civil', 'Derecho Penal', 'Derecho Laboral', 'Derecho Mercantil', 'Derecho Administrativo'].map((spec) => (
                      <label key={spec} className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="specialty" className="w-4 h-4 text-amber-500 border-slate-700 bg-slate-900 focus:ring-amber-500" />
                        <span className="text-sm text-slate-400">{spec}</span>
                      </label>
                    ))}
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-medium text-slate-300">Tamaño del equipo</p>
                    <div className="grid grid-cols-3 gap-3">
                      {['Solo yo', '2-5', '6-10', '11-20', '21-50', '50+'].map((size) => (
                        <label key={size} className="flex items-center justify-center px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer hover:border-amber-500/30 transition-colors has-[:checked]:border-amber-500 has-[:checked]:bg-amber-500/10">
                          <input type="radio" name="teamSize" className="sr-only" />
                          <span className="text-sm text-slate-400">{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full pl-12 pr-12 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${
                          formData.password.length >= i * 2 ? 'bg-emerald-500' : 'bg-slate-800'
                        }`} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Confirmar contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                        placeholder="Repite tu contraseña"
                        className="w-full pl-12 pr-12 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) => updateField('acceptTerms', e.target.checked)}
                        className="w-4 h-4 mt-1 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                        required
                      />
                      <span className="text-sm text-slate-400">
                        Acepto los <Link to="/terms" className="text-amber-500 hover:text-amber-400">Términos de Servicio</Link> y la <Link to="/privacy" className="text-amber-500 hover:text-amber-400">Política de Privacidad</Link>
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.acceptNewsletter}
                        onChange={(e) => updateField('acceptNewsletter', e.target.checked)}
                        className="w-4 h-4 mt-1 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-sm text-slate-400">
                        Quiero recibir consejos de productividad y novedades del sector
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              {step > 1 && (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-4 bg-slate-900 border border-slate-800 text-white font-semibold rounded-xl hover:border-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Anterior
                </motion.button>
              )}
              
              {step < 3 ? (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                >
                  Siguiente
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={isLoading || !formData.acceptTerms}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Crear cuenta gratis
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </form>

          {/* Back to home */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
