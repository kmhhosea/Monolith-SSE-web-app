import { registerAs } from '@nestjs/config';

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  apiPort: toNumber(process.env.API_PORT, 4000),
  webUrl: process.env.WEB_URL ?? 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://sse:sse@localhost:5432/sse_platform',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  accessSecret: process.env.JWT_ACCESS_SECRET ?? 'development-access-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'development-refresh-secret',
  accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  cookieSecret: process.env.COOKIE_SECRET ?? 'development-cookie-secret',
  swaggerPath: process.env.SWAGGER_PATH ?? 'docs',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:4000/api/v1/auth/google/callback',
  uploadDir: process.env.UPLOAD_DIR ?? './apps/api/uploads',
  maxUploadSizeMb: toNumber(process.env.MAX_UPLOAD_SIZE_MB, 10),
  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: toNumber(process.env.SMTP_PORT, 587),
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  smtpFrom: process.env.SMTP_FROM ?? 'no-reply@sse-platform.local'
}));
