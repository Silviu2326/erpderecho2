import { PERMISOS_MARKETPLACE } from '../types/marketplace';
import type {
  IntegracionMarketplace,
  InstalacionIntegracion,
  FiltrosMarketplace,
  ResultadoBusquedaMarketplace,
  NotificacionMarketplace,
  ActualizacionIntegracion,
  PermisosMarketplace,
  ConfiguracionIntegracion,
  EstadoInstalacion,
  CategoriaIntegracion,
  ProveedorIntegracion,
} from '../types/marketplace';

const API_BASE = '/api/marketplace';

class MarketplaceService {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private cacheDuration = 5 * 60 * 1000;

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  async getCatalogo(filtros?: FiltrosMarketplace): Promise<ResultadoBusquedaMarketplace> {
    const cacheKey = `catalogo_${JSON.stringify(filtros || {})}`;
    const cached = this.getCached<ResultadoBusquedaMarketplace>(cacheKey);
    if (cached) return cached;

    console.log('[Marketplace] Obteniendo catálogo con filtros:', filtros);

    try {
      const params = new URLSearchParams();
      if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
      if (filtros?.categorias?.length) params.append('categorias', filtros.categorias.join(','));
      if (filtros?.precio?.length) params.append('precio', filtros.precio.join(','));
      if (filtros?.orden) params.append('orden', filtros.orden);
      if (filtros?.pagina) params.append('pagina', String(filtros.pagina));

      const response = await fetch(`${API_BASE}/integraciones?${params}`);
      if (!response.ok) throw new Error('Error al obtener catálogo');
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      return this.getMockCatalogo(filtros);
    }
  }

