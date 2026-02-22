import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Turno, TipoTurno } from '@/types/oficio';
import { TIPO_TURNO_CONFIG } from '@/types/oficio';

interface CalendarioTurnosProps {
  turnos: Turno[];
  onTurnoClick?: (turno: Turno) => void;
  onTurnoDrop?: (turnoId: string, newFechaInicio: string) => void;
}

export default function CalendarioTurnos({ turnos, onTurnoClick, onTurnoDrop }: CalendarioTurnosProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1));
  const [selectedTurno, setSelectedTurno] = useState<string | null>(null);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentDate]);

  const getTurnosForDay = (day: number) => {
    const fecha = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return turnos.filter(t => fecha >= t.fechaInicio && fecha <= t.fechaFin);
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="bg-theme-card rounded-xl border border-theme overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-theme">
        <h3 className="text-lg font-semibold text-theme-primary">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-theme">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-theme-muted">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {daysInMonth.map((day, index) => {
          const dayTurnos = day ? getTurnosForDay(day) : [];
          const isToday = day === new Date().getDate() && 
            currentDate.getMonth() === new Date().getMonth() && 
            currentDate.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={index}
              className={`
                min-h-[100px] p-1 border-b border-r border-theme
                ${!day ? 'bg-theme-secondary/5' : 'hover:bg-theme-tertiary/50'}
              `}
            >
              {day && (
                <>
                  <div className={`
                    text-sm mb-1 p-1 rounded-full w-7 h-7 flex items-center justify-center
                    ${isToday ? 'bg-accent text-white' : 'text-theme-secondary'}
                  `}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayTurnos.map(turno => {
                      const config = TIPO_TURNO_CONFIG[turno.tipo];
                      return (
                        <motion.button
                          key={turno.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onTurnoClick?.(turno)}
                          className={`
                            w-full text-left text-xs p-1.5 rounded-lg truncate
                            ${config.bgColor} ${config.color} border border-theme
                            ${selectedTurno === turno.id ? 'ring-2 ring-accent' : ''}
                            hover:opacity-80 transition-opacity
                          `}
                        >
                          <span className="font-medium">{turno.abogadoNombre.split(' ')[0]}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-theme">
        <div className="flex flex-wrap gap-3">
          {(Object.keys(TIPO_TURNO_CONFIG) as TipoTurno[]).map(tipo => {
            const config = TIPO_TURNO_CONFIG[tipo];
            return (
              <div key={tipo} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${config.bgColor} border ${config.color.replace('text-', 'border-')}`} />
                <span className="text-xs text-theme-muted">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
