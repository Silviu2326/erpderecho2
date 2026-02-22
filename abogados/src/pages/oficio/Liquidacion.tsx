import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Calendar, DollarSign, FileText, Download, Printer, Filter } from 'lucide-react';
import useTurnos from '@/hooks/useTurnos';
import { TIPO_ACTUACION_LABELS, TIPO_TURNO_CONFIG } from '@/types/oficio';
import type { ActuacionOficio, TipoActuacion } from '@/types/oficio';
import { calcularImporte, getBaremoPorCCAA } from '@/data/baremos';

interface Trimestre {
  label: string;
  value: string;
  inicio: string;
  fin: string;
}

const TRIMESTRES: Trimestre[] = [
  { label: '1er Trimestre (Ene-Mar)', value: 'Q1', inicio: `${new Date().getFullYear()}-01-01`, fin: `${new Date().getFullYear()}-03-31` },
  { label: '2º Trimestre (Abr-Jun)', value: 'Q2', inicio: `${new Date().getFullYear()}-04-01`, fin: `${new Date().getFullYear()}-06-30` },
  { label: '3er Trimestre (Jul-Sep)', value: 'Q3', inicio: `${new Date().getFullYear()}-07-01`, fin: `${new Date().getFullYear()}-09-30` },
  { label: '4º Trimestre (Oct-Dic)', value: 'Q4', inicio: `${new Date().getFullYear()}-10-01`, fin: `${new Date().getFullYear()}-12-31` },
];

const COMUNIDADES = [
  'Comunidad de Madrid',
  'Andalucía',
  'Cataluña',
  'Comunidad Valenciana',
  'Galicia',
  'País Vasco',
  'Castilla y León',
];

