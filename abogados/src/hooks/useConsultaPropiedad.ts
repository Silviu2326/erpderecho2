import { useState, useCallback } from 'react';

export type TipoPropiedad = 'urbana' | 'rustica' | 'especial';

export interface ResultadoPropiedad {
  id: string;
  tipo: TipoPropiedad;
  referenciaCatastral: string;
  direccion: string;
  municipio: string;
  provincia: string;
  codigoPostal?: string;
  superficie?: number;
  titular?: string;
  nifTitular?: string;
  porcentajeTitular?: number;
  derechosReales?: string;
  fechaInscripcion?: string;
  numeroFinca?: string;
  tomo?: string;
  libro?: string;
  folio?: string;
  asiento?: string;
  registro?: string;
  cargas?: string[];
  limitaciones?: string;
  observaciones?: string;
}

export interface BusquedaPropiedad {
  referenciaCatastral?: string;
  direccion?: string;
  municipio?: string;
  provincia?: string;
  nif?: string;
  nombrePropietario?: string;
}

export interface UseConsultaPropiedadReturn {
  resultados: ResultadoPropiedad[];
  isLoading: boolean;
  error: string | null;
  buscar: (tipo: TipoPropiedad, filtros: BusquedaPropiedad) => Promise<void>;
  limpiarResultados: () => void;
  getResultadoById: (id: string) => ResultadoPropiedad | undefined;
  getResultadosPorTipo: (tipo: TipoPropiedad) => ResultadoPropiedad[];
}

const resultadosMock: ResultadoPropiedad[] = [
  {
    id: 'RP-2024-001',
    tipo: 'urbana',
    referenciaCatastral: '1234567VG1234A0001',
    direccion: 'Calle Mayor 123, 4º B',
    municipio: 'Madrid',
    provincia: 'Madrid',
    codigoPostal: '28013',
    superficie: 120,
    titular: 'JUAN GARCÍA LÓPEZ',
    nifTitular: '12345678A',
    porcentajeTitular: 100,
    derechosReales: 'Plena propiedad',
    fechaInscripcion: '15/03/2020',
    numeroFinca: '12345',
    tomo: '2345',
    libro: '123',
    folio: '45',
    asiento: '1',
    registro: 'Registro de la Propiedad nº 1 de Madrid',
    cargas: ['Hipoteca Bancaria - Banco Santander', 'Servidumbre de paso'],
  },
  {
    id: 'RP-2024-002',
    tipo: 'rustica',
    referenciaCatastral: '9876543VN5678B0002',
    direccion: 'Camino Rural s/n',
    municipio: 'Alcalá de Henares',
    provincia: 'Madrid',
    codigoPostal: '28806',
    superficie: 5000,
    titular: 'MARÍA FERNÁNDEZ TORRES',
    nifTitular: '87654321B',
    porcentajeTitular: 50,
    derechosReales: 'Nuda propiedad',
    fechaInscripcion: '20/06/2018',
    numeroFinca: '67890',
    tomo: '1890',
    libro: '456',
    folio: '78',
    asiento: '2',
    registro: 'Registro de la Propiedad nº 3 de Alcalá de Henares',
    cargas: ['Usufructo - Antonio García Fernández'],
  },
  {
    id: 'RP-2024-003',
    tipo: 'urbana',
    referenciaCatastral: '5555555VG9999C0003',
    direccion: 'Avenida Diagonal 456, bajos',
    municipio: 'Barcelona',
    provincia: 'Barcelona',
    codigoPostal: '08008',
    superficie: 250,
    titular: 'PROMOCIONES INMOBILIARIAS SA',
    nifTitular: 'A12345678',
    porcentajeTitular: 100,
    derechosReales: 'Plena propiedad',
    fechaInscripcion: '10/01/2022',
    numeroFinca: '54321',
    tomo: '5678',
    libro: '234',
    folio: '90',
    asiento: '3',
    registro: 'Registro de la Propiedad nº 2 de Barcelona',
    cargas: [],
    limitaciones: 'Régimen de propiedad horizontal',
  },
];

export function useConsultaPropiedad() {
  const [resultados, setResultados] = useState<ResultadoPropiedad[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(async (tipo: TipoPropiedad, filtros: BusquedaPropiedad): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const filtered = resultadosMock.filter((p: ResultadoPropiedad) => {
        const matchesTipo = p.tipo === tipo;
        const matchesRef = !filtros.referenciaCatastral || 
          p.referenciaCatastral.toLowerCase().includes(filtros.referenciaCatastral.toLowerCase());
        const matchesDireccion = !filtros.direccion || 
          p.direccion.toLowerCase().includes(filtros.direccion.toLowerCase());
        const matchesMunicipio = !filtros.municipio || 
          p.municipio.toLowerCase().includes(filtros.municipio.toLowerCase());
        const matchesProvincia = !filtros.provincia || 
          p.provincia.toLowerCase().includes(filtros.provincia.toLowerCase());
        const matchesNif = !filtros.nif || 
          p.nifTitular?.toLowerCase().includes(filtros.nif.toLowerCase());
        const matchesNombre = !filtros.nombrePropietario || 
          p.titular?.toLowerCase().includes(filtros.nombrePropietario.toLowerCase());

        return matchesTipo && matchesRef && matchesDireccion && 
               matchesMunicipio && matchesProvincia && matchesNif && matchesNombre;
      });

      const resultadosFiltrados = filtered.length > 0 
        ? filtered 
        : resultadosMock.filter((p: ResultadoPropiedad) => p.tipo === tipo);

      setResultados(resultadosFiltrados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar el registro de la propiedad');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const limpiarResultados = useCallback(() => {
    setResultados([]);
    setError(null);
  }, []);

  const getResultadoById = useCallback((id: string): ResultadoPropiedad | undefined => {
    return resultados.find((p: ResultadoPropiedad) => p.id === id);
  }, [resultados]);

  const getResultadosPorTipo = useCallback((tipo: TipoPropiedad): ResultadoPropiedad[] => {
    return resultados.filter((p: ResultadoPropiedad) => p.tipo === tipo);
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
