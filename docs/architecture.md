# SSE Academic Collaboration Platform Architecture

## System Shape

The platform uses a modular monolith backend and a single Next.js frontend. The backend is one NestJS application that owns all core business domains, data access, realtime messaging, notifications, search, and integrations. The frontend is one installable PWA that consumes the monolith through a unified `/api/v1` boundary.

## Internal Modules

- `AuthModule`: registration, login, refresh rotation, Google OAuth, RBAC, session security.
- `UsersModule`: academic profiles, discoverability, profile editing, peer search.
- `MessagingModule`: direct and group conversations, message persistence, read receipts, typing signals via WebSockets.
- `StudyGroupsModule`: topic communities, study coordination, group membership and shared discussion spaces.
- `ProjectsModule`: project creation, collaborator assignment, kanban task tracking, activity history.
- `ResourcesModule`: document uploads, metadata tagging, course-aware resource discovery.
- `NotificationsModule`: in-app notifications, realtime pushes, optional email delivery.
- `SearchModule`: federated search across users, projects, resources, feed posts, and opportunities.
- `MatchingModule`: course/skill/interest based collaborator recommendations with Redis caching.
- `FeedModule`: academic updates, comments, likes, and community activity signals.
- `TutoringModule`: peer-help requests, helper matching, feedback loops.
- `OpportunitiesModule`: scholarships, internships, hackathons, and research opportunities.

## Communication Flow Inside The Monolith

1. The web PWA calls the NestJS HTTP API for CRUD and authenticated actions.
2. Domain services persist data in PostgreSQL through TypeORM repositories.
3. Domain events are published in-process through Nest's event emitter.
4. Notifications and realtime gateways subscribe to those domain events and fan out updates to relevant users.
5. Redis is used for short-lived cache entries such as collaborator recommendations and search responses, plus presence/typing metadata when available.

## Data Flow

1. Users authenticate and receive an access token plus a refresh-token cookie.
2. Requests pass through JWT guards, validation pipes, throttling, and role checks.
3. Services compose relational data from PostgreSQL and return view-model friendly API responses.
4. The Next.js app renders dashboards and workspaces from API responses and keeps the UI fresh with socket events.

## Realtime Flow

1. The client connects with the JWT access token to the Socket.IO gateway.
2. Conversation rooms are joined on demand.
3. Message creation emits a domain event, which the gateway broadcasts to conversation subscribers.
4. Read receipts and typing indicators are broadcast in near real time.
5. Notification events are pushed to personal user rooms for alerts, matches, and project activity.

## Deployment Structure

- `web`: Next.js app, deployable independently but designed to sit in the same project and share one public domain with the API.
- `api`: NestJS monolith, the single backend runtime.
- `postgres`: primary relational data store.
- `redis`: cache and ephemeral realtime support.

This remains a monolith because all backend domain logic, persistence orchestration, and realtime coordination live in one backend service.

## Scaling Strategy

- Vertical scaling first for low-cost rollout.
- Add PostgreSQL indexes on high-traffic fields and full-text search targets.
- Enable Redis caching for expensive matching and search queries.
- Socket rooms keep realtime fan-out targeted instead of global broadcasts.
- File storage abstraction supports moving from local disk to S3-compatible object storage without rewriting domain modules.
