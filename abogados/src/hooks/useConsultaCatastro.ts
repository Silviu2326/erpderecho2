import { useState, useCallback } from 'react';

export type TipoCatastro = 'urbana' | 'rustica' | 'especial' | 'bienes_inmuebles';

export interface ResultadoCatastro {
  id: string;
  tipo: TipoCatastro;
  referenciaCatastral: string;
  direccion: string;
  municipio: string;
  provincia: string;
  codigoPostal?: string;
  superficie?: number;
  superficieConstruida?: number;
  añoConstruccion?: number;
  uso?: string;
  clase?: string;
  titular?: string;
  nifTitular?: string;
  porcentajeTitular?: number;
  valorCatastral?: number;
  valorSuelo?: number;
  valorConstruccion?: number;
  fechaEffectividad?: string;
  fechaAlta?: string;
  numeroFinca?: string;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
  detalles?: {
    plantas?: number;
    bedrooms?: number;
    baños?: number;
    Garage?: boolean;
    trastero?: boolean;
    piscina?: boolean;
    ascensor?: boolean;
  };
  imagen?: string;
  observaciones?: string;
}

export interface BusquedaCatastro {
  referenciaCatastral?: string;
  direccion?: string;
  municipio?: string;
  provincia?: string;
  nif?: string;
  nombrePropietario?: string;
}

export interface UseConsultaCatastroReturn {
  resultados: ResultadoCatastro[];
  isLoading: boolean;
  error: string | null;
  buscar: (tipo: TipoCatastro, filtros: BusquedaCatastro) => Promise<void>;
  limpiarResultados: () => void;
  getResultadoById: (id: string) => ResultadoCatastro | undefined;
  getResultadosPorTipo: (tipo: TipoCatastro) => ResultadoCatastro[];
}

const resultadosMock: ResultadoCatastro[] = [
  {
    id: 'CAT-2024-001',
    tipo: 'urbana',
    referenciaCatastral: '1234567VG1234A0001',
    direccion: 'Calle Mayor 123, 4º B',
    municipio: 'Madrid',
    provincia: 'Madrid',
    codigoPostal: '28013',
    superficie: 120,
    superficieConstruida: 135,
    añoConstruccion: 1995,
    uso: 'Residencial',
    clase: 'Urbana',
    titular: 'JUAN GARCÍA LÓPEZ',
    nifTitular: '12345678A',
    porcentajeTitular: 100,
    valorCatastral: 150000,
    valorSuelo: 60000,
    valorConstruccion: 90000,
    fechaEffectividad: '01/01/2024',
    fechaAlta: '15/03/1995',
    numeroFinca: '12345',
    coordenadas: {
      latitud: 40.416775,
      longitud: -3.703790,
    },
    detalles: {
      plantas: 4,
      bedrooms: 3,
      baños: 2,
      Garage: true,
      trastero: true,
      ascensor: true,
    },
  },
  {
    id: 'CAT-2024-002',
    tipo: 'rustica',
    referenciaCatastral: '9876543VN5678B0002',
    direccion: 'Camino Rural s/n',
    municipio: 'Alcalá de Henares',
    provincia: 'Madrid',
    codigoPostal: '28806',
    superficie: 5000,
    uso: 'Agrario',
    clase: 'Rústica',
    titular: 'MARÍA FERNÁNDEZ TORRES',
    nifTitular: '87654321B',
    porcentajeTitular: 50,
    valorCatastral: 45000,
    valorSuelo: 40000,
    valorConstruccion: 5000,
    fechaEffectividad: '01/01/2024',
    fechaAlta: '20/06/1980',
    numeroFinca: '67890',
    coordenadas: {
      latitud: 40.482060,
      longitud: -3.361760,
    },
    detalles: {
      plantas: 1,
    },
  },
  {
    id: 'CAT-2024-003',
    tipo: 'urbana',
    referenciaCatastral: '5555555VG9999C0003',
    direccion: 'Avenida Diagonal 456, bajos',
    municipio: 'Barcelona',
    provincia: 'Barcelona',
    codigoPostal: '08008',
    superficie: 250,
    superficieConstruida: 280,
    añoConstruccion: 2010,
    uso: 'Comercial',
    clase: 'Urbana',
    titular: 'PROMOCIONES INMOBILIARIAS SA',
    nifTitular: 'A12345678',
    porcentajeTitular: 100,
    valorCatastral: 450000,
    valorSuelo: 250000,
    valorConstruccion: 200000,
    fechaEffectividad: '01/01/2024',
    fechaAlta: '10/01/2010',
    numeroFinca: '54321',
    coordenadas: {
      latitud: 41.387917,
      longitud: 2.169919,
    },
    detalles: {
      plantas: 2,
      bedrooms: 1,
      baños: 1,
      Garage: true,
    },
  },
  {
    id: 'CAT-2024-004',
    tipo: 'bienes_inmuebles',
    referenciaCatastral: '7777777VG4444D0004',
    direccion: 'Plaza España 1, local',
    municipio: 'Valencia',
    provincia: 'Valencia',
    codigoPostal: '46001',
    superficie: 80,
    uso: 'Comercial',
    clase: 'Urbana',
    titular: 'DISTRIBUCIONES COMERCIALES SL',
    nifTitular: 'B98765432',
    porcentajeTitular: 100,
    valorCatastral: 95000,
    valorSuelo: 40000,
    valorConstruccion: 55000,
    fechaEffectividad: '01/01/2024',
    fechaAlta: '05/05/2005',
    coordenadas: {
      latitud: 39.469907,
      longitud: -0.376288,
    },
  },
];

