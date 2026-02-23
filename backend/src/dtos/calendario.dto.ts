import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoEventoEnum {
  AUDIENCIA = 'AUDIENCIA',
  PLAZO = 'PLAZO',
  TAREA = 'TAREA',
  CITACION = 'CITACION',
  NOTIFICACION = 'NOTIFICACION',
  OTRO = 'OTRO',
}

export class CreateEventoDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsNotEmpty()
  fechaInicio!: string;

  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @IsEnum(TipoEventoEnum)
  @IsOptional()
  tipo?: TipoEventoEnum;

  @IsString()
  @IsOptional()
  expedienteId?: string;
}

export class UpdateEventoDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @IsEnum(TipoEventoEnum)
  @IsOptional()
  tipo?: TipoEventoEnum;

  @IsString()
  @IsOptional()
  expedienteId?: string;
}

export class QueryEventoDto {
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
  order?: 'asc' | 'desc' = 'asc';

  @IsString()
  @IsOptional()
  expediente_id?: string;

  @IsEnum(TipoEventoEnum)
  @IsOptional()
  tipo?: TipoEventoEnum;

  @IsDateString()
  @IsOptional()
  fecha_desde?: string;

  @IsDateString()
  @IsOptional()
  fecha_hasta?: string;
}

export class QueryCalendarioDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  mes?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  anio?: number;

  @IsDateString()
  @IsOptional()
  fecha_desde?: string;

  @IsDateString()
  @IsOptional()
  fecha_hasta?: string;
}
