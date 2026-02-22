import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Brain, AlertCircle,
  Calendar, Target, BarChart3, ArrowUpRight
} from 'lucide-react';

interface Prediction {
  id: string;
  type: 'case_volume' | 'revenue' | 'deadline' | 'success_rate';
  label: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

const predictions: Prediction[] = [
  {
    id: '1',
    type: 'case_volume',
    label: 'Casos nuevos (próximo mes)',
    current: 24,
    predicted: 32,
    confidence: 87,
    trend: 'up',
    period: 'Próximos 30 días'
  },
  {
    id: '2',
    type: 'revenue',
    label: 'Ingresos proyectados',
    current: 145000,
    predicted: 168000,
    confidence: 82,
    trend: 'up',
    period: 'Próximo trimestre'
  },
  {
    id: '3',
    type: 'deadline',
    label: 'Vencimientos críticos',
    current: 5,
    predicted: 8,
    confidence: 75,
    trend: 'up',
    period: 'Próximas 2 semanas'
  },
  {
    id: '4',
    type: 'success_rate',
    label: 'Tasa de éxito procesal',
    current: 78,
    predicted: 82,
    confidence: 91,
    trend: 'up',
    period: 'Próximo trimestre'
  }
];

const riskAlerts = [
  { id: '1', title: 'Alta carga de trabajo', description: '3 abogados con >15 casos activos', severity: 'high' },
  { id: '2', title: 'Documentación pendiente', description: '12 casos sin expediente completo', severity: 'medium' },
  { id: '3', title: 'Fechas límite cercanas', description: '5 audiencias en los próximos 7 días', severity: 'medium' },
];

export function PredictiveAnalytics() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return null;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'case_volume': return <Target className="w-5 h-5 text-blue-500" />;
      case 'revenue': return <BarChart3 className="w-5 h-5 text-emerald-500" />;
      case 'deadline': return <Calendar className="w-5 h-5 text-amber-500" />;
      case 'success_rate': return <TrendingUp className="w-5 h-5 text-purple-500" />;
      default: return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-3">
            <Brain className="w-7 h-7 text-purple-500" />
            Análisis Predictivo
          </h2>
          <p className="text-theme-secondary">Insights y proyecciones basadas en datos históricos</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-full text-sm">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          IA Activa
        </div>
      </motion.div>

      {/* Prediction Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {predictions.map((prediction) => {
          const changePercent = prediction.predicted !== 0 
            ? Math.round(((prediction.predicted - prediction.current) / prediction.current) * 100)
            : 0;

          return (
            <motion.div
              key={prediction.id}
              whileHover={{ scale: 1.02 }}
              className="p-5 bg-theme-card border border-theme rounded-xl"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg bg-purple-500/10`}>
                  {getTypeIcon(prediction.type)}
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-theme-tertiary/50 rounded-full">
                  <span className="text-xs text-theme-tertiary">{prediction.confidence}%</span>
                </div>
              </div>
              
              <p className="text-theme-secondary text-sm mb-1">{prediction.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-theme-primary">
                  {prediction.type === 'revenue' ? `$${formatNumber(prediction.predicted)}` : prediction.predicted}
                </span>
                {prediction.type !== 'revenue' && (
                  <span className="text-theme-tertiary text-sm">/ {prediction.current}</span>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-theme">
                <div className="flex items-center gap-1.5">
                  {getTrendIcon(prediction.trend)}
                  <span className={`text-sm font-medium ${changePercent > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {changePercent > 0 ? '+' : ''}{changePercent}%
                  </span>
                </div>
                <span className="text-xs text-theme-tertiary">{prediction.period}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart Placeholder */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="p-5 bg-theme-card border border-theme rounded-xl">
            <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Proyección de Casos y Revenue
            </h3>
            
            {/* Simplified chart visualization */}
            <div className="relative h-64 bg-theme-tertiary/30 rounded-lg p-4">
              <div className="absolute inset-4 flex items-end gap-2">
                {[65, 78, 82, 71, 88, 92, 85, 95, 102, 98, 108, 115].map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${value}%` }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                    />
                    <span className="text-xs text-theme-tertiary">
                      {['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="absolute top-4 left-4 flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-purple-500 rounded" /> Histórico
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-purple-300/50 rounded" /> Proyectado
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="p-3 bg-theme-tertiary/30 rounded-lg text-center">
                <p className="text-theme-tertiary text-xs">Crecimiento esperado</p>
                <p className="text-lg font-bold text-emerald-400">+18.5%</p>
              </div>
              <div className="p-3 bg-theme-tertiary/30 rounded-lg text-center">
                <p className="text-theme-tertiary text-xs">Precisión del modelo</p>
                <p className="text-lg font-bold text-purple-400">84%</p>
              </div>
              <div className="p-3 bg-theme-tertiary/30 rounded-lg text-center">
                <p className="text-theme-tertiary text-xs">Datos analizados</p>
                <p className="text-lg font-bold text-blue-400">2,450</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Risk Alerts */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="p-5 bg-theme-card border border-theme rounded-xl">
            <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Alertas Predictivas
            </h3>
            <div className="space-y-3">
              {riskAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border ${
                    alert.severity === 'high' 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`w-4 h-4 mt-0.5 ${
                      alert.severity === 'high' ? 'text-red-400' : 'text-amber-400'
                    }`} />
                    <div>
                      <p className="text-theme-primary text-sm font-medium">{alert.title}</p>
                      <p className="text-theme-secondary text-xs mt-1">{alert.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Insights */}
          <div className="p-5 bg-theme-card border border-theme rounded-xl">
            <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-purple-500" />
              Insights Rápidos
            </h3>
            <div className="space-y-3">
              {[
                { text: 'Los casos de familia tienen 23% más duración promedio', icon: '📊' },
                { text: 'Martes y jueves son los días con más audiencias', icon: '📅' },
                { text: 'La satisfacción del cliente aumenta 15% con seguimiento semanal', icon: '💡' },
              ].map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-theme-tertiary/30 rounded-lg">
                  <span className="text-lg">{insight.icon}</span>
                  <p className="text-theme-secondary text-sm">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
