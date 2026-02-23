import { IsString, IsOptional, IsEmail, IsArray, IsDateString, IsBoolean, IsNumber } from 'class-validator';

export class ConnectIntegracionDto {
  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}

export class SendEmailDto {
  @IsEmail()
  to!: string;

  @IsString()
  subject!: string;

  @IsString()
  body!: string;

  @IsString()
  @IsOptional()
  from?: string;

  @IsArray()
  @IsOptional()
  cc?: string[];

  @IsArray()
  @IsOptional()
  bcc?: string[];

  @IsString()
  @IsOptional()
  expedienteId?: string;
}

export class CalendarEventDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsArray()
  @IsOptional()
  attendees?: string[];

  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  @IsString()
  @IsOptional()
  expedienteId?: string;
}

export class SyncCalendarDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  syncEvents?: boolean;
}

export class IntegracionStatusDto {
  @IsString()
  tipo!: string;

  @IsBoolean()
  connected!: boolean;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsNumber()
  @IsOptional()
  daysUntilExpiry?: number;
}
