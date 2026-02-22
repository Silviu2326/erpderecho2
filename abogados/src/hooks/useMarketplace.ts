import { useState, useCallback } from 'react';
import { marketplaceService } from '@/services/marketplaceService';
import type {
  IntegracionMarketplace,
  InstalacionIntegracion,
  FiltrosMarketplace,
  ResultadoBusquedaMarketplace,
  NotificacionMarketplace,
  ActualizacionIntegracion,
  CategoriaIntegracion,
  ProveedorIntegracion,
  ConfiguracionIntegracion,
  PermisosMarketplace,
} from '@/types/marketplace';

type MarketplaceState = 'idle' | 'loading' | 'success' | 'error';

interface UseMarketplaceReturn {
  state: MarketplaceState;
  error: string | null;
  
  catalogo: IntegracionMarketplace[];
  totalCatalogo: number;
  facetas: ResultadoBusquedaMarketplace['facetas'] | null;
  
  instalaciones: InstalacionIntegracion[];
  instalacionesActivas: InstalacionIntegracion[];
  
  categorias: CategoriaIntegracion[];
  proveedores: ProveedorIntegracion[];
  
  notificaciones: NotificacionIntegracion[];
  actualizaciones: ActualizacionIntegracion[];
  
  filtros: FiltrosMarketplace;
  permisos: PermisosMarketplace;
  
  isLoading: boolean;
  isInstalling: boolean;
  isUpdating: boolean;
  
  cargarCatalogo: (filtros?: FiltrosMarketplace) => Promise<void>;
  cargarInstalaciones: () => Promise<void>;
  cargarCategorias: () => Promise<void>;
  cargarProveedores: () => Promise<void>;
  cargarNotificaciones: () => Promise<void>;
  cargarActualizaciones: () => Promise<void>;
  cargarTodo: () => Promise<void>;
  
  buscar: (termino: string) => Promise<IntegracionMarketplace[]>;
  obtenerPorId: (id: string) => Promise<IntegracionMarketplace | null>;
  obtenerPorClave: (clave: string) => Promise<IntegracionMarketplace | null>;
  obtenerPorCategoria: (categoria: CategoriaIntegracion) => Promise<IntegracionMarketplace[]>;
  obtenerDestacadas: () => Promise<IntegracionMarketplace[]>;
  obtenerPopulares: () => Promise<IntegracionMarketplace[]>;
  obtenerRecientes: () => Promise<IntegracionMarketplace[]>;
  
  instalar: (integracionId: string, config?: Partial<ConfiguracionIntegracion>) => Promise<InstalacionIntegracion | null>;
  desinstalar: (instalacionId: string) => Promise<boolean>;
  actualizar: (instalacionId: string, config: Partial<ConfiguracionIntegracion>) => Promise<InstalacionIntegracion | null>;
  actualizarVersion: (instalacionId: string) => Promise<InstalacionIntegracion | null>;
  probarConexion: (instalacionId: string) => Promise<{ success: boolean; message: string }>;
  
  marcarNotificacionLeida: (notificacionId: string) => Promise<void>;
  
  setFiltros: (filtros: FiltrosMarketplace) => void;
  limpiarFiltros: () => void;
  
  getEstadoInstalacion: (clave: string) => { instalada: boolean; estado?: string; instalacion?: InstalacionIntegracion };
  isInstalada: (clave: string) => boolean;
  getInstalacion: (clave: string) => InstalacionIntegracion | undefined;
}

