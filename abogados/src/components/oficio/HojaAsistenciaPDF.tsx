import { FileDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ActuacionOficio, Turno, AbogadoOficio } from '@/types/oficio';
import { TIPO_ACTUACION_LABELS, TIPO_TURNO_CONFIG } from '@/types/oficio';

interface HojaAsistenciaPDFProps {
  actuacion: ActuacionOficio;
  turno: Turno | undefined;
  abogado: AbogadoOficio | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export default function HojaAsistenciaPDF({
  actuacion,
  turno,
  abogado,
  isOpen,
  onClose,
}: HojaAsistenciaPDFProps) {
  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('hoja-asistencia-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Hoja de Asistencia - Turno de Oficio</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.4;
            color: #000;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .header h1 {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .header p {
            font-size: 11pt;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 12pt;
            font-weight: bold;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          .field {
            display: flex;
            margin-bottom: 8px;
          }
          .field-label {
            font-weight: bold;
            width: 180px;
            flex-shrink: 0;
          }
          .field-value {
            flex: 1;
          }
          .footer {
            margin-top: 30px;
            border-top: 1px solid #000;
            padding-top: 15px;
            display: flex;
            justify-content: space-between;
          }
          .firma {
            text-align: center;
            width: 45%;
          }
          .firma-line {
            border-top: 1px solid #000;
            margin-top: 40px;
            padding-top: 5px;
            font-size: 10pt;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-theme-card rounded-xl border border-theme w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-theme flex items-center justify-between">
              <h2 className="text-lg font-semibold text-theme-primary">
                Hoja de Asistencia - Turno de Oficio
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div
                id="hoja-asistencia-content"
                className="bg-white text-gray-900 p-6 rounded-lg font-serif"
              >
                <div className="text-center border-b-2 border-gray-800 pb-4 mb-5">
                  <h1 className="text-xl font-bold mb-1">
                    HOJA DE ASISTENCIA - TURNO DE OFICIO
                  </h1>
                  <p className="text-sm">Ilustre Colegio de Abogados</p>
                </div>

                <div className="mb-5">
                  <h3 className="text-sm font-bold border-b border-gray-300 pb-1 mb-3">
                    DATOS DEL ABOGADO
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex">
                      <span className="font-bold w-36 flex-shrink-0">Nombre:</span>
                      <span>{abogado?.nombre || turno?.abogadoNombre || 'No disponible'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-bold w-36 flex-shrink-0">Nº Colegiado:</span>
                      <span>{abogado?.numeroColegiado || 'No disponible'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-bold w-36 flex-shrink-0">Turno:</span>
                      <span>
                        {turno ? TIPO_TURNO_CONFIG[turno.tipo]?.label : 'No disponible'} - {turno?.partidoJudicial || ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className="text-sm font-bold border-b border-gray-300 pb-1 mb-3">
                    DATOS DE LA ACTUACIÓN
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex">
                      <span className="font-bold w-36 flex-shrink-0">Tipo de Actuación:</span>
                      <span>{TIPO_ACTUACION_LABELS[actuacion.tipoActuacion]}</span>
                    </div>
                    <div className="flex">
                      <span className="font-bold w-36 flex-shrink-0">Fecha:</span>
                      <span>{formatFecha(actuacion.fecha)}</span>
                    </div>
                    <div className="flex">
                      <span className="font-bold w-36 flex-shrink-0">Hora de Inicio:</span>
                      <span>{actuacion.horaInicio}</span>
                    </div>
                    <div className="flex">
                      <span className="font-bold w-36 flex-shrink-0">Hora de Fin:</span>
                      <span>{actuacion.horaFin}</span>
                    </div>
                    <div className="flex col-span-2">
                      <span className="font-bold w-36 flex-shrink-0">Juzgado:</span>
                      <span>{actuacion.juzgado}</span>
                    </div>
                    <div className="flex col-span-2">
                      <span className="font-bold w-36 flex-shrink-0">Nº Procedimiento:</span>
                      <span>{actuacion.numeroProcedimiento}</span>
                    </div>
                    {actuacion.detenidoNombre && (
                      <div className="flex col-span-2">
                        <span className="font-bold w-36 flex-shrink-0">Detenido/Cliente:</span>
                        <span>{actuacion.detenidoNombre}</span>
                      </div>
                    )}
                    {actuacion.delito && (
                      <div className="flex col-span-2">
                        <span className="font-bold w-36 flex-shrink-0">Delito/Motivo:</span>
                        <span>{actuacion.delito}</span>
                      </div>
                    )}
                    <div className="flex col-span-2">
                      <span className="font-bold w-36 flex-shrink-0">Resultado:</span>
                      <span>{actuacion.resultado}</span>
                    </div>
                    {actuacion.observaciones && (
                      <div className="flex col-span-2 mt-2">
                        <span className="font-bold w-36 flex-shrink-0">Observaciones:</span>
                        <span>{actuacion.observaciones}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-800 flex justify-between">
                  <div className="text-center w-5/12">
                    <div className="border-t border-gray-800 mt-12 pt-2 text-sm">
                      Firma del Abogado
                    </div>
                  </div>
                  <div className="text-center w-5/12">
                    <div className="border-t border-gray-800 mt-12 pt-2 text-sm">
                      Firma y sello del Colegio
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-theme flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-theme-muted hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <FileDown className="w-4 h-4" />
                Descargar PDF
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
