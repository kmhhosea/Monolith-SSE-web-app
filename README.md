# SSE Academic Collaboration Platform

Production-oriented monolithic collaboration platform for SSE students across Tanzania and beyond.

## Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, Zustand, PWA
- Backend: NestJS, TypeScript, TypeORM, Socket.IO
- Data: PostgreSQL, Redis
- DevOps: Docker, Docker Compose, GitHub Actions

## Quick Start

1. Copy `.env.example` to `.env`.
2. Run `npm install`.
3. Run `docker compose up -d postgres redis`.
4. Run `npm run dev`.
5. Visit `http://localhost:3000` and `http://localhost:4000/docs`.

## Verification

- `npm run build`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:e2e`
- `npm run test`

## Deployment Credentials

See `docs/deployment-credentials.md` for the exact required secrets, optional provider credentials, and production configuration checklist.

## Project Structure

- `apps/api`: NestJS backend monolith
- `apps/web`: Next.js installable web app
- `docs`: architecture, deployment, and testing guides
- `deploy`: Dockerfiles

## Feature Areas

- Secure auth with JWT refresh rotation and Google OAuth
- Academic profiles and collaborator matching
- Direct messages and group conversations
- Study groups and project collaboration
- Resource sharing and community feed
- Peer tutoring and opportunity board
- Realtime notifications and chat
- Offline-capable installable PWA shell
