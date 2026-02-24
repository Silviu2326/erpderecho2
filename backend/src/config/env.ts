import dotenv from 'dotenv';

dotenv.config();

export interface EnvConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  OPENAI_API_KEY?: string;
  OPENAI_MODEL: string;
  GOOGLE_CLOUD_PROJECT_ID?: string;
  GOOGLE_CLOUD_KEY_FILE?: string;
  GOOGLE_CLOUD_API_KEY?: string;
  // Email configuration
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
  FRONTEND_URL: string;
  // Upload configuration
  UPLOAD_PATH: string;
  MAX_FILE_SIZE: number;
  ALLOWED_MIME_TYPES: string[];
  // Thumbnail configuration
  THUMBNAIL_WIDTH: number;
  THUMBNAIL_HEIGHT: number;
  THUMBNAIL_QUALITY: number;
  // OCR configuration
  OCR_AUTO_PROCESS: boolean;
  OCR_MIN_CONFIDENCE: number;
}

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`Invalid number for environment variable: ${key}`);
  }
  return num;
}

function getEnvArray(key: string, defaultValue?: string[]): string[] {
  const value = process.env[key];
  if (!value) {
    if (defaultValue) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.split(',').map(item => item.trim());
}

function getEnvBoolean(key: string, defaultValue?: boolean): boolean {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.toLowerCase() === 'true' || value === '1';
}

export const env: EnvConfig = {
  DATABASE_URL: getEnv('DATABASE_URL'),
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  PORT: getEnvNumber('PORT', 3000),
  NODE_ENV: getEnv('NODE_ENV', 'development') as EnvConfig['NODE_ENV'],
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: getEnv('OPENAI_MODEL', 'gpt-3.5-turbo'),
  GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
  GOOGLE_CLOUD_KEY_FILE: process.env.GOOGLE_CLOUD_KEY_FILE,
  GOOGLE_CLOUD_API_KEY: process.env.GOOGLE_CLOUD_API_KEY,
  // Email configuration
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@derecho.erp',
  FRONTEND_URL: getEnv('FRONTEND_URL', 'http://localhost:5173'),
  // Upload configuration
  UPLOAD_PATH: getEnv('UPLOAD_PATH', './uploads'),
  MAX_FILE_SIZE: getEnvNumber('MAX_FILE_SIZE', 26214400),
  ALLOWED_MIME_TYPES: getEnvArray('ALLOWED_MIME_TYPES', [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]),
  // Thumbnail configuration
  THUMBNAIL_WIDTH: getEnvNumber('THUMBNAIL_WIDTH', 300),
  THUMBNAIL_HEIGHT: getEnvNumber('THUMBNAIL_HEIGHT', 400),
  THUMBNAIL_QUALITY: getEnvNumber('THUMBNAIL_QUALITY', 80),
  // OCR configuration
  OCR_AUTO_PROCESS: getEnvBoolean('OCR_AUTO_PROCESS', true),
  OCR_MIN_CONFIDENCE: getEnvNumber('OCR_MIN_CONFIDENCE', 0.6),
};
