import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { EstadoGasto, TipoGasto } from '@prisma/client';

export enum EstadoGastoEnum {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  PAGADO = 'PAGADO',
  CONTABILIZADO = 'CONTABILIZADO',
}

export enum TipoGastoEnum {
  OPERATIVO = 'OPERATIVO',
  PROFESIONAL = 'PROFESIONAL',
  ADMINISTRATIVO = 'ADMINISTRATIVO',
  REEMBOLSABLE = 'REEMBOLSABLE',
  CASO = 'CASO',
}

export class CreateGastoDto {
  @IsString()
  concepto!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  importe!: number;

  @IsOptional()
  @IsNumber()
  importeIVA?: number;

  @IsOptional()
  @IsEnum(TipoGastoEnum)
  tipo?: TipoGastoEnum;

  @IsDateString()
  fechaGasto!: string;

  @IsOptional()
  @IsDateString()
  fechaPago?: string;

  @IsOptional()
  @IsString()
  comprobanteUrl?: string;

  @IsOptional()
  @IsString()
  numeroFactura?: string;

  @IsOptional()
  @IsBoolean()
  reembolsable?: boolean;

  @IsOptional()
  @IsString()
  proveedorId?: string;

  @IsOptional()
  @IsString()
  expedienteId?: string;
}

export class UpdateGastoDto {
  @IsOptional()
  @IsString()
  concepto?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  importe?: number;

  @IsOptional()
  @IsNumber()
  importeIVA?: number;

  @IsOptional()
  @IsEnum(TipoGastoEnum)
  tipo?: TipoGastoEnum;

  @IsOptional()
  @IsEnum(EstadoGastoEnum)
  estado?: EstadoGastoEnum;

  @IsOptional()
  @IsDateString()
  fechaGasto?: string;

  @IsOptional()
  @IsDateString()
  fechaPago?: string;

  @IsOptional()
  @IsString()
  comprobanteUrl?: string;

  @IsOptional()
  @IsString()
  numeroFactura?: string;

  @IsOptional()
  @IsBoolean()
  reembolsable?: boolean;

  @IsOptional()
  @IsString()
  proveedorId?: string;

  @IsOptional()
  @IsString()
  expedienteId?: string;
}

export class QueryGastoDto {
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sort?: string = 'createdAt';

  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(EstadoGastoEnum)
  estado?: EstadoGastoEnum;

  @IsOptional()
  @IsEnum(TipoGastoEnum)
  tipo?: TipoGastoEnum;

  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @IsString()
  proveedorId?: string;

  @IsOptional()
  @IsString()
  expedienteId?: string;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}

export class CreateProveedorDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  cif?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  provincia?: string;

  @IsOptional()
  @IsString()
  codigoPostal?: string;

  @IsOptional()
  @IsString()
  pais?: string;

  @IsOptional()
  @IsString()
  contactoNombre?: string;

  @IsOptional()
  @IsString()
  contactoEmail?: string;

  @IsOptional()
  @IsString()
  contactoTelefono?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class UpdateProveedorDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  cif?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  provincia?: string;

  @IsOptional()
  @IsString()
  codigoPostal?: string;

  @IsOptional()
  @IsString()
  pais?: string;

  @IsOptional()
  @IsString()
  contactoNombre?: string;

  @IsOptional()
  @IsString()
  contactoEmail?: string;

  @IsOptional()
  @IsString()
  contactoTelefono?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class QueryProveedorDto {
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
