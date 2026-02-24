import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, AlertCircle, CheckCircle2, Loader2,
  Receipt, User, Search, Trash2, Plus, Calendar, 
  Hash, FileText, DollarSign, Percent, Package, 
  X, ChevronDown
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  facturaService, 
  type Factura, 
  type CreateFacturaData, 
  type CreateLineaFacturaData 
} from '@/services/facturaService';
import { clienteService, type Cliente } from '@/services/clienteService';
import { expedienteService, type Expediente } from '@/services/expedienteService';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface LineaFormData {
  id?: string;
  concepto: string;
  cantidad: number;
  precioUnitario: number;
}

interface FormData {
  numero: string;
  concepto: string;
  clienteId: string;
  expedienteId: string;
  importeBase: number;
  porcentajeIVA: number;
  fechaEmision: string;
  fechaVencimiento: string;
  lineas: LineaFormData[];
}

export default function FacturaForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  // Form state
  const [formData, setFormData] = useState<FormData>({
    numero: '',
    concepto: '',
    clienteId: '',
    expedienteId: '',
    importeBase: 0,
    porcentajeIVA: 21,
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    lineas: [{ concepto: '', cantidad: 1, precioUnitario: 0 }],
  });

  // Client search state
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [clienteSearch, setClienteSearch] = useState('');
  const [showClientesDropdown, setShowClientesDropdown] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // Expediente search state
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loadingExpedientes, setLoadingExpedientes] = useState(false);
  const [expedienteSearch, setExpedienteSearch] = useState('');
  const [showExpedientesDropdown, setShowExpedientesDropdown] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Generate invoice number on mount
  useEffect(() => {
    if (!isEditing) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      setFormData(prev => ({
        ...prev,
        numero: `F-${year}-${random}`
      }));
    }
  }, [isEditing]);

  // Load factura data if editing
  useEffect(() => {
    if (isEditing && id) {
      const loadFactura = async () => {
        setLoading(true);
        try {
          const response = await facturaService.getFacturaById(id);
          const factura = response.data;
          
          setFormData({
            numero: factura.numero,
            concepto: factura.concepto,
            clienteId: factura.clienteId,
            expedienteId: factura.expedienteId || '',
            importeBase: factura.importeBase,
            porcentajeIVA: factura.importeIVA && factura.importeBase > 0 
              ? Math.round((factura.importeIVA / factura.importeBase) * 100) 
              : 21,
            fechaEmision: factura.fechaEmision.split('T')[0],
            fechaVencimiento: factura.fechaVencimiento ? factura.fechaVencimiento.split('T')[0] : '',
            lineas: factura.lineas?.map(l => ({
              id: l.id,
              concepto: l.concepto,
              cantidad: l.cantidad,
              precioUnitario: l.precioUnitario,
            })) || [{ concepto: '', cantidad: 1, precioUnitario: 0 }],
          });

          if (factura.cliente) {
            setSelectedCliente(factura.cliente);
            setClienteSearch(factura.cliente.nombre);
          }

          if (factura.expediente) {
            setSelectedExpediente(factura.expediente);
            setExpedienteSearch(factura.expediente.numeroExpediente);
          }
        } catch (err: any) {
          setError(err.message || 'Error al cargar la factura');
          showToast('Error al cargar la factura', 'error');
        } finally {
          setLoading(false);
        }
      };

      loadFactura();
    }
  }, [isEditing, id]);

  // Search clients
  useEffect(() => {
    const buscarClientes = async () => {
      if (clienteSearch.length < 2 || selectedCliente?.nombre === clienteSearch) {
        return;
      }
      
      setLoadingClientes(true);
      try {
        const response = await clienteService.listarClientes({
          search: clienteSearch,
          limit: 10
        });
        setClientes(response.data);
      } catch (err) {
        console.error('Error buscando clientes:', err);
      } finally {
        setLoadingClientes(false);
      }
    };

    const timer = setTimeout(buscarClientes, 300);
    return () => clearTimeout(timer);
  }, [clienteSearch, selectedCliente]);

  // Search expedientes
  useEffect(() => {
    const buscarExpedientes = async () => {
      if (expedienteSearch.length < 2 || selectedExpediente?.numeroExpediente === expedienteSearch) {
        return;
      }
      
      setLoadingExpedientes(true);
      try {
        const response = await expedienteService.listarExpedientes({
          search: expedienteSearch,
          limit: 10
        });
        setExpedientes(response.data);
      } catch (err) {
        console.error('Error buscando expedientes:', err);
      } finally {
        setLoadingExpedientes(false);
      }
    };

    const timer = setTimeout(buscarExpedientes, 300);
    return () => clearTimeout(timer);
  }, [expedienteSearch, selectedExpediente]);

  // Calculate totals
  const calculateTotals = useMemo(() => {
    const baseFromLineas = formData.lineas.reduce((sum, linea) => {
      return sum + (linea.cantidad * linea.precioUnitario);
    }, 0);

    const base = baseFromLineas || formData.importeBase;
    const iva = base * (formData.porcentajeIVA / 100);
    const total = base + iva;

    return { base, iva, total };
  }, [formData.lineas, formData.porcentajeIVA, formData.importeBase]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toastId = Date.now();
    setToasts(prev => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'porcentajeIVA' ? parseFloat(value) || 0 : value
    }));
  };

  const handleClienteSelect = (cliente: Cliente) => {
    setFormData(prev => ({ ...prev, clienteId: cliente.id }));
    setSelectedCliente(cliente);
    setClienteSearch(cliente.nombre);
    setShowClientesDropdown(false);
  };

  const handleExpedienteSelect = (expediente: Expediente) => {
    setFormData(prev => ({ ...prev, expedienteId: expediente.id }));
    setSelectedExpediente(expediente);
    setExpedienteSearch(expediente.numeroExpediente);
    setShowExpedientesDropdown(false);
  };

  const handleClearExpediente = () => {
    setFormData(prev => ({ ...prev, expedienteId: '' }));
    setSelectedExpediente(null);
    setExpedienteSearch('');
  };

  const handleAddLinea = () => {
    setFormData(prev => ({
      ...prev,
      lineas: [...prev.lineas, { concepto: '', cantidad: 1, precioUnitario: 0 }]
    }));
  };

  const handleRemoveLinea = (index: number) => {
    if (formData.lineas.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      lineas: prev.lineas.filter((_, i) => i !== index)
    }));
  };

  const handleLineaChange = (index: number, field: keyof LineaFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      lineas: prev.lineas.map((linea, i) => {
        if (i !== index) return linea;
        return { ...linea, [field]: value };
      })
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.numero.trim()) {
      setError('El número de factura es obligatorio');
      return false;
    }
    if (!formData.clienteId) {
      setError('Debe seleccionar un cliente');
      return false;
    }
    if (!formData.concepto.trim()) {
      setError('El concepto es obligatorio');
      return false;
    }
    if (formData.lineas.some(l => !l.concepto.trim() || l.cantidad <= 0 || l.precioUnitario < 0)) {
      setError('Todas las líneas deben tener concepto, cantidad y precio válidos');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Por favor, complete todos los campos obligatorios', 'error');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const dataToSend: CreateFacturaData = {
        numero: formData.numero,
        concepto: formData.concepto,
        importeBase: calculateTotals.base,
        importeIVA: calculateTotals.iva,
        clienteId: formData.clienteId,
        ...(formData.expedienteId && { expedienteId: formData.expedienteId }),
        fechaEmision: formData.fechaEmision,
        ...(formData.fechaVencimiento && { fechaVencimiento: formData.fechaVencimiento }),
        lineas: formData.lineas.map(l => ({
          concepto: l.concepto,
          cantidad: l.cantidad,
          precioUnitario: l.precioUnitario,
        })),
      };

      if (isEditing && id) {
        await facturaService.updateFactura(id, dataToSend);
        showToast('Factura actualizada correctamente', 'success');
      } else {
        await facturaService.createFactura(dataToSend);
        showToast('Factura creada correctamente', 'success');
      }

      setTimeout(() => {
        navigate('/finanzas/facturacion');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la factura');
      showToast(err.message || 'Error al guardar la factura', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/finanzas/facturacion');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <AppLayout title={isEditing ? 'Editar Factura' : 'Nueva Factura'}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex items-center gap-3 text-theme-secondary">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Cargando factura...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title={isEditing ? 'Editar Factura' : 'Nueva Factura'}
      subtitle={isEditing ? `Factura ${formData.numero}` : 'Crear una nueva factura'}
    >
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleCancel}
              className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-theme-primary">
                {isEditing ? 'Editar Factura' : 'Nueva Factura'}
              </h1>
              <p className="text-theme-secondary">
                {isEditing ? `Modificando factura ${formData.numero}` : 'Crear una nueva factura en el sistema'}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-theme-secondary rounded-xl border border-theme p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-theme-primary">Información Básica</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Número de Factura */}
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">
                    Número de Factura <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                    <input
                      type="text"
                      name="numero"
                      value={formData.numero}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-theme border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="F-2026-0001"
                      required
                    />
                  </div>
                </div>

                {/* Fecha Emisión */}
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">
                    Fecha de Emisión <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                    <input
                      type="date"
                      name="fechaEmision"
                      value={formData.fechaEmision}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-theme border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Fecha Vencimiento */}
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">
                    Fecha de Vencimiento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                    <input
                      type="date"
                      name="fechaVencimiento"
                      value={formData.fechaVencimiento}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-theme border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Concepto */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-theme-secondary mb-1">
                    Concepto General <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-theme-tertiary" />
                    <input
                      type="text"
                      name="concepto"
                      value={formData.concepto}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-theme border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="Descripción general de la factura..."
                      required
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Cliente y Expediente */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-theme-secondary rounded-xl border border-theme p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-theme-primary">Cliente y Expediente</h2>
              </div>

              <div className="space-y-4">
                {/* Cliente */}
                <div className="relative">
                  <label className="block text-sm font-medium text-theme-secondary mb-1">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                    <input
                      type="text"
                      value={clienteSearch}
                      onChange={(e) => {
                        setClienteSearch(e.target.value);
                        setShowClientesDropdown(true);
                        if (!e.target.value) {
                          setFormData(prev => ({ ...prev, clienteId: '' }));
                          setSelectedCliente(null);
                        }
                      }}
                      onFocus={() => setShowClientesDropdown(true)}
                      placeholder="Buscar cliente por nombre, CIF o email..."
                      className="w-full pl-10 pr-4 py-2.5 bg-theme border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  {/* Dropdown de clientes */}
                  <AnimatePresence>
                    {showClientesDropdown && (clientes.length > 0 || loadingClientes) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-theme border border-theme rounded-xl shadow-lg max-h-60 overflow-auto"
                      >
                        {loadingClientes ? (
                          <div className="p-4 text-center text-theme-secondary">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                          </div>
                        ) : (
                          clientes.map(cliente => (
                            <button
                              key={cliente.id}
                              type="button"
                              onClick={() => handleClienteSelect(cliente)}
                              className="w-full px-4 py-3 text-left hover:bg-theme-tertiary/50 transition-colors border-b border-theme last:border-0"
                            >
                              <p className="font-medium text-theme-primary">{cliente.nombre}</p>
                              {cliente.cif && (
                                <p className="text-sm text-theme-secondary">CIF: {cliente.cif}</p>
                              )}
                              {cliente.email && (
                                <p className="text-xs text-theme-tertiary">{cliente.email}</p>
                              )}
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {clienteSearch && clientes.length === 0 && !loadingClientes && clienteSearch.length >= 2 && (
                    <div className="absolute z-10 w-full mt-1 bg-theme border border-theme rounded-xl shadow-lg p-4 text-center text-theme-secondary">
                      No se encontraron clientes
                    </div>
                  )}
                </div>

                {selectedCliente && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-emerald-500 font-medium">
                        Cliente seleccionado: {selectedCliente.nombre}
                      </span>
                    </div>
                  </div>
                )}

                {/* Expediente (Opcional) */}
                <div className="relative">
                  <label className="block text-sm font-medium text-theme-secondary mb-1">
                    Expediente Relacionado <span className="text-theme-tertiary">(opcional)</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                    <input
                      type="text"
                      value={expedienteSearch}
                      onChange={(e) => {
                        setExpedienteSearch(e.target.value);
                        setShowExpedientesDropdown(true);
                        if (!e.target.value) {
                          setFormData(prev => ({ ...prev, expedienteId: '' }));
                          setSelectedExpediente(null);
                        }
                      }}
                      onFocus={() => setShowExpedientesDropdown(true)}
                      placeholder="Buscar expediente por número..."
                      className="w-full pl-10 pr-10 py-2.5 bg-theme border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 transition-colors"
                      disabled={!!selectedExpediente}
                    />
                    {selectedExpediente && (
                      <button
                        type="button"
                        onClick={handleClearExpediente}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-theme-tertiary hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown de expedientes */}
                  <AnimatePresence>
                    {showExpedientesDropdown && !selectedExpediente && (expedientes.length > 0 || loadingExpedientes) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-theme border border-theme rounded-xl shadow-lg max-h-60 overflow-auto"
                      >
                        {loadingExpedientes ? (
                          <div className="p-4 text-center text-theme-secondary">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                          </div>
                        ) : (
                          expedientes.map(expediente => (
                            <button
                              key={expediente.id}
                              type="button"
                              onClick={() => handleExpedienteSelect(expediente)}
                              className="w-full px-4 py-3 text-left hover:bg-theme-tertiary/50 transition-colors border-b border-theme last:border-0"
                            >
                              <p className="font-medium text-theme-primary">{expediente.numeroExpediente}</p>
                              <p className="text-sm text-theme-secondary">{expediente.tipo}</p>
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {selectedExpediente && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      <span className="text-blue-500 font-medium">
                        Expediente seleccionado: {selectedExpediente.numeroExpediente}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Líneas de Factura */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-theme-secondary rounded-xl border border-theme p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-theme-primary">Líneas de Factura</h2>
                </div>
                <button
                  type="button"
                  onClick={handleAddLinea}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 rounded-lg transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Añadir línea
                </button>
              </div>

              <div className="space-y-4">
                {formData.lineas.map((linea, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-12 gap-3 items-start p-4 bg-theme rounded-xl border border-theme"
                  >
                    {/* Concepto */}
                    <div className="col-span-12 md:col-span-5">
                      <label className="block text-xs text-theme-tertiary mb-1">Concepto</label>
                      <input
                        type="text"
                        value={linea.concepto}
                        onChange={(e) => handleLineaChange(index, 'concepto', e.target.value)}
                        placeholder="Descripción del servicio..."
                        className="w-full px-3 py-2 bg-theme-tertiary/30 border border-theme rounded-lg text-theme-primary text-sm focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    {/* Cantidad */}
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-xs text-theme-tertiary mb-1">Cantidad</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={linea.cantidad}
                        onChange={(e) => handleLineaChange(index, 'cantidad', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-theme-tertiary/30 border border-theme rounded-lg text-theme-primary text-sm focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    {/* Precio Unitario */}
                    <div className="col-span-6 md:col-span-3">
                      <label className="block text-xs text-theme-tertiary mb-1">Precio Unitario</label>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-theme-tertiary" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={linea.precioUnitario}
                          onChange={(e) => handleLineaChange(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
                          className="w-full pl-7 pr-3 py-2 bg-theme-tertiary/30 border border-theme rounded-lg text-theme-primary text-sm focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Total línea */}
                    <div className="col-span-10 md:col-span-1">
                      <label className="block text-xs text-theme-tertiary mb-1">Total</label>
                      <p className="py-2 text-sm font-medium text-theme-primary">
                        {formatCurrency(linea.cantidad * linea.precioUnitario)}
                      </p>
                    </div>

                    {/* Eliminar */}
                    <div className="col-span-2 md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveLinea(index)}
                        disabled={formData.lineas.length <= 1}
                        className="p-2 text-theme-tertiary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Totales e IVA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-theme-secondary rounded-xl border border-theme p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Percent className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-theme-primary">Totales</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Porcentaje IVA */}
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-1">
                    Porcentaje de IVA
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                    <select
                      name="porcentajeIVA"
                      value={formData.porcentajeIVA}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-2.5 bg-theme border border-theme rounded-xl text-theme-primary focus:outline-none focus:border-amber-500 transition-colors appearance-none"
                    >
                      <option value={0}>0% (Exento)</option>
                      <option value={4}>4% (Superreducido)</option>
                      <option value={10}>10% (Reducido)</option>
                      <option value={21}>21% (General)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary pointer-events-none" />
                  </div>
                </div>

                {/* Resumen de totales */}
                <div className="p-4 bg-theme rounded-xl border border-theme">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-theme-secondary">Base Imponible:</span>
                      <span className="font-medium text-theme-primary">{formatCurrency(calculateTotals.base)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-theme-secondary">IVA ({formData.porcentajeIVA}%):</span>
                      <span className="font-medium text-theme-primary">{formatCurrency(calculateTotals.iva)}</span>
                    </div>
                    <div className="pt-2 border-t border-theme">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-theme-primary">Total:</span>
                        <span className="text-xl font-bold text-emerald-400">{formatCurrency(calculateTotals.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Botones de acción */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-end gap-4 pt-4"
            >
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 text-theme-secondary hover:text-theme-primary transition-colors"
              >
                Cancelar
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Actualizar Factura' : 'Crear Factura'}
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>
        </div>
      </main>

      {/* Toasts */}
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, x: '100%' }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: '100%' }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
              toast.type === 'success' 
                ? 'bg-emerald-500 text-white' 
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> 
              : toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> 
              : <Receipt className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </AppLayout>
  );
}
