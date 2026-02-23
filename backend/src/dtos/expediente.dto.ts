import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoExpedienteEnum {
  CIVIL = 'CIVIL',
  PENAL = 'PENAL',
  LABORAL = 'LABORAL',
  CONTENCIOSO = 'CONTENCIOSO',
  MERCANTIL = 'MERCANTIL',
  FAMILIA = 'FAMILIA',
  ADMINISTRATIVO = 'ADMINISTRATIVO',
}

export enum EstadoExpedienteEnum {
  ACTIVO = 'ACTIVO',
  CERRADO = 'CERRADO',
  ARCHIVADO = 'ARCHIVADO',
  SUSPENDIDO = 'SUSPENDIDO',
}

export class CreateExpedienteDto {
  @IsString()
  @IsNotEmpty()
  numeroExpediente!: string;

  @IsEnum(TipoExpedienteEnum)
  @IsNotEmpty()
  tipo!: TipoExpedienteEnum;

  @IsEnum(EstadoExpedienteEnum)
  @IsOptional()
  estado?: EstadoExpedienteEnum;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  clienteId?: string;

  @IsString()
  @IsOptional()
  abogadoId?: string;
}

export class UpdateExpedienteDto {
  @IsString()
  @IsOptional()
  numeroExpediente?: string;

  @IsEnum(TipoExpedienteEnum)
  @IsOptional()
  tipo?: TipoExpedienteEnum;

  @IsEnum(EstadoExpedienteEnum)
  @IsOptional()
  estado?: EstadoExpedienteEnum;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  clienteId?: string;

  @IsString()
  @IsOptional()
  abogadoId?: string;
}

export class QueryExpedienteDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsString()
  @IsOptional()
  sort?: string = 'createdAt';

  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  abogado_id?: string;

  @IsString()
  @IsOptional()
  cliente_id?: string;

  @IsDateString()
  @IsOptional()
  fecha_desde?: string;

  @IsDateString()
  @IsOptional()
  fecha_hasta?: string;
}

export class CreateActuacionDto {
  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsNotEmpty()
  fecha!: string;

  @IsString()
  @IsOptional()
  documento?: string;
}

export class QueryActuacionDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsString()
  @IsOptional()
  sort?: string = 'fecha';

  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';
}
