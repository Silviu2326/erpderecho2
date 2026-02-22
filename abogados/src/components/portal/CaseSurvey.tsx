// Satisfaction Survey Component
// Post-case survey for clients

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Send, X, Check, ThumbsUp, ThumbsDown,
  MessageSquare, Clock, User, FileText
} from 'lucide-react';

interface CaseSurveyProps {
  isOpen: boolean;
  onClose: () => void;
  case: {
    id: string;
    title: string;
    lawyer: string;
  };
  onSubmit?: (responses: SurveyResponses) => void;
}

export interface SurveyResponses {
  caseId: string;
  overallRating: number; // 1-5
  lawyerRating: number; // 1-5
  wouldRecommend: boolean | null;
  responseTime: 'excellent' | 'good' | 'fair' | 'poor' | null;
  communication: 'excellent' | 'good' | 'fair' | 'poor' | null;
  comments: string;
  wouldHireAgain: boolean | null;
  submittedAt: Date;
}

type SurveyStep = 'rating' | 'details' | 'comments' | 'success';

export function CaseSurvey({ isOpen, onClose, case: caseInfo, onSubmit }: CaseSurveyProps) {
  const [step, setStep] = useState<SurveyStep>('rating');
  const [responses, setResponses] = useState<Partial<SurveyResponses>>({
    caseId: caseInfo.id,
    overallRating: 0,
    lawyerRating: 0,
    wouldRecommend: null,
    responseTime: null,
    communication: null,
    comments: '',
    wouldHireAgain: null
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleRating = (rating: number, field: 'overallRating' | 'lawyerRating') => {
    setResponses(prev => ({ ...prev, [field]: rating }));
  };

  const handleOption = (field: 'wouldRecommend' | 'wouldHireAgain', value: boolean) => {
    setResponses(prev => ({ ...prev, [field]: value }));
  };

  const handleSelect = (field: 'responseTime' | 'communication', value: 'excellent' | 'good' | 'fair' | 'poor') => {
    setResponses(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 'rating':
        return responses.overallRating && responses.overallRating > 0;
      case 'details':
        return responses.wouldRecommend !== null;
      case 'comments':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === 'rating') setStep('details');
    else if (step === 'details') setStep('comments');
    else if (step === 'comments') handleSubmit();
  };

  const handleSubmit = () => {
    const finalResponse: SurveyResponses = {
      caseId: caseInfo.id,
      overallRating: responses.overallRating || 0,
      lawyerRating: responses.lawyerRating || 0,
      wouldRecommend: responses.wouldRecommend,
      responseTime: responses.responseTime,
      communication: responses.communication,
      comments: responses.comments || '',
      wouldHireAgain: responses.wouldHireAgain,
      submittedAt: new Date()
    };

    // Log to console (in production, send to backend)
    console.log('📋 Survey Submitted:', finalResponse);
    
    // Save to localStorage (demo)
    const surveys = JSON.parse(localStorage.getItem('case_surveys') || '[]');
    surveys.push(finalResponse);
    localStorage.setItem('case_surveys', JSON.stringify(surveys));

    onSubmit?.(finalResponse);
    setStep('success');
  };

  const handleClose = () => {
    setStep('rating');
    setResponses({
      caseId: caseInfo.id,
      overallRating: 0,
      lawyerRating: 0,
      wouldRecommend: null,
      responseTime: null,
      communication: null,
      comments: '',
      wouldHireAgain: null
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-lg bg-theme-secondary border border-theme rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-amber-500/20 to-amber-600/5 p-6 pb-4">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {step === 'success' ? (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-theme-primary">¡Gracias!</h2>
                <p className="text-theme-secondary mt-1">Tu opinión nos ayuda a mejorar</p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-theme-primary">Encuesta de Satisfacción</h2>
                <p className="text-theme-secondary mt-1">Cuéntanos tu experiencia con tu caso</p>
                
                {/* Case Info */}
                <div className="flex items-center gap-3 mt-4 p-3 bg-theme-tertiary/50 rounded-xl">
                  <FileText className="w-5 h-5 text-theme-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-theme-primary truncate">{caseInfo.title}</p>
                    <p className="text-xs text-theme-muted">{caseInfo.id}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'success' ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-emerald-400 font-medium">¡Opinión recibida!</p>
                  <p className="text-sm text-theme-secondary mt-1">
                    Tu feedback es muy valioso para nosotros
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-400 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                {/* Step 1: Overall Rating */}
                {step === 'rating' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-3">
                        ¿Cómo valoras tu experiencia general?
                      </label>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(star, 'overallRating')}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-10 h-10 ${
                                star <= (hoveredRating || responses.overallRating || 0)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-theme-muted'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <p className="text-center text-sm text-theme-muted mt-2">
                        {responses.overallRating === 1 && 'Muy insatisfacho'}
                        {responses.overallRating === 2 && 'Insatisfecho'}
                        {responses.overallRating === 3 && 'Neutral'}
                        {responses.overallRating === 4 && 'Satisfecho'}
                        {responses.overallRating === 5 && 'Muy satisfecho'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-3">
                        ¿Cómo valoras a tu abogado?
                      </label>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(star, 'lawyerRating')}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= (responses.lawyerRating || 0)
                                  ? 'text-blue-400 fill-blue-400'
                                  : 'text-theme-muted'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <p className="text-center text-sm text-theme-muted mt-2">
                        {caseInfo.lawyer}
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2: Details */}
                {step === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-3">
                        ¿Recomendarías nuestro bufete?
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleOption('wouldRecommend', true)}
                          className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-colors ${
                            responses.wouldRecommend === true
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                              : 'border-theme text-theme-secondary hover:border-theme-hover'
                          }`}
                        >
                          <ThumbsUp className="w-5 h-5" />
                          Sí, sin duda
                        </button>
                        <button
                          onClick={() => handleOption('wouldRecommend', false)}
                          className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-colors ${
                            responses.wouldRecommend === false
                              ? 'bg-red-500/20 border-red-500 text-red-400'
                              : 'border-theme text-theme-secondary hover:border-theme-hover'
                          }`}
                        >
                          <ThumbsDown className="w-5 h-5" />
                          No
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-3">
                        Tiempo de respuesta
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['excellent', 'good', 'fair', 'poor'] as const).map((option) => (
                          <button
                            key={option}
                            onClick={() => handleSelect('responseTime', option)}
                            className={`py-2 px-3 rounded-lg border text-sm capitalize transition-colors ${
                              responses.responseTime === option
                                ? 'bg-accent/20 border-accent text-accent'
                                : 'border-theme text-theme-secondary hover:border-theme-hover'
                            }`}
                          >
                            {option === 'excellent' && 'Excelente'}
                            {option === 'good' && 'Bueno'}
                            {option === 'fair' && 'Regular'}
                            {option === 'poor' && 'Deficiente'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-3">
                        Comunicación
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['excellent', 'good', 'fair', 'poor'] as const).map((option) => (
                          <button
                            key={option}
                            onClick={() => handleSelect('communication', option)}
                            className={`py-2 px-3 rounded-lg border text-sm capitalize transition-colors ${
                              responses.communication === option
                                ? 'bg-accent/20 border-accent text-accent'
                                : 'border-theme text-theme-secondary hover:border-theme-hover'
                            }`}
                          >
                            {option === 'excellent' && 'Excelente'}
                            {option === 'good' && 'Bueno'}
                            {option === 'fair' && 'Regular'}
                            {option === 'poor' && 'Deficiente'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Comments */}
                {step === 'comments' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-3">
                        ¿Volverías a confiar en nosotros?
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleOption('wouldHireAgain', true)}
                          className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-colors ${
                            responses.wouldHireAgain === true
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                              : 'border-theme text-theme-secondary hover:border-theme-hover'
                          }`}
                        >
                          <Check className="w-5 h-5" />
                          Sí
                        </button>
                        <button
                          onClick={() => handleOption('wouldHireAgain', false)}
                          className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-colors ${
                            responses.wouldHireAgain === false
                              ? 'bg-red-500/20 border-red-500 text-red-400'
                              : 'border-theme text-theme-secondary hover:border-theme-hover'
                          }`}
                        >
                          <X className="w-5 h-5" />
                          No
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-3">
                        ¿Comentarios adicionales? (opcional)
                      </label>
                      <textarea
                        value={responses.comments}
                        onChange={(e) => setResponses(prev => ({ ...prev, comments: e.target.value }))}
                        placeholder="Cuéntanos más sobre tu experiencia..."
                        className="w-full h-32 p-3 bg-theme-tertiary/50 border border-theme rounded-xl text-theme-primary placeholder-theme-muted resize-none focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3 mt-6">
                  {step !== 'rating' && (
                    <button
                      onClick={() => setStep(step === 'details' ? 'rating' : 'details')}
                      className="px-4 py-3 text-theme-secondary hover:text-theme-primary transition-colors"
                    >
                      Atrás
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {step === 'comments' ? (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar
                      </>
                    ) : (
                      'Continuar'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CaseSurvey;
