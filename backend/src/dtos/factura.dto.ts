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

export enum EstadoFacturaEnum {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
  VENCIDA = 'VENCIDA',
  ANULADA = 'ANULADA',
}

export class LineaFacturaDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  concepto!: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  cantidad!: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  precioUnitario!: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  importe?: number;
}

export class CreateFacturaDto {
  @IsString()
  @IsNotEmpty()
  numero!: string;

  @IsString()
  @IsNotEmpty()
  concepto!: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  importeBase?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  importeIVA?: number;

  @IsEnum(EstadoFacturaEnum)
  @IsOptional()
  estado?: EstadoFacturaEnum;

  @IsDateString()
  @IsOptional()
  fechaEmision?: string;

  @IsDateString()
  @IsOptional()
  fechaVencimiento?: string;

  @IsString()
  @IsOptional()
  clienteId?: string;

  @IsString()
  @IsOptional()
  expedienteId?: string;

  @IsArray()
  @IsOptional()
  @Type(() => LineaFacturaDto)
  lineas?: LineaFacturaDto[];
}

export class UpdateFacturaDto {
  @IsString()
  @IsOptional()
  numero?: string;

  @IsString()
  @IsOptional()
  concepto?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  importeBase?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  importeIVA?: number;

  @IsEnum(EstadoFacturaEnum)
  @IsOptional()
  estado?: EstadoFacturaEnum;

  @IsDateString()
  @IsOptional()
  fechaEmision?: string;

  @IsDateString()
  @IsOptional()
  fechaVencimiento?: string;

  @IsString()
  @IsOptional()
  clienteId?: string;

  @IsString()
  @IsOptional()
  expedienteId?: string;

  @IsArray()
  @IsOptional()
  @Type(() => LineaFacturaDto)
  lineas?: LineaFacturaDto[];
}

export class QueryFacturaDto {
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
  cliente_id?: string;

  @IsString()
  @IsOptional()
  expediente_id?: string;

  @IsDateString()
  @IsOptional()
  fecha_desde?: string;

  @IsDateString()
  @IsOptional()
  fecha_hasta?: string;
}
