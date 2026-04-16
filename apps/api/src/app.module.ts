import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import appConfig from './config/app.config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './database/redis.module';
import { FeedModule } from './feed/feed.module';
import { HealthModule } from './health/health.module';
import { MatchingModule } from './matching/matching.module';
import { MessagingModule } from './messaging/messaging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { ProjectsModule } from './projects/projects.module';
import { ResourcesModule } from './resources/resources.module';
import { SearchModule } from './search/search.module';
import { StudyGroupsModule } from './study-groups/study-groups.module';
import { TutoringModule } from './tutoring/tutoring.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig]
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100
      }
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'apps/api/uploads'),
      serveRoot: '/uploads'
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    UsersModule,
    MessagingModule,
    StudyGroupsModule,
    ProjectsModule,
    ResourcesModule,
    NotificationsModule,
    SearchModule,
    MatchingModule,
    FeedModule,
    OpportunitiesModule,
    TutoringModule,
    HealthModule
  ]
})
export class AppModule {}