export function useConsultaCatastro() {
  const [resultados, setResultados] = useState<ResultadoCatastro[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(async (tipo: TipoCatastro, filtros: BusquedaCatastro): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const filtered = resultadosMock.filter((c: ResultadoCatastro) => {
        const matchesTipo = c.tipo === tipo;
        const matchesRef = !filtros.referenciaCatastral || 
          c.referenciaCatastral.toLowerCase().includes(filtros.referenciaCatastral.toLowerCase());
        const matchesDireccion = !filtros.direccion || 
          c.direccion.toLowerCase().includes(filtros.direccion.toLowerCase());
        const matchesMunicipio = !filtros.municipio || 
          c.municipio.toLowerCase().includes(filtros.municipio.toLowerCase());
        const matchesProvincia = !filtros.provincia || 
          c.provincia.toLowerCase().includes(filtros.provincia.toLowerCase());
        const matchesNif = !filtros.nif || 
          c.nifTitular?.toLowerCase().includes(filtros.nif.toLowerCase());
        const matchesNombre = !filtros.nombrePropietario || 
          c.titular?.toLowerCase().includes(filtros.nombrePropietario.toLowerCase());

        return matchesTipo && matchesRef && matchesDireccion && 
               matchesMunicipio && matchesProvincia && matchesNif && matchesNombre;
      });

      const resultadosFiltrados = filtered.length > 0 
        ? filtered 
        : resultadosMock.filter((c: ResultadoCatastro) => c.tipo === tipo);

      setResultados(resultadosFiltrados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar el catastro');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const limpiarResultados = useCallback(() => {
    setResultados([]);
    setError(null);
  }, []);

  const getResultadoById = useCallback((id: string): ResultadoCatastro | undefined => {
    return resultados.find((c: ResultadoCatastro) => c.id === id);
  }, [resultados]);

  const getResultadosPorTipo = useCallback((tipo: TipoCatastro): ResultadoCatastro[] => {
    return resultados.filter((c: ResultadoCatastro) => c.tipo === tipo);
  }, [resultados]);

  return {
    resultados,
    isLoading,
    error,
    buscar,
    limpiarResultados,
    getResultadoById,
    getResultadosPorTipo,
  };
}
