import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Printer, Download, Send, Edit2, Trash2, 
  CheckCircle2, AlertCircle, Clock, Ban, FileText, 
  User, Building2, FolderOpen, Calendar, Euro, 
  Receipt, X, Loader2, Mail, ChevronRight
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { facturaService, type Factura, type LineaFactura, type EstadoFactura } from '@/services/facturaService';
import { useRole } from '@/hooks/useRole';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

type ModalType = 'delete' | 'email' | 'print' | null;

// Mapeo de estados a colores y texto
const estadoConfig: Record<EstadoFactura, { color: string; bgColor: string; icon: any; label: string }> = {
  PENDIENTE: { 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-500/20 border-amber-500/30',
    icon: Clock, 
    label: 'Pendiente' 
  },
  PAGADA: { 
    color: 'text-emerald-400', 
    bgColor: 'bg-emerald-500/20 border-emerald-500/30',
    icon: CheckCircle2, 
    label: 'Pagada' 
  },
  ANULADA: { 
    color: 'text-slate-400', 
    bgColor: 'bg-slate-500/20 border-slate-500/30',
    icon: Ban, 
    label: 'Anulada' 
  },
  VENCIDA: { 
    color: 'text-red-400', 
    bgColor: 'bg-red-500/20 border-red-500/30',
    icon: AlertCircle, 
    label: 'Vencida' 
  },
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'No especificada';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const formatDateShort = (dateString: string | null): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-ES');
};

