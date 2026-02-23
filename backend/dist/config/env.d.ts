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
}
export declare const env: EnvConfig;
//# sourceMappingURL=env.d.ts.map