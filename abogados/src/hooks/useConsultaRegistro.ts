import { useState, useCallback } from 'react';

export type TipoRegistro = 'nacimiento' | 'defuncion' | 'matrimonio';

export interface ResultadoRegistro {
  id: string;
  tipo: TipoRegistro;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  dni?: string;
  fechaNacimiento?: string;
  fechaDefuncion?: string;
  fechaMatrimonio?: string;
  lugar?: string;
  registro?: string;
  numeroTomo?: string;
  numeroPagina?: string;
  anno?: string;
  madre?: string;
  padre?: string;
  esposa?: string;
  esposo?: string;
  observaciones?: string;
}

export interface BusquedaRegistro {
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  dni?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface UseConsultaRegistroReturn {
  resultados: ResultadoRegistro[];
  isLoading: boolean;
  error: string | null;
  buscar: (tipo: TipoRegistro, filtros: BusquedaRegistro) => Promise<void>;
  limpiarResultados: () => void;
  getResultadoById: (id: string) => ResultadoRegistro | undefined;
  getResultadosPorTipo: (tipo: TipoRegistro) => ResultadoRegistro[];
}

const resultadosMock: ResultadoRegistro[] = [
  {
    id: 'RC-2024-001',
    tipo: 'nacimiento',
    nombre: 'MARIA',
    primerApellido: 'GARCIA',
    segundoApellido: 'LOPEZ',
    dni: '12345678A',
    fechaNacimiento: '15/03/1990',
    lugar: 'Madrid',
    registro: 'Registro Civil de Madrid',
    numeroTomo: '125',
    numeroPagina: '342',
    anno: '1990',
    madre: 'ANA LOPEZ MARTINEZ',
    padre: 'JOSE GARCIA SANCHEZ',
  },
  {
    id: 'RC-2024-002',
    tipo: 'defuncion',
    nombre: 'ANTONIO',
    primerApellido: 'FERNANDEZ',
    segundoApellido: 'RUIZ',
    dni: '87654321B',
    fechaDefuncion: '20/01/2024',
    lugar: 'Barcelona',
    registro: 'Registro Civil de Barcelona',
    numeroTomo: '89',
    numeroPagina: '156',
    anno: '2024',
  },
  {
    id: 'RC-2024-003',
    tipo: 'matrimonio',
    fechaMatrimonio: '10/06/2022',
    lugar: 'Valencia',
    registro: 'Registro Civil de Valencia',
    numeroTomo: '201',
    numeroPagina: '89',
    anno: '2022',
    esposa: 'LAURA MARTINEZ TORRES',
    esposo: 'DAVID SANCHEZ GOMEZ',
  },
];

export function useConsultaRegistro(): UseConsultaRegistroReturn {
  const [resultados, setResultados] = useState<ResultadoRegistro[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(async (tipo: TipoRegistro, filtros: BusquedaRegistro): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const filtered = resultadosMock.filter(r => {
        const matchesTipo = r.tipo === tipo;
        const matchesNombre = !filtros.nombre || 
          r.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase());
        const matchesPrimerApellido = !filtros.primerApellido || 
          r.primerApellido?.toLowerCase().includes(filtros.primerApellido.toLowerCase()) ||
          r.esposa?.toLowerCase().includes(filtros.primerApellido.toLowerCase()) ||
          r.esposo?.toLowerCase().includes(filtros.primerApellido.toLowerCase());
        const matchesSegundoApellido = !filtros.segundoApellido || 
          r.segundoApellido?.toLowerCase().includes(filtros.segundoApellido.toLowerCase());
        const matchesDni = !filtros.dni || r.dni?.toLowerCase().includes(filtros.dni.toLowerCase());

        return matchesTipo && matchesNombre && matchesPrimerApellido && matchesSegundoApellido && matchesDni;
      });

      const resultadosFiltrados = filtered.length > 0 
        ? filtered 
        : resultadosMock.filter(r => r.tipo === tipo);

      setResultados(resultadosFiltrados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar el registro');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const limpiarResultados = useCallback(() => {
    setResultados([]);
    setError(null);
  }, []);

  const getResultadoById = useCallback((id: string): ResultadoRegistro | undefined => {
    return resultados.find(r => r.id === id);
  }, [resultados]);

  const getResultadosPorTipo = useCallback((tipo: TipoRegistro): ResultadoRegistro[] => {
    return resultados.filter(r => r.tipo === tipo);
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
