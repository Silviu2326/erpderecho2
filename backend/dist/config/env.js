"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getEnv(key, defaultValue) {
    const value = process.env[key];
    if (!value && !defaultValue) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || defaultValue;
}
function getEnvNumber(key, defaultValue) {
    const value = process.env[key];
    if (!value) {
        if (defaultValue !== undefined)
            return defaultValue;
        throw new Error(`Missing required environment variable: ${key}`);
    }
    const num = parseInt(value, 10);
    if (isNaN(num)) {
        throw new Error(`Invalid number for environment variable: ${key}`);
    }
    return num;
}
exports.env = {
    DATABASE_URL: getEnv('DATABASE_URL'),
    JWT_SECRET: getEnv('JWT_SECRET'),
    JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
    JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '15m'),
    JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
    PORT: getEnvNumber('PORT', 3000),
    NODE_ENV: getEnv('NODE_ENV', 'development'),
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: getEnv('OPENAI_MODEL', 'gpt-3.5-turbo'),
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_CLOUD_KEY_FILE: process.env.GOOGLE_CLOUD_KEY_FILE,
    GOOGLE_CLOUD_API_KEY: process.env.GOOGLE_CLOUD_API_KEY,
};
//# sourceMappingURL=env.js.map