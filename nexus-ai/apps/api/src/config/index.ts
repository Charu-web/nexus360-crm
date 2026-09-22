import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config(); // fallback to local cwd

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  isProduction: process.env.NODE_ENV === 'production',

  // Database & Cache
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nexus_ai?schema=public',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT Secrets
  jwtSecret: process.env.JWT_SECRET || 'nexus_ai_jwt_default_secret_key_change_in_production_min_64_chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'nexus_ai_jwt_refresh_default_secret_key_change_in_production',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),

  // External AI Service
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',

  // Upload Limits
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10),

  // CORS
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:4000,http://localhost:8000').split(','),
};
