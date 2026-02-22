import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calculator, Euro } from 'lucide-react';
import {
  BAREMOS_CCAA,
  BaremoItem,
  calcularImporte
} from '../data/baremos';

interface BaremoTableProps {
  onSelectItem?: (item: BaremoItem, comunidad: string) => void;
  selectedComunidad?: string;
  selectedTipoActuacion?: string;
}

const TIPO_ACTUACION_OPTIONS = [
  { value: 'detenido', label: 'Detención' },
  { value: 'declaracion', label: 'Declaración' },
  { value: 'juicio_rapido', label: 'Juicio Rápido' },
  { value: 'orden_proteccion', label: 'Orden de Protección' },
  { value: 'reconocimiento', label: 'Reconocimiento' },
  { value: 'recursos', label: 'Recursos' },
  { value: 'guardia', label: 'Guardia' },
  { value: 'asistencia_civil', label: 'Asistencia Civil' },
  { value: 'juicio_civil', label: 'Juicio Civil' },
  { value: 'extranjeria', label: 'Extranjería' },
  { value: 'violencia_genero', label: 'Violencia de Género' },
  { value: 'menores', label: 'Menores' },
];

const UNIDAD_LABELS: Record<string, string> = {
  actuacion: 'Por actuación',
  hora: 'Por hora',
  dia: 'Por día',
};

export function BaremoTable({
  onSelectItem,
  selectedComunidad,
  selectedTipoActuacion,
}: BaremoTableProps) {
  const [comunidadFilter, setComunidadFilter] = useState<string>(
    selectedComunidad || ''
  );
  const [tipoFilter, setTipoFilter] = useState<string>(
    selectedTipoActuacion || ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBaremos = useMemo(() => {
    return BAREMOS_CCAA.filter((baremo) => {
      if (comunidadFilter && baremo.comunidad !== comunidadFilter) {
        return false;
      }
      return true;
    }).map((baremo) => ({
      ...baremo,
      items: baremo.items.filter((item) => {
        if (tipoFilter && item.tipoActuacion !== tipoFilter) {
          return false;
        }
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            item.descripcion.toLowerCase().includes(query) ||
            item.codigo.toLowerCase().includes(query)
          );
        }
        return true;
      }),
    }));
  }, [comunidadFilter, tipoFilter, searchQuery]);

  const comunidades = BAREMOS_CCAA.map((b) => b.comunidad);

  const calculateTotal = (items: BaremoItem[]) => {
    return items.reduce((sum, item) => sum + item.importe, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
          <input
            type="text"
            placeholder="Buscar por código o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-theme-card border border-theme rounded-xl text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <select
              value={comunidadFilter}
              onChange={(e) => setComunidadFilter(e.target.value)}
              className="pl-9 pr-8 py-3 bg-theme-card border border-theme rounded-xl text-theme-primary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 min-w-[200px]"
            >
              <option value="">Todas las CCAA</option>
              {comunidades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="px-4 py-3 bg-theme-card border border-theme rounded-xl text-theme-primary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 min-w-[180px]"
            >
              <option value="">Todos los tipos</option>
              {TIPO_ACTUACION_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {comunidadFilter && tipoFilter && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/10 border border-accent/30 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-accent" />
            <span className="text-theme-primary">
              Importe calculado para{' '}
              <strong>
                {TIPO_ACTUACION_OPTIONS.find((t) => t.value === tipoFilter)
                  ?.label}{' '}
                en {comunidadFilter}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Euro className="w-5 h-5 text-accent" />
            <span className="text-2xl font-bold text-accent">
              {calcularImporte(tipoFilter, comunidadFilter).toFixed(2)} €
            </span>
          </div>
        </motion.div>
      )}

      <div className="space-y-6">
        {filteredBaremos.map((baremo) => (
          <motion.div
            key={baremo.comunidad}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-theme-card border border-theme rounded-xl overflow-hidden"
          >
            <div className="bg-theme-tertiary/50 px-6 py-4 border-b border-theme flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-theme-primary">
                  {baremo.comunidad}
                </h3>
                <p className="text-sm text-theme-muted">
                  Año {baremo.ano} · {baremo.items.length} actuaciones
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-theme-muted">Total baremo</p>
                <p className="text-xl font-bold text-accent">
                  {calculateTotal(baremo.items).toFixed(2)} €
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-theme-tertiary/30">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-theme-secondary">
                      Código
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-theme-secondary">
                      Descripción
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-theme-secondary">
                      Tipo
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-theme-secondary">
                      Importe
                    </th>
                    <th className="text-center p-4 text-sm font-medium text-theme-secondary">
                      Unidad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {baremo.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-theme-muted"
                      >
                        No hay actuaciones que coincidan con los filtros
                      </td>
                    </tr>
                  ) : (
                    baremo.items.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-t border-theme hover:bg-theme-tertiary/30 cursor-pointer transition-colors"
                        onClick={() => onSelectItem?.(item, baremo.comunidad)}
                      >
                        <td className="p-4">
                          <span className="font-mono text-sm text-accent">
                            {item.codigo}
                          </span>
                        </td>
                        <td className="p-4 text-theme-primary">
                          {item.descripcion}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-theme-tertiary text-theme-secondary">
                            {TIPO_ACTUACION_OPTIONS.find(
                              (t) => t.value === item.tipoActuacion
                            )?.label || item.tipoActuacion}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-semibold text-theme-primary">
                            {item.importe.toFixed(2)} €
                          </span>
                        </td>
                        <td className="p-4 text-center text-theme-muted text-sm">
                          {UNIDAD_LABELS[item.unidad]}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredBaremos.every((b) => b.items.length === 0) && (
        <div className="text-center py-12">
          <p className="text-theme-muted">
            No hay resultados que coincidan con los filtros seleccionados
          </p>
        </div>
      )}
    </div>
  );
}

export default BaremoTable;