export function useMarketplace(rol: string = 'default'): UseMarketplaceReturn {
  const [state, setState] = useState<MarketplaceState>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const [catalogo, setCatalogo] = useState<IntegracionMarketplace[]>([]);
  const [totalCatalogo, setTotalCatalogo] = useState(0);
  const [facetas, setFacetas] = useState<ResultadoBusquedaMarketplace['facetas'] | null>(null);
  
  const [instalaciones, setInstalaciones] = useState<InstalacionIntegracion[]>([]);
  const [categorias, setCategorias] = useState<CategoriaIntegracion[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorIntegracion[]>([]);
  const [notificaciones, setNotificaciones] = useState<NotificacionMarketplace[]>([]);
  const [actualizaciones, setActualizaciones] = useState<ActualizacionIntegracion[]>([]);
  
  const [filtros, setFiltrosState] = useState<FiltrosMarketplace>({});
  const permisos = useState<PermisosMarketplace>(() => marketplaceService.getPermisos(rol))[0];
  
  const [isInstalling, setIsInstalling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isLoading = state === 'loading';

  const instalacionesActivas = instalaciones.filter(i => i.estado === 'installed');

  const cargarCatalogo = useCallback(async (filtros?: FiltrosMarketplace) => {
    setState('loading');
    setError(null);
    try {
      const result = await marketplaceService.getCatalogo(filtros);
      setCatalogo(result.integraciones);
      setTotalCatalogo(result.total);
      setFacetas(result.facetas);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar catálogo');
      setState('error');
    }
  }, []);

  const cargarInstalaciones = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const result = await marketplaceService.getInstalaciones();
      setInstalaciones(result);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar instalaciones');
      setState('error');
    }
  }, []);

  const cargarCategorias = useCallback(async () => {
    try {
      const result = await marketplaceService.getCategorias();
      setCategorias(result);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  }, []);

  const cargarProveedores = useCallback(async () => {
    try {
      const result = await marketplaceService.getProveedores();
      setProveedores(result);
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
    }
  }, []);

  const cargarNotificaciones = useCallback(async () => {
    try {
      const result = await marketplaceService.getNotificaciones();
      setNotificaciones(result);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    }
  }, []);

  const cargarActualizaciones = useCallback(async () => {
    try {
      const result = await marketplaceService.getActualizaciones();
      setActualizaciones(result);
    } catch (err) {
      console.error('Error al cargar actualizaciones:', err);
    }
  }, []);

  const cargarTodo = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const [catalogoResult, instalacionesResult, categoriasResult, proveedoresResult] = await Promise.all([
        marketplaceService.getCatalogo(filtros),
        marketplaceService.getInstalaciones(),
        marketplaceService.getCategorias(),
        marketplaceService.getProveedores(),
      ]);
      
      setCatalogo(catalogoResult.integraciones);
      setTotalCatalogo(catalogoResult.total);
      setFacetas(catalogoResult.facetas);
      setInstalaciones(instalacionesResult);
      setCategorias(categoriasResult);
      setProveedores(proveedoresResult);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
      setState('error');
    }
  }, [filtros]);

  const buscar = useCallback(async (termino: string): Promise<IntegracionMarketplace[]> => {
    return marketplaceService.buscarIntegraciones(termino);
  }, []);

  const obtenerPorId = useCallback(async (id: string): Promise<IntegracionMarketplace | null> => {
    return marketplaceService.getIntegracionById(id);
  }, []);

  const obtenerPorClave = useCallback(async (clave: string): Promise<IntegracionMarketplace | null> => {
    return marketplaceService.getIntegracionByClave(clave);
  }, []);

  const obtenerPorCategoria = useCallback(async (categoria: CategoriaIntegracion): Promise<IntegracionMarketplace[]> => {
    return marketplaceService.getIntegracionesPorCategoria(categoria);
  }, []);

  const obtenerDestacadas = useCallback(async (): Promise<IntegracionMarketplace[]> => {
    return marketplaceService.getIntegracionesDestacadas();
  }, []);

  const obtenerPopulares = useCallback(async (): Promise<IntegracionMarketplace[]> => {
    return marketplaceService.getIntegracionesPopulares();
  }, []);

  const obtenerRecientes = useCallback(async (): Promise<IntegracionMarketplace[]> => {
    return marketplaceService.getIntegracionesRecientes();
  }, []);

  const instalar = useCallback(async (
    integracionId: string,
    config?: Partial<ConfiguracionIntegracion>
  ): Promise<InstalacionIntegracion | null> => {
    if (!permisos.puedeInstalar) {
      setError('No tienes permisos para instalar integraciones');
      return null;
    }
    
    setIsInstalling(true);
    setError(null);
    try {
      const instalacion = await marketplaceService.instalarIntegracion(integracionId, config);
      const instalacionesActualizadas = await marketplaceService.getInstalaciones();
      setInstalaciones(instalacionesActualizadas);
      return instalacion;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al instalar');
      return null;
    } finally {
      setIsInstalling(false);
    }
  }, [permisos.puedeInstalar]);

  const desinstalar = useCallback(async (instalacionId: string): Promise<boolean> => {
    if (!permisos.puedeDesinstalar) {
      setError('No tienes permisos para desinstalar integraciones');
      return false;
    }
    
    setError(null);
    try {
      const success = await marketplaceService.desinstalarIntegracion(instalacionId);
      if (success) {
        const instalacionesActualizadas = await marketplaceService.getInstalaciones();
        setInstalaciones(instalacionesActualizadas);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desinstalar');
      return false;
    }
  }, [permisos.puedeDesinstalar]);

  const actualizar = useCallback(async (
    instalacionId: string,
    config: Partial<ConfiguracionIntegracion>
  ): Promise<InstalacionIntegracion | null> => {
    if (!permisos.puedeConfigurar) {
      setError('No tienes permisos para configurar integraciones');
      return null;
    }
    
    setError(null);
    try {
      const instalacion = await marketplaceService.actualizarInstalacion(instalacionId, config);
      const instalacionesActualizadas = await marketplaceService.getInstalaciones();
      setInstalaciones(instalacionesActualizadas);
      return instalacion;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
      return null;
    }
  }, [permisos.puedeConfigurar]);

  const actualizarVersion = useCallback(async (instalacionId: string): Promise<InstalacionIntegracion | null> => {
    if (!permisos.puedeActualizar) {
      setError('No tienes permisos para actualizar integraciones');
      return null;
    }
    
    setIsUpdating(true);
    setError(null);
    try {
      const instalacion = await marketplaceService.actualizarVersion(instalacionId);
      const instalacionesActualizadas = await marketplaceService.getInstalaciones();
      setInstalaciones(instalacionesActualizadas);
      return instalacion;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar versión');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [permisos.puedeActualizar]);

  const probarConexion = useCallback(async (instalacionId: string) => {
    return marketplaceService.probarConexion(instalacionId);
  }, []);

  const marcarNotificacionLeida = useCallback(async (notificacionId: string) => {
    try {
      await marketplaceService.marcarNotificacionLeida(notificacionId);
      setNotificaciones(prev => 
        prev.map(n => n.id === notificacionId ? { ...n, leida: true } : n)
      );
    } catch (err) {
      console.error('Error al marcar notificación:', err);
    }
  }, []);

  const setFiltros = useCallback((nuevosFiltros: FiltrosMarketplace) => {
    setFiltrosState(nuevosFiltros);
    cargarCatalogo(nuevosFiltros);
  }, [cargarCatalogo]);

  const limpiarFiltros = useCallback(() => {
    setFiltrosState({});
    cargarCatalogo({});
  }, [cargarCatalogo]);

  const getEstadoInstalacion = useCallback((clave: string) => {
    return marketplaceService.getInstalacionEstado(clave, instalaciones);
  }, [instalaciones]);

  const isInstalada = useCallback((clave: string) => {
    return marketplaceService.isIntegracionInstalada(clave, instalaciones);
  }, [instalaciones]);

  const getInstalacion = useCallback((clave: string) => {
    return instalaciones.find(i => i.claveIntegracion === clave);
  }, [instalaciones]);

  return {
    state,
    error,
    catalogo,
    totalCatalogo,
    facetas,
    instalaciones,
    instalacionesActivas,
    categorias,
    proveedores,
    notificaciones,
    actualizaciones,
    filtros,
    permisos,
    isLoading,
    isInstalling,
    isUpdating,
    cargarCatalogo,
    cargarInstalaciones,
    cargarCategorias,
    cargarProveedores,
    cargarNotificaciones,
    cargarActualizaciones,
    cargarTodo,
    buscar,
    obtenerPorId,
    obtenerPorClave,
    obtenerPorCategoria,
    obtenerDestacadas,
    obtenerPopulares,
    obtenerRecientes,
    instalar,
    desinstalar,
    actualizar,
    actualizarVersion,
    probarConexion,
    marcarNotificacionLeida,
    setFiltros,
    limpiarFiltros,
    getEstadoInstalacion,
    isInstalada,
    getInstalacion,
  };
}

export type NotificacionIntegracion = NotificacionMarketplace;