export default function Liquidacion() {
  const { actuaciones, turnos, isLoading } = useTurnos();
  const [trimestre, setTrimestre] = useState<Trimestre>(TRIMESTRES[Math.floor((new Date().getMonth()) / 3)]);
  const [comunidad, setComunidad] = useState<string>('Comunidad de Madrid');
  const [tipoFilter, setTipoFilter] = useState<string>('');

  const actuacionesTrimestre = useMemo(() => {
    return actuaciones.filter(a => {
      const fecha = new Date(a.fecha);
      const inicio = new Date(trimestre.inicio);
      const fin = new Date(trimestre.fin);
      return fecha >= inicio && fecha <= fin;
    });
  }, [actuaciones, trimestre]);

  const filteredActuaciones = useMemo(() => {
    if (!tipoFilter) return actuacionesTrimestre;
    return actuacionesTrimestre.filter(a => a.tipoActuacion === tipoFilter);
  }, [actuacionesTrimestre, tipoFilter]);

  const totalesPorTipo = useMemo(() => {
    const totales: Record<string, { cantidad: number; importe: number }> = {};
    
    filteredActuaciones.forEach(actuacion => {
      const tipo = actuacion.tipoActuacion;
      if (!totales[tipo]) {
        totales[tipo] = { cantidad: 0, importe: 0 };
      }
      totales[tipo].cantidad += 1;
      const importeBaremo = calcularImporte(tipo, comunidad);
      totales[tipo].importe += importeBaremo || actuacion.importe || 0;
    });
    
    return totales;
  }, [filteredActuaciones, comunidad]);

  const importeTotal = useMemo(() => {
    return Object.values(totalesPorTipo).reduce((sum, t) => sum + t.importe, 0);
  }, [totalesPorTipo]);

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatFechaLarga = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTurnoForActuacion = (actuacion: ActuacionOficio) => {
    return turnos.find(t => t.id === actuacion.turnoId);
  };

  const handleExportPDF = () => {
    const content = document.getElementById('liquidacion-content');
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Liquidación Trimestral - Turno de Oficio</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; color: #000; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { font-size: 16pt; font-weight: bold; margin-bottom: 5px; }
          .header p { font-size: 10pt; }
          .info-box { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .info-label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 10pt; }
          th { background: #e0e0e0; font-weight: bold; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals-row { font-weight: bold; background: #f0f0f0; }
          .footer { margin-top: 30px; border-top: 1px solid #000; padding-top: 15px; display: flex; justify-content: space-between; }
          .firma { width: 45%; text-align: center; }
          .firma-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; font-size: 9pt; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Liquidación Trimestral</h1>
          <p className="text-theme-muted">Resumen de actuaciones para el Colegio de Abogados</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <FileDown className="w-4 h-4" />
          Exportar a PDF
        </button>
      </div>

      <div className="bg-theme-card rounded-xl border border-theme p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-theme-muted mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Trimestre
            </label>
            <select
              value={trimestre.value}
              onChange={(e) => setTrimestre(TRIMESTRES.find(t => t.value === e.target.value) || TRIMESTRES[0])}
              className="w-full px-4 py-2.5 bg-theme-secondary border border-theme rounded-lg text-theme-primary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {TRIMESTRES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-theme-muted mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Comunidad Autónoma
            </label>
            <select
              value={comunidad}
              onChange={(e) => setComunidad(e.target.value)}
              className="w-full px-4 py-2.5 bg-theme-secondary border border-theme rounded-lg text-theme-primary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {COMUNIDADES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-theme-muted mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Tipo de Actuación
            </label>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-theme-secondary border border-theme rounded-lg text-theme-primary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(TIPO_ACTUACION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-theme-card rounded-xl border border-theme p-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-theme-muted text-sm">Total Actuaciones</p>
              <p className="text-2xl font-bold text-theme-primary">{filteredActuaciones.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-theme-card rounded-xl border border-theme p-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-theme-muted text-sm">Período</p>
              <p className="text-lg font-bold text-theme-primary">{trimestre.label}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-theme-card rounded-xl border border-theme p-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-theme-muted text-sm">Importe Total</p>
              <p className="text-2xl font-bold text-emerald-400">{importeTotal.toFixed(2)} €</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-theme-card rounded-xl border border-theme">
        <div className="p-4 border-b border-theme">
          <h3 className="font-semibold text-theme-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            Resumen por Tipo de Actuación
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-theme-tertiary/30">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-theme-secondary">Tipo</th>
                <th className="text-center p-4 text-sm font-medium text-theme-secondary">Cantidad</th>
                <th className="text-right p-4 text-sm font-medium text-theme-secondary">Importe Unitario</th>
                <th className="text-right p-4 text-sm font-medium text-theme-secondary">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(totalesPorTipo).length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-theme-muted">
                    No hay actuaciones en el período seleccionado
                  </td>
                </tr>
              ) : (
                Object.entries(totalesPorTipo).map(([tipo, data]) => {
                  const importeUnitario = calcularImporte(tipo, comunidad) || 0;
                  return (
                    <motion.tr
                      key={tipo}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-theme hover:bg-theme-tertiary/30 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-medium text-theme-primary">
                          {TIPO_ACTUACION_LABELS[tipo as TipoActuacion]}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 bg-theme-tertiary rounded-full text-sm font-medium text-theme-primary">
                          {data.cantidad}
                        </span>
                      </td>
                      <td className="p-4 text-right text-theme-muted">
                        {importeUnitario.toFixed(2)} €
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-semibold text-emerald-400">
                          {data.importe.toFixed(2)} €
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
              {Object.keys(totalesPorTipo).length > 0 && (
                <tr className="border-t-2 border-theme bg-theme-tertiary/50">
                  <td className="p-4 font-bold text-theme-primary">TOTAL</td>
                  <td className="p-4 text-center font-bold text-theme-primary">{filteredActuaciones.length}</td>
                  <td className="p-4"></td>
                  <td className="p-4 text-right font-bold text-emerald-400 text-lg">
                    {importeTotal.toFixed(2)} €
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-theme-card rounded-xl border border-theme">
        <div className="p-4 border-b border-theme">
          <h3 className="font-semibold text-theme-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Detalle de Actuaciones
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-theme-tertiary/30">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-theme-secondary">Fecha</th>
                <th className="text-left p-4 text-sm font-medium text-theme-secondary">Tipo</th>
                <th className="text-left p-4 text-sm font-medium text-theme-secondary">Juzgado</th>
                <th className="text-left p-4 text-sm font-medium text-theme-secondary">Abogado</th>
                <th className="text-right p-4 text-sm font-medium text-theme-secondary">Importe</th>
              </tr>
            </thead>
            <tbody>
              {filteredActuaciones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-theme-muted">
                    No hay actuaciones en el período seleccionado
                  </td>
                </tr>
              ) : (
                filteredActuaciones.map((actuacion, index) => {
                  const turno = getTurnoForActuacion(actuacion);
                  const importe = calcularImporte(actuacion.tipoActuacion, comunidad) || actuacion.importe || 0;
                  return (
                    <motion.tr
                      key={actuacion.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-t border-theme hover:bg-theme-tertiary/30 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-theme-primary">{formatFecha(actuacion.fecha)}</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                          {TIPO_ACTUACION_LABELS[actuacion.tipoActuacion]}
                        </span>
                      </td>
                      <td className="p-4 text-theme-muted text-sm max-w-[200px] truncate">
                        {actuacion.juzgado}
                      </td>
                      <td className="p-4 text-theme-primary text-sm">
                        {turno?.abogadoNombre || 'No asignado'}
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-semibold text-theme-primary">{importe.toFixed(2)} €</span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hidden">
        <div id="liquidacion-content">
          <div className="header">
            <h1>LIQUIDACIÓN TRIMESTRAL - TURNO DE OFICIO</h1>
            <p>Ilustre Colegio de Abogados</p>
            <p>{comunidad}</p>
          </div>

          <div className="info-box">
            <div className="info-row">
              <span className="info-label">Trimestre:</span>
              <span>{trimestre.label}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Período:</span>
              <span>{formatFechaLarga(trimestre.inicio)} - {formatFechaLarga(trimestre.fin)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Comunidad Autónoma:</span>
              <span>{comunidad}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Actuaciones:</span>
              <span>{filteredActuaciones.length}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Tipo de Actuación</th>
                <th className="text-center">Cantidad</th>
                <th className="text-right">Importe Unitario</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(totalesPorTipo).map(([tipo, data]) => {
                const importeUnitario = calcularImporte(tipo, comunidad) || 0;
                return (
                  <tr key={tipo}>
                    <td>{TIPO_ACTUACION_LABELS[tipo as TipoActuacion]}</td>
                    <td className="text-center">{data.cantidad}</td>
                    <td className="text-right">{importeUnitario.toFixed(2)} €</td>
                    <td className="text-right">{data.importe.toFixed(2)} €</td>
                  </tr>
                );
              })}
              <tr className="totals-row">
                <td>TOTAL</td>
                <td className="text-center">{filteredActuaciones.length}</td>
                <td className="text-right"></td>
                <td className="text-right">{importeTotal.toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>

          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Juzgado</th>
                <th>Procedimiento</th>
                <th>Abogado</th>
                <th className="text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {filteredActuaciones.map(actuacion => {
                const turno = getTurnoForActuacion(actuacion);
                const importe = calcularImporte(actuacion.tipoActuacion, comunidad) || actuacion.importe || 0;
                return (
                  <tr key={actuacion.id}>
                    <td>{formatFecha(actuacion.fecha)}</td>
                    <td>{TIPO_ACTUACION_LABELS[actuacion.tipoActuacion]}</td>
                    <td>{actuacion.juzgado}</td>
                    <td>{actuacion.numeroProcedimiento}</td>
                    <td>{turno?.abogadoNombre || 'No asignado'}</td>
                    <td className="text-right">{importe.toFixed(2)} €</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="footer">
            <div className="firma">
              <div className="firma-line">Firma del Letrado</div>
            </div>
            <div className="firma">
              <div className="firma-line">VºBº del Colegio de Abogados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
