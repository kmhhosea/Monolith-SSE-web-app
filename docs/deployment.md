# Deployment Guide

## Recommended Low-Cost Path

1. Deploy the NestJS API to Render, Railway, Fly.io, or a small VM.
2. Deploy the Next.js app to Vercel or the same VM through Docker Compose.
3. Use Neon, Supabase, or Railway Postgres for managed PostgreSQL.
4. Use Upstash Redis or Railway Redis for cache/presence.
5. Move uploads to S3-compatible storage once local disk is no longer sufficient.

See `docs/deployment-credentials.md` for the exact secrets and third-party credentials you need to supply.

## Local Docker Deployment

1. Copy `.env.example` to `.env`.
2. Run `docker compose up --build`.
3. Open `http://localhost:3000` for the PWA and `http://localhost:4000/docs` for Swagger.

## Production Notes

- Terminate TLS at the platform edge or reverse proxy.
- Set secure cookie flags and production-grade JWT secrets.
- Point `WEB_URL` and `NEXT_PUBLIC_API_URL` to public production URLs.
- Mount persistent storage for uploads or switch to object storage.
- Enable SMTP credentials for email notifications.
- Configure Google OAuth callback URLs for the public domain.
