import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoPrediccionEnum {
  RESULTADO = 'RESULTADO',
  DURACION = 'DURACION',
  COSTES = 'COSTES',
  EXITO = 'EXITO',
  RIESGO_PRESCRIPCION = 'RIESGO_PRESCRIPCION',
}

export class CreatePrediccionDto {
  @IsString()
  @IsNotEmpty()
  expedienteId!: string;

  @IsEnum(TipoPrediccionEnum)
  @IsNotEmpty()
  tipoPrediccion!: TipoPrediccionEnum;
}

export class QueryPrediccionDto {
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
  tipo?: string;

  @IsString()
  @IsOptional()
  expediente_id?: string;
}

export class QueryCasosSimilaresDto {
  @IsString()
  @IsNotEmpty()
  expedienteId!: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(20)
  limite?: number = 5;
}

export class QueryTendenciaDto {
  @IsString()
  @IsOptional()
  tipo?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  meses?: number = 12;
}
