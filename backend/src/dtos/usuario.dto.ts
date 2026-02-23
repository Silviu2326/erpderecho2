import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum UsuarioRol {
  ADMIN = 'admin',
  ABOGADO = 'abogado',
  LETRADO = 'letrado',
  SECRETARY = 'secretary',
  BECARIO = 'becario',
  COLABORADOR = 'colaborador',
}

export class CreateUsuarioDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  apellido1?: string;

  @IsString()
  @IsOptional()
  apellido2?: string;

  @IsEnum(UsuarioRol)
  @IsOptional()
  rol?: UsuarioRol;

  @IsString()
  @IsOptional()
  especialidad?: string;

  @IsString()
  @IsOptional()
  numeroColegiado?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  idioma?: string;

  @IsString()
  @IsOptional()
  moneda?: string;
}

export class UpdateUsuarioDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellido1?: string;

  @IsString()
  @IsOptional()
  apellido2?: string;

  @IsEnum(UsuarioRol)
  @IsOptional()
  rol?: UsuarioRol;

  @IsString()
  @IsOptional()
  especialidad?: string;

  @IsString()
  @IsOptional()
  numeroColegiado?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  idioma?: string;

  @IsString()
  @IsOptional()
  moneda?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  activo?: boolean;
}

export class AssignRolesDto {
  @IsEnum(UsuarioRol)
  @IsNotEmpty()
  rol!: UsuarioRol;
}

export class QueryUsuarioDto {
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

  @IsEnum(UsuarioRol)
  @IsOptional()
  rol?: UsuarioRol;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  activo?: boolean;
}