export default function FacturaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useRole();
  
  // Estados
  const [factura, setFactura] = useState<Factura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [emailForm, setEmailForm] = useState({
    email: '',
    mensaje: ''
  });
  const [processing, setProcessing] = useState(false);

  // Cargar factura
  useEffect(() => {
    if (id) {
      cargarFactura();
    }
  }, [id]);

  const cargarFactura = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await facturaService.getFacturaById(id!);
      setFactura(response.data);
      
      // Pre-llenar el email si existe el cliente
      if (response.data.cliente?.email) {
        setEmailForm(prev => ({ ...prev, email: response.data.cliente!.email! }));
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar la factura');
      showToast('Error al cargar la factura', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toastId = Date.now();
    setToasts(prev => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 3000);
  };

  // Permisos según el rol
  const permissions = useMemo(() => {
    return {
      canEdit: role === 'super_admin' || role === 'socio' || role === 'administrador',
      canDelete: role === 'super_admin' || role === 'socio',
      canSendEmail: role === 'super_admin' || role === 'socio' || role === 'administrador',
      canPrint: true,
      canDownload: true,
    };
  }, [role]);

  // Handlers
  const handleGoBack = () => {
    navigate('/finanzas/facturacion');
  };

  const handleEdit = () => {
    if (factura) {
      navigate(`/finanzas/facturacion/editar/${factura.id}`);
    }
  };

  const handleDelete = async () => {
    if (!factura) return;
    
    setProcessing(true);
    try {
      await facturaService.anularFactura(factura.id);
      showToast('Factura anulada correctamente', 'success');
      setActiveModal(null);
      setTimeout(() => {
        navigate('/finanzas/facturacion');
      }, 1000);
    } catch (err: any) {
      showToast(err.message || 'Error al anular la factura', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendEmail = async () => {
    if (!factura) return;
    
    if (!emailForm.email) {
      showToast('Por favor ingrese un correo electrónico', 'error');
      return;
    }
    
    setProcessing(true);
    try {
      await facturaService.enviarFactura(factura.id, emailForm.email);
      showToast('Factura enviada correctamente', 'success');
      setActiveModal(null);
    } catch (err: any) {
      showToast(err.message || 'Error al enviar la factura', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!factura) return;
    
    try {
      const response = await facturaService.getFacturaPDF(factura.id);
      if (response.url) {
        window.open(response.url, '_blank');
      }
      showToast('Descargando PDF...', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error al descargar el PDF', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
    setActiveModal(null);
  };

  const handleRegisterPayment = async () => {
    if (!factura) return;
    
    try {
      await facturaService.pagarFactura(factura.id);
      showToast('Pago registrado correctamente', 'success');
      cargarFactura(); // Recargar para actualizar estado
    } catch (err: any) {
      showToast(err.message || 'Error al registrar el pago', 'error');
    }
  };

  // Loading state
  if (loading) {
    return (
      <AppLayout title="Detalle de Factura" subtitle="Cargando información...">
        <main className="flex-1 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
            <p className="text-theme-secondary">Cargando factura...</p>
          </motion.div>
        </main>
      </AppLayout>
    );
  }

  // Error state
  if (error || !factura) {
    return (
      <AppLayout title="Error" subtitle="No se pudo cargar la factura">
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-12"
          >
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a facturas
            </button>
            
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-500 mb-2">Error al cargar factura</h2>
              <p className="text-theme-secondary mb-6">{error || 'No se encontró la factura solicitada'}</p>
              <button
                onClick={cargarFactura}
                className="px-6 py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </motion.div>
        </main>
      </AppLayout>
    );
  }

  const estadoInfo = estadoConfig[factura.estado];
  const EstadoIcon = estadoInfo.icon;

  // Header actions
  const headerActions = (
    <div className="flex items-center gap-2">
      {permissions.canEdit && factura.estado !== 'ANULADA' && (
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 px-4 py-2 bg-theme-tertiary text-theme-primary rounded-xl hover:bg-theme-tertiary/80 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          <span className="hidden sm:inline">Editar</span>
        </button>
      )}
    </div>
  );

  return (
    <AppLayout 
      title={`Factura ${factura.numero}`}
      subtitle={factura.cliente?.nombre || 'Sin cliente'}
      headerActions={headerActions}
    >
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 print:p-0">
        {/* Botón volver - ocultar en impresión */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 print:hidden"
        >
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a facturas
          </button>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Header de Factura */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-theme-card to-theme-secondary/30 border border-theme rounded-2xl p-6 mb-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Izquierda: Info principal */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-500/20 rounded-xl">
                    <Receipt className="w-8 h-8 text-amber-500" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-theme-primary">{factura.numero}</h1>
                    <p className="text-theme-secondary">Factura de {formatDate(factura.createdAt)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${estadoInfo.bgColor}`}>
                    <EstadoIcon className={`w-4 h-4 ${estadoInfo.color}`} />
                    <span className={`font-medium ${estadoInfo.color}`}>{estadoInfo.label}</span>
                  </span>
                  
                  {factura.expediente && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400">
                      <FolderOpen className="w-4 h-4" />
                      <span className="font-medium">{factura.expediente.numeroExpediente}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Derecha: Total */}
              <div className="text-left lg:text-right">
                <p className="text-sm text-theme-secondary mb-1">Total a pagar</p>
                <p className="text-4xl font-bold text-emerald-400">{formatCurrency(factura.importe)}</p>
                <p className="text-sm text-theme-tertiary mt-1">
                  IVA incluido: {formatCurrency(factura.importeIVA || 0)}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Columna principal */}
            <div className="xl:col-span-2 space-y-6">
              {/* Información del Cliente */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-theme-card border border-theme rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-theme-primary">Información del Cliente</h2>
                </div>

                {factura.cliente ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-theme-tertiary mb-1">Nombre / Razón Social</p>
                      <p className="font-medium text-theme-primary">{factura.cliente.nombre}</p>
                    </div>
                    {factura.cliente.cif && (
                      <div>
                        <p className="text-sm text-theme-tertiary mb-1">CIF / NIF</p>
                        <p className="font-medium text-theme-primary">{factura.cliente.cif}</p>
                      </div>
                    )}
                    {factura.cliente.email && (
                      <div>
                        <p className="text-sm text-theme-tertiary mb-1">Correo Electrónico</p>
                        <p className="font-medium text-theme-primary">{factura.cliente.email}</p>
                      </div>
                    )}
                    {factura.cliente.telefono && (
                      <div>
                        <p className="text-sm text-theme-tertiary mb-1">Teléfono</p>
                        <p className="font-medium text-theme-primary">{factura.cliente.telefono}</p>
                      </div>
                    )}
                    {(factura.cliente.direccion || factura.cliente.ciudad || factura.cliente.provincia) && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-theme-tertiary mb-1">Dirección</p>
                        <p className="font-medium text-theme-primary">
                          {[factura.cliente.direccion, factura.cliente.ciudad, factura.cliente.provincia]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-theme-secondary">No hay información de cliente disponible</p>
                )}
              </motion.div>

              {/* Líneas de Factura */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-theme-card border border-theme rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-theme-primary">Conceptos</h2>
                </div>

                {factura.lineas && factura.lineas.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-theme">
                          <th className="text-left py-3 px-2 text-sm font-medium text-theme-secondary">Concepto</th>
                          <th className="text-center py-3 px-2 text-sm font-medium text-theme-secondary">Cantidad</th>
                          <th className="text-right py-3 px-2 text-sm font-medium text-theme-secondary">Precio Unit.</th>
                          <th className="text-right py-3 px-2 text-sm font-medium text-theme-secondary">Importe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {factura.lineas.map((linea: LineaFactura, index: number) => (
                          <motion.tr 
                            key={linea.id || index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            className="border-b border-theme/50 last:border-0"
                          >
                            <td className="py-4 px-2">
                              <p className="font-medium text-theme-primary">{linea.concepto}</p>
                            </td>
                            <td className="py-4 px-2 text-center text-theme-secondary">{linea.cantidad}</td>
                            <td className="py-4 px-2 text-right text-theme-secondary">
                              {formatCurrency(linea.precioUnitario)}
                            </td>
                            <td className="py-4 px-2 text-right font-medium text-theme-primary">
                              {formatCurrency(linea.importe)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 bg-theme-tertiary/30 rounded-xl">
                    <p className="text-theme-secondary text-center">{factura.concepto}</p>
                  </div>
                )}
              </motion.div>

              {/* Concepto general si existe */}
              {factura.concepto && (!factura.lineas || factura.lineas.length === 0) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-theme-card border border-theme rounded-2xl p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg font-semibold text-theme-primary">Concepto General</h2>
                  </div>
                  <p className="text-theme-secondary">{factura.concepto}</p>
                </motion.div>
              )}
            </div>

            {/* Columna lateral */}
            <div className="space-y-6">
              {/* Totales */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-theme-card border border-theme rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Euro className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-theme-primary">Totales</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-theme/50">
                    <span className="text-theme-secondary">Base Imponible</span>
                    <span className="font-medium text-theme-primary">{formatCurrency(factura.importeBase)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-theme/50">
                    <span className="text-theme-secondary">IVA</span>
                    <span className="font-medium text-theme-primary">{formatCurrency(factura.importeIVA || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-emerald-500/10 rounded-lg px-3">
                    <span className="font-semibold text-emerald-400">Total</span>
                    <span className="text-xl font-bold text-emerald-400">{formatCurrency(factura.importe)}</span>
                  </div>
                </div>
              </motion.div>

              {/* Fechas */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-theme-card border border-theme rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-theme-primary">Fechas</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-theme-tertiary rounded-lg">
                      <Receipt className="w-4 h-4 text-theme-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-theme-tertiary">Fecha de Emisión</p>
                      <p className="font-medium text-theme-primary">{formatDate(factura.fechaEmision)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-theme-tertiary rounded-lg">
                      <Clock className="w-4 h-4 text-theme-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-theme-tertiary">Fecha de Vencimiento</p>
                      <p className={`font-medium ${factura.estado === 'VENCIDA' ? 'text-red-400' : 'text-theme-primary'}`}>
                        {formatDate(factura.fechaVencimiento)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Expediente relacionado */}
              {factura.expediente && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-theme-card border border-theme rounded-2xl p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <FolderOpen className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-semibold text-theme-primary">Expediente</h2>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="font-medium text-blue-400">{factura.expediente.numeroExpediente}</p>
                    {factura.expediente.tipo && (
                      <p className="text-sm text-theme-secondary mt-1">{factura.expediente.tipo}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Acciones */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-theme-card border border-theme rounded-2xl p-6 print:hidden"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-theme-primary">Acciones</h2>
                </div>

                <div className="space-y-2">
                  {permissions.canPrint && (
                    <button
                      onClick={() => setActiveModal('print')}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-theme-tertiary hover:bg-theme-tertiary/80 rounded-xl text-theme-primary transition-colors"
                    >
                      <Printer className="w-5 h-5" />
                      <span>Imprimir</span>
                    </button>
                  )}

                  {permissions.canDownload && (
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-theme-tertiary hover:bg-theme-tertiary/80 rounded-xl text-theme-primary transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span>Descargar PDF</span>
                    </button>
                  )}

                  {permissions.canSendEmail && factura.estado !== 'ANULADA' && (
                    <button
                      onClick={() => setActiveModal('email')}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-theme-tertiary hover:bg-theme-tertiary/80 rounded-xl text-theme-primary transition-colors"
                    >
                      <Send className="w-5 h-5" />
                      <span>Enviar por Email</span>
                    </button>
                  )}

                  {factura.estado === 'PENDIENTE' && (
                    <button
                      onClick={handleRegisterPayment}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Registrar Pago</span>
                    </button>
                  )}

                  {permissions.canDelete && factura.estado !== 'ANULADA' && (
                    <button
                      onClick={() => setActiveModal('delete')}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Anular Factura</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Modal: Confirmar Eliminación */}
        <AnimatePresence>
          {activeModal === 'delete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Anular Factura</h2>
                </div>
                
                <p className="text-slate-300 mb-6">
                  ¿Estás seguro de que deseas anular la factura <strong>{factura.numero}</strong>?
                  Esta acción no se puede deshacer.
                </p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveModal(null)}
                    disabled={processing}
                    className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  
                  <button 
                    onClick={handleDelete}
                    disabled={processing}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Anulando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Anular Factura
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Enviar Email */}
        <AnimatePresence>
          {activeModal === 'email' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/20 rounded-full">
                      <Mail className="w-6 h-6 text-amber-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Enviar Factura</h2>
                  </div>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
                  <p className="text-sm text-amber-400 mb-1">Factura {factura.numero}</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(factura.importe)}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={emailForm.email}
                        onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                        placeholder="cliente@ejemplo.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Mensaje (opcional)</label>
                    <textarea
                      value={emailForm.mensaje}
                      onChange={(e) => setEmailForm({ ...emailForm, mensaje: e.target.value })}
                      placeholder="Añade un mensaje personalizado..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setActiveModal(null)}
                    disabled={processing}
                    className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  
                  <button 
                    onClick={handleSendEmail}
                    disabled={processing || !emailForm.email}
                    className="flex-1 px-4 py-2.5 bg-amber-500 text-slate-950 font-medium rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Vista Previa de Impresión */}
        <AnimatePresence>
          {activeModal === 'print' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <Printer className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Vista Previa de Impresión</h2>
                </div>
                
                <div className="p-6 bg-white rounded-xl mb-6 text-slate-900">
                  <div className="border-b-2 border-slate-200 pb-4 mb-4">
                    <h3 className="text-2xl font-bold">FACTURA</h3>
                    <p className="text-slate-600">{factura.numero}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cliente:</span>
                      <span className="font-medium">{factura.cliente?.nombre || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Fecha:</span>
                      <span>{formatDateShort(factura.fechaEmision)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Vencimiento:</span>
                      <span>{formatDateShort(factura.fechaVencimiento)}</span>
                    </div>
                    <div className="border-t-2 border-slate-200 pt-4 mt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(factura.importe)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Cerrar
                  </button>
                  
                  <button 
                    onClick={handlePrint}
                    className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toasts */}
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, x: '100%' }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: '100%' }}
              className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
                toast.type === 'success' 
                  ? 'bg-emerald-500 text-white' 
                  : toast.type === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-amber-500 text-slate-950'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> 
                : toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> 
                : <Receipt className="w-5 h-5" />}
              <span className="font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>
    </AppLayout>
  );
}
