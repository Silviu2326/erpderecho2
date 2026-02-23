import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateConsentimientoDto {
  @IsString()
  @IsNotEmpty()
  clienteId!: string;

  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @IsBoolean()
  granted!: boolean;

  @IsDateString()
  fechaConsentimiento!: string;
}

export class QueryConsentimientoDto {
  @IsString()
  @IsOptional()
  clienteId?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class CreateDerechoARCOdto {
  @IsString()
  @IsNotEmpty()
  clienteId!: string;

  @IsEnum(['ACCESO', 'RECTIFICACION', 'SUPRESION', 'OPOSICION', 'PORTABILIDAD', 'LIMITACION'])
  tipo!: 'ACCESO' | 'RECTIFICACION' | 'SUPRESION' | 'OPOSICION' | 'PORTABILIDAD' | 'LIMITACION';

  @IsDateString()
  fechaSolicitud!: string;
}

export class ProcesarDerechoARCOdto {
  @IsEnum(['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'RECHAZADO'])
  estado!: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'RECHAZADO';

  @IsDateString()
  @IsOptional()
  fechaRespuesta?: string;
}

export class QueryDerechoARCOdto {
  @IsString()
  @IsOptional()
  clienteId?: string;

  @IsEnum(['ACCESO', 'RECTIFICACION', 'SUPRESION', 'OPOSICION', 'PORTABILIDAD', 'LIMITACION'])
  @IsOptional()
  tipo?: 'ACCESO' | 'RECTIFICACION' | 'SUPRESION' | 'OPOSICION' | 'PORTABILIDAD' | 'LIMITACION';

  @IsEnum(['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'RECHAZADO'])
  @IsOptional()
  estado?: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'RECHAZADO';

  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class CreateBrechaDto {
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsDateString()
  fechaDeteccion!: string;

  @IsDateString()
  @IsOptional()
  fechaNotificacionAepd?: string;

  @IsEnum(['DETECTADA', 'INVESTIGANDO', 'CONTENIDA', 'NOTIFICADA', 'CERRADA'])
  @IsOptional()
  estado?: 'DETECTADA' | 'INVESTIGANDO' | 'CONTENIDA' | 'NOTIFICADA' | 'CERRADA';

  @IsString()
  @IsOptional()
  medidas?: string;
}

export class QueryBrechaDto {
  @IsEnum(['DETECTADA', 'INVESTIGANDO', 'CONTENIDA', 'NOTIFICADA', 'CERRADA'])
  @IsOptional()
  estado?: 'DETECTADA' | 'INVESTIGANDO' | 'CONTENIDA' | 'NOTIFICADA' | 'CERRADA';

  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
