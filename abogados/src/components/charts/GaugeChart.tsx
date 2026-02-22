import { motion } from 'framer-motion';

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  thresholds?: {
    warning: number;
    danger: number;
  };
  showValue?: boolean;
  unit?: string;
}

const SIZE_CONFIG = {
  sm: { size: 100, strokeWidth: 8, fontSize: 'text-lg' },
  md: { size: 150, strokeWidth: 12, fontSize: 'text-2xl' },
  lg: { size: 200, strokeWidth: 16, fontSize: 'text-4xl' },
};

export default function GaugeChart({
  value,
  min = 0,
  max = 100,
  label,
  size = 'md',
  thresholds = { warning: 70, danger: 90 },
  showValue = true,
  unit = '%',
}: GaugeChartProps) {
  const config = SIZE_CONFIG[size];
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  
  const getColor = () => {
    if (percentage >= thresholds.danger) return '#ef4444';
    if (percentage >= thresholds.warning) return '#f59e0b';
    return '#22c55e';
  };

  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * (circumference * 0.75);

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative"
        style={{ width: config.size, height: config.size }}
      >
        <svg
          width={config.size}
          height={config.size}
          viewBox={`0 0 ${config.size} ${config.size}`}
          className="transform -rotate-[135deg]"
        >
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.75}
            className="text-slate-200"
          />
          <motion.circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 6px ${getColor()}40)`,
            }}
          />
        </svg>
        
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: 'rotate(135deg)' }}
        >
          {showValue && (
            <span 
              className={`font-bold ${config.fontSize}`}
              style={{ color: getColor() }}
            >
              {value}{unit}
            </span>
          )}
        </div>
      </div>
      
      {label && (
        <p className="mt-2 text-sm font-medium text-slate-600 text-center">
          {label}
        </p>
      )}
    </div>
  );
}
