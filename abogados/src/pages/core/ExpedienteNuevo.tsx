import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Save, AlertCircle, CheckCircle2, Loader2,
  FileText, User, Gavel, Hash, FileEdit, Search
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  expedienteService,
  clienteService,
  type CreateExpedienteData,
  type TipoExpediente,
  type EstadoExpediente,
  type Cliente
} from '@/services';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const tipoOptions: { value: TipoExpediente; label: string }[] = [
  { value: 'CIVIL', label: 'Civil' },
  { value: 'PENAL', label: 'Penal' },
  { value: 'LABORAL', label: 'Laboral' },
  { value: 'CONTENCIOSO', label: 'Contencioso-Administrativo' },
  { value: 'MERCANTIL', label: 'Mercantil' },
  { value: 'FAMILIA', label: 'Familia' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo' },
];

const estadoOptions: { value: EstadoExpediente; label: string }[] = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'CERRADO', label: 'Cerrado' },
  { value: 'ARCHIVADO', label: 'Archivado' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
];

export default function ExpedienteNuevo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<CreateExpedienteData>({
    numeroExpediente: '',
    tipo: 'CIVIL',
    estado: 'ACTIVO',
    descripcion: '',
    clienteId: '',
    abogadoId: user?.id || '',
  });
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [clienteSearch, setClienteSearch] = useState('');
  const [showClientesDropdown, setShowClientesDropdown] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Generar número de expediente automático
  useEffect(() => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setFormData(prev => ({
      ...prev,
      numeroExpediente: `${year}/${random}`
    }));
  }, []);

  // Buscar clientes
  useEffect(() => {
    const buscarClientes = async () => {
      if (clienteSearch.length < 2) {
        setClientes([]);
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
  }, [clienteSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClienteSelect = (cliente: Cliente) => {
    setFormData(prev => ({
      ...prev,
      clienteId: cliente.id
    }));
    setClienteSearch(cliente.nombre);
    setShowClientesDropdown(false);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const validateForm = (): boolean => {
    if (!formData.numeroExpediente.trim()) {
      setError('El número de expediente es obligatorio');
      return false;
    }
    if (!formData.clienteId) {
      setError('Debe seleccionar un cliente');
      return false;
    }
    if (!formData.abogadoId) {
      setError('Debe seleccionar un abogado');
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
      const nuevoExpediente = await expedienteService.crearExpediente(formData);
      showToast('Expediente creado correctamente', 'success');
      
      // Redirigir al detalle del expediente creado
      setTimeout(() => {
        navigate(`/core/expedientes/${nuevoExpediente.id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al crear el expediente');
      showToast(err.message || 'Error al crear el expediente', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/core/expedientes');
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleCancel}
            className="p-2 text-theme-secondary hover:text-theme-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Nuevo Expediente</h1>
            <p className="text-theme-secondary">Crear un nuevo expediente en el sistema</p>
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
          <div className="bg-theme-secondary rounded-xl border border-theme p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-theme-primary">Información Básica</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Número de Expediente */}
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Número de Expediente <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                  <input
                    type="text"
                    name="numeroExpediente"
                    value={formData.numeroExpediente}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-theme border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                    placeholder="2026/0001"
                    required
                  />
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Tipo de Expediente <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Gavel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-theme border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                    required
                  >
                    {tipoOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-theme border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                  required
                >
                  {estadoOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Abogado */}
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Abogado Asignado <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                  <input
                    type="text"
                    value={user ? `${user.nombre} ${user.apellido1 || ''}` : ''}
                    disabled
                    className="w-full pl-10 pr-4 py-2 bg-theme border border-theme rounded-lg text-theme-primary opacity-50"
                  />
                </div>
                <input type="hidden" name="abogadoId" value={formData.abogadoId} />
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div className="bg-theme-secondary rounded-xl border border-theme p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-theme-primary">Cliente</h2>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-theme-secondary mb-1">
                Buscar Cliente <span className="text-red-500">*</span>
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
                    }
                  }}
                  onFocus={() => setShowClientesDropdown(true)}
                  placeholder="Escriba para buscar clientes..."
                  className="w-full pl-10 pr-4 py-2 bg-theme border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Dropdown de clientes */}
              {showClientesDropdown && (clientes.length > 0 || loadingClientes) && (
                <div className="absolute z-10 w-full mt-1 bg-theme border border-theme rounded-lg shadow-lg max-h-60 overflow-auto">
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
                        className="w-full px-4 py-3 text-left hover:bg-theme-hover transition-colors border-b border-theme last:border-0"
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
                </div>
              )}

              {clienteSearch && clientes.length === 0 && !loadingClientes && (
                <div className="absolute z-10 w-full mt-1 bg-theme border border-theme rounded-lg shadow-lg p-4 text-center text-theme-secondary">
                  No se encontraron clientes
                </div>
              )}
            </div>

            {formData.clienteId && (
              <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Cliente seleccionado correctamente</span>
                </div>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div className="bg-theme-secondary rounded-xl border border-theme p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileEdit className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-theme-primary">Descripción</h2>
            </div>

            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={4}
              placeholder="Descripción del caso, detalles relevantes..."
              className="w-full px-4 py-2 bg-theme border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
            >
              Cancelar
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Crear Expediente
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 space-y-2 z-50">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              toast.type === 'success' 
                ? 'bg-emerald-500 text-white' 
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> 
              : toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> 
              : <FileText className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}
