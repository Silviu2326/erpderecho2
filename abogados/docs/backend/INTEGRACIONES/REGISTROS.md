# Integración Registros Públicos

## Registros Disponibles

### 1. Registro Civil
### 2. Catastro
### 3. Registro de la Propiedad

---

## Registro Civil

### Servicios

| Método | Descripción |
|--------|-------------|
| Consulta Nacimientos | Buscar por DNI/NIE |
| Consulta Defunciones | Buscar por datos personales |
| Consulta Matrimonios | Buscar matrimonio |

### Implementación

```typescript
// services/registros/registro-civil.service.ts
interface RegistroCivilService {
  buscarNacimiento(params: BusquedaNacimiento): Promise<Nacimiento>
  buscarDefuncion(params: BusquedaDefuncion): Promise<Defuncion>
  buscarMatrimonio(params: BusquedaMatrimonio): Promise<Matrimonio>
}

interface BusquedaNacimiento {
  nif: string
  nombre?: string
  apellido1?: string
  apellido2?: string
  fechaNacimiento?: Date
}
```

### Notas
- Requiere certificado digital para acceso completo
- Alternativa: Servicio web público limitado

---

## Catastro

### Endpoint
```
https://www.sedecatastro.gob.es/
```

### Servicios

| Método | Descripción |
|--------|-------------|
| ConsultaRCISimple | Referencia catastral |
| ConsultaDatosCatastrales | Datos completos |
| ConsultaProvincia | Listado municipios |

### Implementación

```typescript
// services/registros/catastro.service.ts
interface CatastroService {
  consultaPorReferencia(refCatastral: string): Promise<DatosCatastrales>
  consultaPorDNI(dni: string): Promise<Referencia[]>
  consultaMunicipio(codINE: string): Promise<DatosMunicipio>
}

interface DatosCatastrales {
  referenciaCatastral: string
  direccion: {
    tipoVia: string
    nombreVia: string
    numero: string
    bloque?: string
    escalera?: string
    planta?: string
    puerta?: string
    codigoPostal: string
    municipio: string
    provincia: string
  }
  superficie: number
  uso: string
  clase: string
  valorCatastral: number
  annoBaseImponible: number
}
```

---

## Registro de la Propiedad

### Servicios

| Método | Descripción |
|--------|-------------|
| ConsultaFinca | Datos de una finca |
| ConsultaNotas | Notas simples |

### Implementación

```typescript
// services/registros/registro-propiedad.service.ts
interface RegistroPropiedadService {
  consultaFinca(params: ConsultaFincaParams): Promise<Finca>
  consultaNotasSimples(params: NotaSimpleParams): Promise<NotaSimple>
}

interface ConsultaFincaParams {
  numeroRegistro: number
  numeroFinca: number
  letra?: string
  anno: number
  provincia: string
}

interface Finca {
  numeroRegistro: number
  numeroFinca: number
  letra?: string
  direccion: string
  naturaleza: string
  superficie: number
  titularidades: Titularidad[]
  cargas: Carga[]
  limitaciones: Limitacion[]
}
```

---

## Errores Comunes

| Código | Descripción |
|--------|-------------|
| CERTIFICATE_REQUIRED | Requiere certificado digital |
| NOT_FOUND | No encontrado |
| SERVICE_UNAVAILABLE | Servicio no disponible |
| TIMEOUT | Timeout de conexión |

---

## Rate Limits

- Registro Civil: 100 req/hora
- Catastro: 50 req/minuto
- Registro Propiedad: Variado por oficina
