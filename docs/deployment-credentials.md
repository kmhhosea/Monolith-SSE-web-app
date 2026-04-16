# Deployment Credentials Guide

This platform is deployable with only a small set of required credentials. Everything else is optional and unlocks extra functionality.

## Required Credentials

You must provide these for any real deployment:

- `DATABASE_URL`: PostgreSQL connection string.
- `REDIS_URL`: Redis connection string.
- `JWT_ACCESS_SECRET`: long random secret for access tokens.
- `JWT_REFRESH_SECRET`: different long random secret for refresh tokens.
- `COOKIE_SECRET`: long random secret for signed cookies and session-related protection.
- `WEB_URL`: public frontend URL, for example `https://app.yourdomain.com`.
- `NEXT_PUBLIC_API_URL`: public API URL, for example `https://api.yourdomain.com/api/v1` or the same-domain API path.

## Optional But Important Credentials

Provide these if you want the related features in production:

- Google login:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_CALLBACK_URL`
- Email notifications:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SMTP_FROM`

## Values You Usually Keep

- `API_PORT`: backend listen port.
- `JWT_ACCESS_TTL`: default `15m`.
- `JWT_REFRESH_TTL`: default `7d`.
- `MAX_UPLOAD_SIZE_MB`: default `10`.
- `SWAGGER_PATH`: default `docs`.
- `NEXT_PUBLIC_APP_NAME`: public app display name.

## Local Development Setting That Should Change In Production

- `TYPEORM_SYNC=true` is fine for local development.
- For production, set `TYPEORM_SYNC=false` once you move to a migration-based rollout process.

## How To Generate Strong Secrets

PowerShell:

```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

Use a different generated value for:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `COOKIE_SECRET`

## Where To Get External Credentials

- PostgreSQL:
  - Render Postgres
  - Railway Postgres
  - Neon
  - Supabase
- Redis:
  - Upstash Redis
  - Railway Redis
  - Render Redis
- Google OAuth:
  - Google Cloud Console -> APIs & Services -> Credentials
- SMTP:
  - Resend SMTP
  - SendGrid SMTP
  - Mailgun SMTP
  - Amazon SES SMTP

## Callback / Redirect Settings

For Google OAuth, register:

- Authorized redirect URI: your `GOOGLE_CALLBACK_URL`
- Authorized JavaScript origin: your public `WEB_URL`

## Deployment Checklist

1. Create PostgreSQL and Redis instances.
2. Set all required secrets and URLs.
3. Set Google and SMTP credentials if you need those features.
4. Deploy the API and web apps using the included Docker or platform-native setup.
5. Run:
   - `npm run build`
   - `npm run test`
6. Verify:
   - signup/login
   - messaging
   - study groups
   - projects/tasks
   - uploads
   - search
   - opportunities
   - tutoring
   - PWA installability
