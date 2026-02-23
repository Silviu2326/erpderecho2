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
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum EstadoTurnoEnum {
  PENDIENTE = 'PENDIENTE',
  ATENDIENDO = 'ATENDIENDO',
  ATENDIDO = 'ATENDIDO',
  CANCELADO = 'CANCELADO',
}

export enum TipoTurnoEnum {
  CONSULTA = 'CONSULTA',
  GESTION = 'GESTION',
  URGENCIA = 'URGENCIA',
}

export enum TipoGuardiaEnum {
  PRESENCIAL = 'PRESENCIAL',
  TELEFONICA = 'TELEFONICA',
  MIXTA = 'MIXTA',
}

export enum EstadoLiquidacionEnum {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
  ANULADA = 'ANULADA',
}

export class CreateTurnoDto {
  @IsDateString()
  @IsNotEmpty()
  fecha!: string;

  @IsEnum(TipoTurnoEnum)
  @IsNotEmpty()
  tipo!: TipoTurnoEnum;

  @IsString()
  @IsOptional()
  centro?: string;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;
}

export class UpdateTurnoDto {
  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsEnum(EstadoTurnoEnum)
  @IsOptional()
  estado?: EstadoTurnoEnum;

  @IsEnum(TipoTurnoEnum)
  @IsOptional()
  tipo?: TipoTurnoEnum;

  @IsString()
  @IsOptional()
  centro?: string;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;
}

export class QueryTurnoDto {
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

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;

  @IsDateString()
  @IsOptional()
  fecha_desde?: string;

  @IsDateString()
  @IsOptional()
  fecha_hasta?: string;
}

export class CreateGuardiaDto {
  @IsDateString()
  @IsNotEmpty()
  fechaInicio!: string;

  @IsDateString()
  @IsNotEmpty()
  fechaFin!: string;

  @IsEnum(TipoGuardiaEnum)
  @IsNotEmpty()
  tipo!: TipoGuardiaEnum;

  @IsString()
  @IsOptional()
  centro?: string;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;
}

export class QueryGuardiaDto {
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
  sort?: string = 'fechaInicio';

  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;

  @IsDateString()
  @IsOptional()
  fecha_desde?: string;

  @IsDateString()
  @IsOptional()
  fecha_hasta?: string;
}

export class CreateLiquidacionDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  importe!: number;

  @IsUUID()
  @IsNotEmpty()
  turnoId!: string;

  @IsEnum(EstadoLiquidacionEnum)
  @IsOptional()
  estado?: EstadoLiquidacionEnum;

  @IsDateString()
  @IsOptional()
  fechaLiquidacion?: string;
}

export class UpdateLiquidacionDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  importe?: number;

  @IsEnum(EstadoLiquidacionEnum)
  @IsOptional()
  estado?: EstadoLiquidacionEnum;

  @IsDateString()
  @IsOptional()
  fechaLiquidacion?: string;
}

export class QueryLiquidacionDto {
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
  estado?: string;

  @IsUUID()
  @IsOptional()
  turnoId?: string;
}