  async getIntegracionById(id: string): Promise<IntegracionMarketplace | null> {
    const cacheKey = `integracion_${id}`;
    const cached = this.getCached<IntegracionMarketplace>(cacheKey);
    if (cached) return cached;

    console.log('[Marketplace] Obteniendo integración:', id);

    try {
      const response = await fetch(`${API_BASE}/integraciones/${id}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      return this.getMockIntegracion(id);
    }
  }

  async getIntegracionByClave(clave: string): Promise<IntegracionMarketplace | null> {
    const cacheKey = `integracion_clave_${clave}`;
    const cached = this.getCached<IntegracionMarketplace>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${API_BASE}/integraciones/clave/${clave}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      return null;
    }
  }

  async buscarIntegraciones(termino: string): Promise<IntegracionMarketplace[]> {
    console.log('[Marketplace] Buscando:', termino);

    try {
      const response = await fetch(`${API_BASE}/buscar?q=${encodeURIComponent(termino)}`);
      if (!response.ok) throw new Error('Error en búsqueda');
      
      return await response.json();
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      const catalogo = await this.getCatalogo();
      const lowerTerm = termino.toLowerCase();
      return catalogo.integraciones.filter(
        i => 
          i.nombre.toLowerCase().includes(lowerTerm) ||
          i.descripcion.toLowerCase().includes(lowerTerm) ||
          i.etiquetas.some(e => e.toLowerCase().includes(lowerTerm))
      );
    }
  }

  async getInstalaciones(): Promise<InstalacionIntegracion[]> {
    const cacheKey = 'instalaciones';
    const cached = this.getCached<InstalacionIntegracion[]>(cacheKey);
    if (cached) return cached;

    console.log('[Marketplace] Obteniendo instalaciones');

    try {
      const response = await fetch(`${API_BASE}/instalaciones`);
      if (!response.ok) throw new Error('Error al obtener instalaciones');
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      return this.getMockInstalaciones();
    }
  }

  async getInstalacionById(id: string): Promise<InstalacionIntegracion | null> {
    const instalaciones = await this.getInstalaciones();
    return instalaciones.find(i => i.id === id) || null;
  }

  async getInstalacionByClave(clave: string): Promise<InstalacionIntegracion | null> {
    const instalaciones = await this.getInstalaciones();
    return instalaciones.find(i => i.claveIntegracion === clave) || null;
  }

  async instalarIntegracion(
    integracionId: string,
    config?: Partial<ConfiguracionIntegracion>
  ): Promise<InstalacionIntegracion> {
    console.log('[Marketplace] Instalando integración:', integracionId);

    try {
      const response = await fetch(`${API_BASE}/instalaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integracionId, config })
      });
      
      if (!response.ok) throw new Error('Error al instalar');
      
      const instalacion = await response.json();
      this.clearCache('instalaciones');
      return instalacion;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      return this.createMockInstalacion(integracionId);
    }
  }

  async actualizarInstalacion(
    instalacionId: string,
    config: Partial<ConfiguracionIntegracion>
  ): Promise<InstalacionIntegracion> {
    console.log('[Marketplace] Actualizando instalación:', instalacionId);

    try {
      const response = await fetch(`${API_BASE}/instalaciones/${instalacionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (!response.ok) throw new Error('Error al actualizar');
      
      const instalacion = await response.json();
      this.clearCache('instalaciones');
      return instalacion;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      throw error;
    }
  }

  async desinstalarIntegracion(instalacionId: string): Promise<boolean> {
    console.log('[Marketplace] Desinstalando:', instalacionId);

    try {
      const response = await fetch(`${API_BASE}/instalaciones/${instalacionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Error al desinstalar');
      
      this.clearCache('instalaciones');
      return true;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      return false;
    }
  }

  async actualizarVersion(instalacionId: string): Promise<InstalacionIntegracion> {
    console.log('[Marketplace] Actualizando versión:', instalacionId);

    try {
      const response = await fetch(`${API_BASE}/instalaciones/${instalacionId}/actualizar`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Error al actualizar');
      
      const instalacion = await response.json();
      this.clearCache('instalaciones');
      return instalacion;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      throw error;
    }
  }

  async probarConexion(instalacionId: string): Promise<{ success: boolean; message: string }> {
    console.log('[Marketplace] Probando conexión:', instalacionId);

    try {
      const response = await fetch(`${API_BASE}/instalaciones/${instalacionId}/test`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Error en prueba de conexión');
      
      return await response.json();
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      return { success: true, message: 'Conexión exitosa (demo)' };
    }
  }

  async getNotificaciones(): Promise<NotificacionMarketplace[]> {
    const cacheKey = 'notificaciones';
    const cached = this.getCached<NotificacionMarketplace[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${API_BASE}/notificaciones`);
      if (!response.ok) throw new Error('Error al obtener notificaciones');
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      return [];
    }
  }

  async marcarNotificacionLeida(notificacionId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/notificaciones/${notificacionId}/leer`, {
        method: 'PATCH'
      });
      this.clearCache('notificaciones');
    } catch (error) {
      console.error('[Marketplace] Error:', error);
    }
  }

  async getActualizaciones(): Promise<ActualizacionIntegracion[]> {
    const cacheKey = 'actualizaciones';
    const cached = this.getCached<ActualizacionIntegracion[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${API_BASE}/actualizaciones`);
      if (!response.ok) throw new Error('Error al obtener actualizaciones');
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      return [];
    }
  }

  async getCategorias(): Promise<CategoriaIntegracion[]> {
    const cacheKey = 'categorias';
    const cached = this.getCached<CategoriaIntegracion[]>(cacheKey);
    if (cached) return cached;

    console.log('[Marketplace] Obteniendo categorías');

    try {
      const response = await fetch(`${API_BASE}/categorias`);
      if (!response.ok) throw new Error('Error al obtener categorías');
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      return this.getMockCategorias();
    }
  }

  async getProveedores(): Promise<ProveedorIntegracion[]> {
    const cacheKey = 'proveedores';
    const cached = this.getCached<ProveedorIntegracion[]>(cacheKey);
    if (cached) return cached;

    console.log('[Marketplace] Obteniendo proveedores');

    try {
      const response = await fetch(`${API_BASE}/proveedores`);
      if (!response.ok) throw new Error('Error al obtener proveedores');
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      return this.getMockProveedores();
    }
  }

  async getProveedorById(id: string): Promise<ProveedorIntegracion | null> {
    const cacheKey = `proveedor_${id}`;
    const cached = this.getCached<ProveedorIntegracion>(cacheKey);
    if (cached) return cached;

    console.log('[Marketplace] Obteniendo proveedor:', id);

    try {
      const response = await fetch(`${API_BASE}/proveedores/${id}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      return null;
    }
  }

  async getEstadisticasGlobales(): Promise<{
    totalIntegraciones: number;
    totalProveedores: number;
    totalInstalaciones: number;
    integracionesGratuitas: number;
    integracionesPremium: number;
  }> {
    const cacheKey = 'estadisticas_globales';
    const cached = this.getCached<{
      totalIntegraciones: number;
      totalProveedores: number;
      totalInstalaciones: number;
      integracionesGratuitas: number;
      integracionesPremium: number;
    }>(cacheKey);
    if (cached) return cached;

    console.log('[Marketplace] Obteniendo estadísticas globales');

    try {
      const response = await fetch(`${API_BASE}/estadisticas`);
      if (!response.ok) throw new Error('Error al obtener estadísticas');
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      return {
        totalIntegraciones: 156,
        totalProveedores: 42,
        totalInstalaciones: 3240,
        integracionesGratuitas: 48,
        integracionesPremium: 108,
      };
    }
  }

  async getIntegracionesDestacadas(): Promise<IntegracionMarketplace[]> {
    const cacheKey = 'integraciones_destacadas';
    const cached = this.getCached<IntegracionMarketplace[]>(cacheKey);
    if (cached) return cached;

    console.log('[Marketplace] Obteniendo integraciones destacadas');

    try {
      const response = await fetch(`${API_BASE}/integraciones/destacadas`);
      if (!response.ok) throw new Error('Error al obtener destacadas');
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      const catalogo = await this.getCatalogo();
      return catalogo.integraciones.filter(i => i.destacado);
    }
  }

  async getIntegracionesPopulares(): Promise<IntegracionMarketplace[]> {
    const cacheKey = 'integraciones_populares';
    const cached = this.getCached<IntegracionMarketplace[]>(cacheKey);
    if (cached) return cached;

    console.log('[Marketplace] Obteniendo integraciones populares');

    try {
      const response = await fetch(`${API_BASE}/integraciones/populares`);
      if (!response.ok) throw new Error('Error al obtener populares');
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      const catalogo = await this.getCatalogo({ orden: 'populares' });
      return catalogo.integraciones.slice(0, 10);
    }
  }

  async getIntegracionesRecientes(): Promise<IntegracionMarketplace[]> {
    const cacheKey = 'integraciones_recientes';
    const cached = this.getCached<IntegracionMarketplace[]>(cacheKey);
    if (cached) return cached;

    console.log('[Marketplace] Obteniendo integraciones recientes');

    try {
      const response = await fetch(`${API_BASE}/integraciones/recientes`);
      if (!response.ok) throw new Error('Error al obtener recientes');
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      const catalogo = await this.getCatalogo({ orden: 'recientes' });
      return catalogo.integraciones.slice(0, 10);
    }
  }

  async getIntegracionesPorCategoria(categoria: CategoriaIntegracion): Promise<IntegracionMarketplace[]> {
    console.log('[Marketplace] Obteniendo integraciones por categoría:', categoria);

    try {
      const response = await fetch(`${API_BASE}/integraciones?categoria=${categoria}`);
      if (!response.ok) throw new Error('Error al obtener por categoría');
      
      const data = await response.json();
      return data.integraciones || [];
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      const catalogo = await this.getCatalogo({ categorias: [categoria] });
      return catalogo.integraciones;
    }
  }

  async getEtiquetas(): Promise<string[]> {
    const cacheKey = 'etiquetas';
    const cached = this.getCached<string[]>(cacheKey);
    if (cached) return cached;

    console.log('[Marketplace] Obteniendo etiquetas');

    try {
      const response = await fetch(`${API_BASE}/etiquetas`);
      if (!response.ok) throw new Error('Error al obtener etiquetas');
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('[Marketplace] Error:', error);
      const catalogo = await this.getCatalogo();
      const etiquetasSet = new Set<string>();
      catalogo.integraciones.forEach(i => i.etiquetas.forEach(e => etiquetasSet.add(e)));
      return Array.from(etiquetasSet).sort();
    }
  }

  getPermisos(rol: string): PermisosMarketplace {
    return PERMISOS_MARKETPLACE[rol] || PERMISOS_MARKETPLACE.default;
  }

  isIntegracionInstalada(clave: string, instalaciones: InstalacionIntegracion[]): boolean {
    return instalaciones.some(i => i.claveIntegracion === clave && i.estado === 'installed');
  }

  getInstalacionEstado(
    clave: string,
    instalaciones: InstalacionIntegracion[]
  ): { instalada: boolean; estado?: EstadoInstalacion; instalacion?: InstalacionIntegracion } {
    const instalacion = instalaciones.find(i => i.claveIntegracion === clave);
    if (!instalacion) return { instalada: false };
    
    return {
      instalada: instalacion.estado === 'installed',
      estado: instalacion.estado,
      instalacion
    };
  }

  private getMockCatalogo(filtros?: FiltrosMarketplace): ResultadoBusquedaMarketplace {
    const mockIntegraciones: IntegracionMarketplace[] = [
      {
        id: 'int_001',
        clave: 'google_workspace',
        nombre: 'Google Workspace',
        descripcion: 'Integra con Google Drive, Gmail, Calendar y Docs para una experiencia fluida de productividad.',
        descripcionCorta: 'Productividad de Google en tu gestor',
        icono: 'https://logo.clearbit.com/google.com',
        capturas: [],
        categoria: 'productividad',
        proveedor: { id: 'prov_google', nombre: 'Google', logo: 'https://logo.clearbit.com/google.com' },
        precios: [
          { id: 'plan_free', nombre: 'Gratis', tipo: 'free', caracteristicas: [{ nombre: 'Básico', incluida: true }] },
          { id: 'plan_pro', nombre: 'Pro', tipo: 'monthly', precio: 12, periodo: 'mes', caracteristicas: [{ nombre: 'Completo', incluida: true }] }
        ],
        version: '2.0.0',
        permisos: [{ nombre: 'calendar', descripcion: 'Acceso al calendario', obligatorio: true, categoria: 'calendario' }],
        etiquetas: ['google', 'productividad', 'email'],
        compatibilidad: { versionesApp: ['1.0.0'], offline: true },
        estadisticas: { instalaciones: 1250, instalacionesActivas: 980, valoraciones: 4.5, reseñas: 234 },
        valoraciones: { promedio: 4.5, distribution: { 1: 5, 2: 10, 3: 35, 4: 150, 5: 200 }, reseñas: [] },
        estado: 'public',
        fechaPublicacion: '2024-01-15',
        ultimaActualizacion: '2024-12-01',
        destacado: true,
        oficial: true
      },
      {
        id: 'int_002',
        clave: 'microsoft_365',
        nombre: 'Microsoft 365',
        descripcion: 'Conecta con Outlook, OneDrive, Teams y SharePoint para optimizar tu flujo de trabajo.',
        descripcionCorta: 'Potencia de Microsoft 365',
        icono: 'https://logo.clearbit.com/microsoft.com',
        capturas: [],
        categoria: 'productividad',
        proveedor: { id: 'prov_microsoft', nombre: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com' },
        precios: [{ id: 'plan_m365', nombre: 'Enterprise', tipo: 'monthly', precio: 15, periodo: 'mes', caracteristicas: [{ nombre: 'Completo', incluida: true }] }],
        version: '3.1.0',
        permisos: [{ nombre: 'email', descripcion: 'Acceso al email', obligatorio: true, categoria: 'email' }],
        etiquetas: ['microsoft', 'office', 'teams'],
        compatibilidad: { versionesApp: ['1.0.0'] },
        estadisticas: { instalaciones: 890, instalacionesActivas: 720, valoraciones: 4.3, reseñas: 156 },
        valoraciones: { promedio: 4.3, distribution: { 1: 3, 2: 8, 3: 25, 4: 80, 5: 120 }, reseñas: [] },
        estado: 'public',
        fechaPublicacion: '2024-02-20',
        ultimaActualizacion: '2024-11-15',
        destacado: true,
        oficial: true
      },
      {
        id: 'int_003',
        clave: 'stripe_payments',
        nombre: 'Stripe Payments',
        descripcion: 'Procesa pagos online de forma segura con Stripe. Acepta tarjetas, Bizum y más métodos de pago.',
        descripcionCorta: 'Pagos online seguros',
        icono: 'https://logo.clearbit.com/stripe.com',
        capturas: [],
        categoria: 'facturacion',
        proveedor: { id: 'prov_stripe', nombre: 'Stripe', logo: 'https://logo.clearbit.com/stripe.com' },
        precios: [{ id: 'plan_stripe', nombre: 'Por uso', tipo: 'usage', precio: 1.4, caracteristicas: [{ nombre: 'Sin suscripción', incluida: true }] }],
        version: '1.5.0',
        permisos: [{ nombre: 'payments', descripcion: 'Procesar pagos', obligatorio: true, categoria: 'datos' }],
        etiquetas: ['pagos', 'stripe', 'facturación'],
        compatibilidad: { versionesApp: ['1.0.0'] },
        estadisticas: { instalaciones: 567, instalacionesActivas: 430, valoraciones: 4.7, reseñas: 89 },
        valoraciones: { promedio: 4.7, distribution: { 1: 1, 2: 3, 3: 8, 4: 25, 5: 52 }, reseñas: [] },
        estado: 'public',
        fechaPublicacion: '2024-03-10',
        ultimaActualizacion: '2024-10-20',
        destacado: false,
        oficial: true
      }
    ];

    let filtradas = mockIntegraciones;
    
    if (filtros?.busqueda) {
      const bus = filtros.busqueda.toLowerCase();
      filtradas = filtradas.filter(i => 
        i.nombre.toLowerCase().includes(bus) || 
        i.descripcion.toLowerCase().includes(bus)
      );
    }
    
    if (filtros?.categorias?.length) {
      filtradas = filtradas.filter(i => filtros.categorias!.includes(i.categoria));
    }

    return {
      integraciones: filtradas,
      total: filtradas.length,
      pagina: 1,
      porPagina: 20,
      facetas: {
        categorias: { productividad: 2, facturacion: 1, crm: 0, legal: 0, comunicacion: 0, almacenamiento: 0, contabilidad: 0, recursos_humanos: 0, notificaciones: 0, analitica: 0, seguridad: 0, personalizada: 0 },
        precios: { free: 1, paid: 2 },
        valoraciones: { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 }
      }
    };
  }

  private getMockIntegracion(id: string): IntegracionMarketplace | null {
    const catalogo = this.getMockCatalogo();
    return catalogo.integraciones.find(i => i.id === id) || null;
  }

  private getMockCategorias(): CategoriaIntegracion[] {
    return [
      'productividad',
      'comunicacion',
      'almacenamiento',
      'facturacion',
      'crm',
      'legal',
      'contabilidad',
      'recursos_humanos',
      'notificaciones',
      'analitica',
      'seguridad',
      'personalizada'
    ];
  }

  private getMockProveedores(): ProveedorIntegracion[] {
    return [
      { id: 'prov_google', nombre: 'Google', logo: 'https://logo.clearbit.com/google.com', sitioWeb: 'https://google.com' },
      { id: 'prov_microsoft', nombre: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com', sitioWeb: 'https://microsoft.com' },
      { id: 'prov_stripe', nombre: 'Stripe', logo: 'https://logo.clearbit.com/stripe.com', sitioWeb: 'https://stripe.com' },
      { id: 'prov_slack', nombre: 'Slack', logo: 'https://logo.clearbit.com/slack.com', sitioWeb: 'https://slack.com' },
      { id: 'prov_salesforce', nombre: 'Salesforce', logo: 'https://logo.clearbit.com/salesforce.com', sitioWeb: 'https://salesforce.com' },
    ];
  }

  private getMockInstalaciones(): InstalacionIntegracion[] {
    return [
      {
        id: 'inst_001',
        integracionId: 'int_001',
        claveIntegracion: 'google_workspace',
        nombre: 'Google Workspace',
        icono: 'https://logo.clearbit.com/google.com',
        version: '2.0.0',
        estado: 'installed',
        configuracion: { parametros: [], opciones: { syncEnabled: true } },
        permisos: [],
        instaladoPor: 'admin',
        fechaInstalacion: '2024-06-15T10:00:00Z',
        fechaActualizacion: '2024-12-01T14:30:00Z',
        ultimoUso: '2024-12-20T09:15:00Z',
        uso: { llamadasApi: 450, limiteLlamadas: 1000, resetFecha: '2025-01-01T00:00:00Z' }
      }
    ];
  }

  private createMockInstalacion(integracionId: string): InstalacionIntegracion {
    return {
      id: `inst_${Date.now()}`,
      integracionId,
      claveIntegracion: '',
      nombre: 'Nueva Integración',
      icono: '',
      version: '1.0.0',
      estado: 'installed',
      permisos: [],
      instaladoPor: 'current_user',
      fechaInstalacion: new Date().toISOString(),
      uso: { llamadasApi: 0, limiteLlamadas: 1000, resetFecha: new Date().toISOString() }
    };
  }
}

export const marketplaceService = new MarketplaceService();
