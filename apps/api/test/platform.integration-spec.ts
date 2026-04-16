import { randomUUID } from 'crypto';
import { Global, INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import { DataType, newDb } from 'pg-mem';
import request from 'supertest';
import appConfig from 'src/config/app.config';
import { AuthModule } from 'src/auth/auth.module';
import { RedisService } from 'src/database/redis.service';
import {
  ActivityLog,
  Conversation,
  ConversationParticipant,
  FeedComment,
  FeedLike,
  FeedPost,
  Message,
  Notification,
  Opportunity,
  Project,
  ProjectMember,
  ProjectTask,
  ReadReceipt,
  RefreshToken,
  Resource,
  StudyGroup,
  StudyGroupMember,
  TutoringRequest,
  User
} from 'src/database/entities';
import { FeedModule } from 'src/feed/feed.module';
import { MatchingModule } from 'src/matching/matching.module';
import { MessagingModule } from 'src/messaging/messaging.module';
import { OpportunitiesModule } from 'src/opportunities/opportunities.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { ResourcesModule } from 'src/resources/resources.module';
import { SearchModule } from 'src/search/search.module';
import { StudyGroupsModule } from 'src/study-groups/study-groups.module';
import { TutoringModule } from 'src/tutoring/tutoring.module';
import { UsersModule } from 'src/users/users.module';

class InMemoryRedisService {
  private readonly store = new Map<string, string>();

  async getJson<T>(key: string): Promise<T | null> {
    const value = this.store.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async setJson(key: string, value: unknown): Promise<void> {
    this.store.set(key, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

@Global()
@Module({
  providers: [
    {
      provide: RedisService,
      useClass: InMemoryRedisService
    }
  ],
  exports: [RedisService]
})
class FakeRedisModule {}

describe('Platform feature integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_TTL = '15m';
    process.env.JWT_REFRESH_TTL = '7d';
    process.env.WEB_URL = 'http://localhost:3000';
    process.env.GOOGLE_CLIENT_ID = 'test-google-client';
    process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
    process.env.GOOGLE_CALLBACK_URL = 'http://localhost:4000/api/v1/auth/google/callback';

    const db = newDb({ autoCreateForeignKeyIndices: true });
    db.public.registerFunction({
      name: 'current_database',
      returns: DataType.text,
      implementation: () => 'sse_test'
    });
    db.public.registerFunction({
      name: 'version',
      returns: DataType.text,
      implementation: () => 'PostgreSQL 16'
    });
    db.public.registerFunction({
      name: 'uuid_generate_v4',
      returns: DataType.uuid,
      implementation: () => randomUUID()
    });
    db.public.registerFunction({
      name: 'gen_random_uuid',
      returns: DataType.uuid,
      implementation: () => randomUUID()
    });

    const entities = [
      User,
      RefreshToken,
      Conversation,
      ConversationParticipant,
      Message,
      ReadReceipt,
      StudyGroup,
      StudyGroupMember,
      Project,
      ProjectMember,
      ProjectTask,
      Resource,
      ActivityLog,
      FeedPost,
      FeedComment,
      FeedLike,
      Notification,
      Opportunity,
      TutoringRequest
    ];

    const dataSource = db.adapters.createTypeormDataSource({
      type: 'postgres',
      entities,
      synchronize: true
    });
    await dataSource.initialize();

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig]
        }),
        EventEmitterModule.forRoot(),
        FakeRedisModule,
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            type: 'postgres',
            entities,
            synchronize: true
          }),
          dataSourceFactory: async () => dataSource
        }),
        UsersModule,
        AuthModule,
        MessagingModule,
        StudyGroupsModule,
        ProjectsModule,
        ResourcesModule,
        FeedModule,
        OpportunitiesModule,
        TutoringModule,
        MatchingModule,
        SearchModule
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true
      })
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('covers the main collaboration flows', async () => {
    const userOneResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Amina Builder',
        email: 'amina@sse.test',
        password: 'Password123!',
        university: 'UDSM',
        course: 'Computer Science',
        skills: ['Python', 'Leadership'],
        interests: ['AI', 'Agriculture'],
        goals: ['Build impact tools']
      })
      .expect(201);

    const userTwoResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'John Collaborator',
        email: 'john@sse.test',
        password: 'Password123!',
        university: 'NM-AIST',
        course: 'Computer Science',
        skills: ['Python', 'Research'],
        interests: ['AI', 'Education'],
        goals: ['Join good projects']
      })
      .expect(201);

    const userOneToken = userOneResponse.body.accessToken as string;
    const userTwoToken = userTwoResponse.body.accessToken as string;
    const userTwoId = userTwoResponse.body.user.id as string;

    const matchesResponse = await request(app.getHttpServer())
      .get('/api/v1/matching/collaborators')
      .set('Authorization', `Bearer ${userOneToken}`)
      .expect(200);

    expect(matchesResponse.body[0].user.email).toBe('john@sse.test');

    const conversationResponse = await request(app.getHttpServer())
      .post('/api/v1/messaging/conversations/direct')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ peerId: userTwoId })
      .expect(201);

    const conversationId = conversationResponse.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/messaging/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ body: 'Let us build the AI agriculture project.' })
      .expect(201);

    const messagesResponse = await request(app.getHttpServer())
      .get(`/api/v1/messaging/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${userTwoToken}`)
      .expect(200);

    expect(messagesResponse.body).toHaveLength(1);

    const studyGroupResponse = await request(app.getHttpServer())
      .post('/api/v1/study-groups')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({
        name: 'AI Study Circle',
        topic: 'Machine Learning',
        description: 'Weekly study sessions for applied AI.',
        meetingLink: 'https://meet.example.com/ai'
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/study-groups/${studyGroupResponse.body.id}/join`)
      .set('Authorization', `Bearer ${userTwoToken}`)
      .expect(201);

    const projectResponse = await request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({
        title: 'AI Agriculture Platform',
        summary: 'Improve farmer decisions with simple AI tooling.',
        tags: ['AI', 'Agriculture']
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/projects/${projectResponse.body.id}/members`)
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ userId: userTwoId })
      .expect(201);

    const taskResponse = await request(app.getHttpServer())
      .post(`/api/v1/projects/${projectResponse.body.id}/tasks`)
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ title: 'Define MVP scope' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/projects/tasks/${taskResponse.body.id}/status`)
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    const resourceResponse = await request(app.getHttpServer())
      .post('/api/v1/resources')
      .set('Authorization', `Bearer ${userOneToken}`)
      .field('title', 'AI Notes')
      .field('description', 'Core bootcamp notes for applied AI.')
      .field('course', 'Computer Science')
      .field('tags', JSON.stringify(['AI', 'Notes']))
      .attach('file', Buffer.from('study notes'), 'ai-notes.txt')
      .expect(201);

    expect(resourceResponse.body.title).toBe('AI Notes');

    const feedPostResponse = await request(app.getHttpServer())
      .post('/api/v1/feed/posts')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ content: 'Our AI agriculture team just finished the MVP scope.', tags: ['milestone'] })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/feed/posts/${feedPostResponse.body.id}/likes`)
      .set('Authorization', `Bearer ${userTwoToken}`)
      .expect(201);

    const opportunityResponse = await request(app.getHttpServer())
      .post('/api/v1/opportunities')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({
        title: 'AI Fellowship',
        description: 'Applied AI fellowship for social impact founders.',
        type: 'RESEARCH',
        organization: 'Tanzania Impact Lab',
        location: 'Remote / Tanzania',
        tags: ['AI', 'Fellowship']
      })
      .expect(201);

    expect(opportunityResponse.body.title).toBe('AI Fellowship');

    const tutoringResponse = await request(app.getHttpServer())
      .post('/api/v1/tutoring/requests')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({
        title: 'Need help with neural networks',
        topic: 'Deep Learning',
        description: 'Looking for review support before exams.',
        course: 'Computer Science'
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/tutoring/requests/${tutoringResponse.body.id}/claim`)
      .set('Authorization', `Bearer ${userTwoToken}`)
      .expect(201);

    const searchResponse = await request(app.getHttpServer())
      .get('/api/v1/search?q=AI')
      .set('Authorization', `Bearer ${userOneToken}`)
      .expect(200);

    expect(searchResponse.body.projects.some((project: { title: string }) => project.title.includes('AI'))).toBe(true);
    expect(searchResponse.body.resources.some((resource: { title: string }) => resource.title.includes('AI'))).toBe(true);
    expect(searchResponse.body.opportunities.some((opportunity: { title: string }) => opportunity.title.includes('AI'))).toBe(true);
  });
});
