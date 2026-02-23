import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  empresa?: string;

  @IsString()
  @IsOptional()
  origen?: string;

  @IsEnum(['NUEVO', 'CONTACTADO', 'CUALIFICADO', 'CONVERTIDO', 'PERDIDO'])
  @IsOptional()
  estado?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  probabilidad?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  expectedRevenue?: number;

  @IsUUID()
  @IsOptional()
  clienteId?: string;
}

export class UpdateLeadDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  empresa?: string;

  @IsString()
  @IsOptional()
  origen?: string;

  @IsEnum(['NUEVO', 'CONTACTADO', 'CUALIFICADO', 'CONVERTIDO', 'PERDIDO'])
  @IsOptional()
  estado?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  probabilidad?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  expectedRevenue?: number;

  @IsUUID()
  @IsOptional()
  clienteId?: string;
}

export class ConvertirLeadDto {
  @IsUUID()
  @IsNotEmpty()
  clienteId!: string;

  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  importe?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  probabilidad?: number;

  @IsEnum(['PROSPECTO', 'CALIFICACION', 'PROPUESTA', 'NEGOCIACION', 'CIERRE'])
  @IsOptional()
  etapa?: string;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;
}

export class QueryLeadDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
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

  @IsEnum(['NUEVO', 'CONTACTADO', 'CUALIFICADO', 'CONVERTIDO', 'PERDIDO'])
  @IsOptional()
  estado?: string;
}

export class CreateOportunidadDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsUUID()
  @IsOptional()
  leadId?: string;

  @IsEnum(['NUEVA', 'EN_PROCESO', 'GANADA', 'PERDIDA'])
  @IsOptional()
  estado?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  probabilidad?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  importe?: number;

  @IsEnum(['PROSPECTO', 'CALIFICACION', 'PROPUESTA', 'NEGOCIACION', 'CIERRE'])
  @IsOptional()
  etapa?: string;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;
}

export class UpdateOportunidadDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsUUID()
  @IsOptional()
  leadId?: string;

  @IsEnum(['NUEVA', 'EN_PROCESO', 'GANADA', 'PERDIDA'])
  @IsOptional()
  estado?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  probabilidad?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  importe?: number;

  @IsEnum(['PROSPECTO', 'CALIFICACION', 'PROPUESTA', 'NEGOCIACION', 'CIERRE'])
  @IsOptional()
  etapa?: string;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;
}

export class QueryOportunidadDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
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

  @IsEnum(['NUEVA', 'EN_PROCESO', 'GANADA', 'PERDIDA'])
  @IsOptional()
  estado?: string;

  @IsEnum(['PROSPECTO', 'CALIFICACION', 'PROPUESTA', 'NEGOCIACION', 'CIERRE'])
  @IsOptional()
  etapa?: string;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;
}

export class QueryPipelineDto {
  @IsUUID()
  @IsOptional()
  usuarioId?: string;
}

export class CreateActividadDto {
  @IsUUID()
  @IsOptional()
  oportunidadId?: string;

  @IsEnum(['LLAMADA', 'EMAIL', 'REUNION', 'TAREA', 'NOTA'])
  @IsNotEmpty()
  tipo!: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsNotEmpty()
  fecha!: string;

  @IsBoolean()
  @IsOptional()
  completada?: boolean;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;
}

export class UpdateActividadDto {
  @IsUUID()
  @IsOptional()
  oportunidadId?: string;

  @IsEnum(['LLAMADA', 'EMAIL', 'REUNION', 'TAREA', 'NOTA'])
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsBoolean()
  @IsOptional()
  completada?: boolean;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;
}

export class QueryActividadDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsString()
  @IsOptional()
  sort?: string = 'fecha';

  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc' = 'asc';

  @IsUUID()
  @IsOptional()
  oportunidadId?: string;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;

  @IsBoolean()
  @IsOptional()
  completada?: boolean;
}

export class CreateNotaDto {
  @IsString()
  @IsNotEmpty()
  contenido!: string;

  @IsUUID()
  @IsOptional()
  clienteId?: string;

  @IsUUID()
  @IsOptional()
  oportunidadId?: string;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;
}

export class UpdateNotaDto {
  @IsString()
  @IsOptional()
  contenido?: string;
}

export class QueryNotaDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsUUID()
  @IsOptional()
  clienteId?: string;

  @IsUUID()
  @IsOptional()
  oportunidadId?: string;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;
}

export class CreateContactoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsUUID()
  @IsNotEmpty()
  clienteId!: string;
}

export class QueryContactoDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsString()
  @IsOptional()
  search?: string;
}
