import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

export class QueryLegislacionDto {
  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  search?: string;

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

export class CreateFavoritoDto {
  @IsString()
  @IsNotEmpty()
  legislacionId!: string;
}

export class QueryFavoritoDto {
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

export class CreateAlertaDto {
  @IsString()
  @IsNotEmpty()
  palabrasClave!: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}

export class UpdateAlertaDto {
  @IsString()
  @IsOptional()
  palabrasClave?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}

export class QueryAlertaDto {
  @IsBoolean()
  @IsOptional()
  activa?: boolean;

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
