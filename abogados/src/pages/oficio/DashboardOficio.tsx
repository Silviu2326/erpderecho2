import { motion } from 'framer-motion';
import { Gavel, Calendar, DollarSign, Clock, AlertTriangle, CheckCircle, FileText, Users, TrendingUp, Scale } from 'lucide-react';
import useTurnos from '@/hooks/useTurnos';
import { TIPO_TURNO_CONFIG, TIPO_ACTUACION_LABELS } from '@/types/oficio';
import type { TipoActuacion } from '@/types/oficio';

function SimpleBarChart({ data, maxValue, color = 'bg-blue-500' }: { data: { label: string; value: number }[]; maxValue: number; color?: string }) {
  return (
    <div className="flex items-end justify-between gap-1 h-32">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className={`w-full ${color} rounded-t transition-all duration-500`}
            style={{ height: `${Math.max((item.value / maxValue) * 100, 4)}%` }}
          />
          <span className="text-[10px] text-theme-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function ComparisonBarChart({ oficio, privado }: { oficio: number; privado: number }) {
  const max = Math.max(oficio, privado);
  const scale = max > 0 ? 100 / max : 1;
  
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-theme-primary">Turno de Oficio</span>
          <span className="text-emerald-400 font-medium">{oficio.toFixed(2)}€</span>
        </div>
        <div className="h-4 bg-theme-secondary/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${oficio * scale}%` }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-theme-primary">Cliente Privado</span>
          <span className="text-blue-400 font-medium">{privado.toFixed(2)}€</span>
        </div>
        <div className="h-4 bg-theme-secondary/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
            style={{ width: `${privado * scale}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function HorizontalBarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-theme-primary truncate">{item.label}</span>
            <span className="text-theme-muted">{item.value}</span>
          </div>
          <div className="h-2 bg-theme-secondary/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardOficio() {
  const { turnos, guardias, actuaciones, estadisticas, isLoading, getGuardiasPendientes, getActuacionesSinFacturar } = useTurnos();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  const guardiasPendientes = getGuardiasPendientes();
  const actuacionesSinFacturar = getActuacionesSinFacturar();
  const turnosActivos = turnos.filter(t => t.estado !== 'completado' && t.estado !== 'cancelado');

  const statsCards = [
    {
      title: 'Turnos Activos',
      value: turnosActivos.length,
      icon: Gavel,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
    },
    {
      title: 'Guardias Hoy',
      value: new Date().toISOString().split('T')[0],
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      subtitle: `${guardiasPendientes.length} pendientes`,
    },
    {
      title: 'Actuaciones Mes',
      value: estadisticas?.actuacionesEsteMes || 0,
      icon: FileText,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Ingresos Oficio',
      value: `${(estadisticas?.ingresosOficio || 0).toFixed(2)}€`,
      icon: DollarSign,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Turnos de Oficio</h1>
          <p className="text-theme-muted">Gestión de guardias y justicia gratuita</p>
        </div>
        <div className="flex gap-3">
          <span className="px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-sm font-medium">
            {turnosActivos.length} Turnos activos
          </span>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={item}
            className="bg-theme-card rounded-xl border border-theme p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-theme-muted text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-theme-primary mt-1">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-theme-muted mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-theme-card rounded-xl border border-theme"
        >
          <div className="p-4 border-b border-theme flex items-center justify-between">
            <h3 className="font-semibold text-theme-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Guardias Pendientes
            </h3>
            <span className="text-sm text-theme-muted">{guardiasPendientes.length} sin confirmar</span>
          </div>
          <div className="p-4 space-y-3">
            {guardiasPendientes.length === 0 ? (
              <p className="text-theme-muted text-sm text-center py-4">No hay guardias pendientes</p>
            ) : (
              guardiasPendientes.slice(0, 5).map(guardia => {
                const turno = turnos.find(t => t.id === guardia.turnoId);
                return (
                  <div key={guardia.id} className="flex items-center justify-between p-3 bg-theme-secondary/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-theme-primary">
                        {turno?.abogadoNombre || 'Abogado'}
                      </p>
                      <p className="text-xs text-theme-muted">
                        {guardia.fecha} · {guardia.horaInicio} - {guardia.horaFin}
                      </p>
                    </div>
                    <button className="px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-sm hover:bg-accent/20 transition-colors">
                      Confirmar
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-theme-card rounded-xl border border-theme"
        >
          <div className="p-4 border-b border-theme flex items-center justify-between">
            <h3 className="font-semibold text-theme-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Actuaciones sin Facturar
            </h3>
            <span className="text-sm text-theme-muted">{actuacionesSinFacturar.length} pendientes</span>
          </div>
          <div className="p-4 space-y-3">
            {actuacionesSinFacturar.length === 0 ? (
              <p className="text-theme-muted text-sm text-center py-4">No hay actuaciones pendientes</p>
            ) : (
              actuacionesSinFacturar.slice(0, 5).map(actuacion => (
                <div key={actuacion.id} className="flex items-center justify-between p-3 bg-theme-secondary/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-theme-primary">
                      {TIPO_ACTUACION_LABELS[actuacion.tipoActuacion]}
                    </p>
                    <p className="text-xs text-theme-muted">
                      {actuacion.fecha} · {actuacion.juzgado}
                    </p>
                  </div>
                  <button className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/20 transition-colors">
                    Facturar
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-theme-card rounded-xl border border-theme"
      >
        <div className="p-4 border-b border-theme">
          <h3 className="font-semibold text-theme-primary flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Turnos Próximos
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {turnosActivos.slice(0, 6).map(turno => {
              const config = TIPO_TURNO_CONFIG[turno.tipo];
              return (
                <div
                  key={turno.id}
                  className={`p-4 rounded-xl border ${config.bgColor} ${config.color} border-theme`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">{config.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      turno.estado === 'confirmado' ? 'bg-emerald-500/20 text-emerald-400' :
                      turno.estado === 'asignado' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {turno.estado}
                    </span>
                  </div>
                  <p className="font-medium text-theme-primary">{turno.abogadoNombre}</p>
                  <p className="text-xs text-theme-muted mt-1">
                    {turno.fechaInicio} - {turno.fechaFin}
                  </p>
                  <p className="text-xs text-theme-muted">{turno.partidoJudicial}</p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {estadisticas && Object.keys(estadisticas.actuacionesPorTipo).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-theme-card rounded-xl border border-theme"
        >
          <div className="p-4 border-b border-theme">
            <h3 className="font-semibold text-theme-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Actuaciones por Tipo
            </h3>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-3">
              {Object.entries(estadisticas.actuacionesPorTipo).map(([tipo, count]) => (
                <div
                  key={tipo}
                  className="flex items-center gap-2 px-3 py-2 bg-theme-secondary/30 rounded-lg"
                >
                  <span className="text-sm text-theme-primary">{TIPO_ACTUACION_LABELS[tipo as TipoActuacion]}</span>
                  <span className="text-sm font-bold text-accent">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {estadisticas && estadisticas.actuacionesPorMes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-theme-card rounded-xl border border-theme"
          >
            <div className="p-4 border-b border-theme">
              <h3 className="font-semibold text-theme-primary flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Actuaciones por Mes
              </h3>
            </div>
            <div className="p-4">
              <SimpleBarChart 
                data={estadisticas.actuacionesPorMes.map(m => ({ label: m.mes, value: m.cantidad }))}
                maxValue={Math.max(...estadisticas.actuacionesPorMes.map(m => m.cantidad), 1)}
                color="bg-emerald-500"
              />
            </div>
          </motion.div>
        )}

        {estadisticas && estadisticas.comparacionIngresos && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="bg-theme-card rounded-xl border border-theme"
          >
            <div className="p-4 border-b border-theme">
              <h3 className="font-semibold text-theme-primary flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-400" />
                Ingresos: Oficio vs Cliente Privado
              </h3>
            </div>
            <div className="p-4">
              <ComparisonBarChart 
                oficio={estadisticas.comparacionIngresos.oficio}
                privado={estadisticas.comparacionIngresos.privado}
              />
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {estadisticas && estadisticas.tiposDelitoMasFrecuentes && estadisticas.tiposDelitoMasFrecuentes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-theme-card rounded-xl border border-theme"
          >
            <div className="p-4 border-b border-theme">
              <h3 className="font-semibold text-theme-primary flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Delitos más Frecuentes
              </h3>
            </div>
            <div className="p-4">
              <HorizontalBarChart 
                data={estadisticas.tiposDelitoMasFrecuentes.map(d => ({ label: d.delito, value: d.cantidad }))}
              />
            </div>
          </motion.div>
        )}

        {estadisticas && estadisticas.juzgadosMasActivos && estadisticas.juzgadosMasActivos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="bg-theme-card rounded-xl border border-theme"
          >
            <div className="p-4 border-b border-theme">
              <h3 className="font-semibold text-theme-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Juzgados más Activos
              </h3>
            </div>
            <div className="p-4">
              <HorizontalBarChart 
                data={estadisticas.juzgadosMasActivos.map(j => ({ label: j.juzgado, value: j.cantidad }))}
              />
            </div>
          </motion.div>
        )}
      </div>

      {estadisticas && estadisticas.horasPorMes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-theme-card rounded-xl border border-theme"
        >
          <div className="p-4 border-b border-theme">
            <h3 className="font-semibold text-theme-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Horas Dedicadas por Mes
            </h3>
          </div>
          <div className="p-4">
            <SimpleBarChart 
              data={estadisticas.horasPorMes.map(m => ({ label: m.mes, value: m.horas }))}
              maxValue={Math.max(...estadisticas.horasPorMes.map(m => m.horas), 1)}
              color="bg-amber-500"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
