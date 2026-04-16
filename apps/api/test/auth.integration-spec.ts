import { randomUUID } from 'crypto';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import { DataType, newDb } from 'pg-mem';
import request from 'supertest';
import appConfig from 'src/config/app.config';
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
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

describe('Auth flow integration', () => {
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

    const dataSource = db.adapters.createTypeormDataSource({
      type: 'postgres',
      entities: [
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
      ],
      synchronize: true
    });
    await dataSource.initialize();

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig]
        }),
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            type: 'postgres',
            entities: [
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
            ],
            synchronize: true
          }),
          dataSourceFactory: async () => dataSource
        }),
        JwtModule.register({
          secret: process.env.JWT_ACCESS_SECRET
        }),
        UsersModule,
        AuthModule
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('registers, logs in, and returns the current user', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Amina Test',
        email: 'amina@example.com',
        password: 'Password123!',
        university: 'UDSM',
        course: 'Computer Science',
        skills: ['Python'],
        interests: ['AI'],
        goals: ['Build']
      })
      .expect(201);

    expect(registerResponse.body.accessToken).toBeDefined();
    expect(registerResponse.headers['set-cookie']).toBeDefined();

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'amina@example.com',
        password: 'Password123!'
      })
      .expect(200);

    const meResponse = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(200);

    expect(meResponse.body.email).toBe('amina@example.com');
  });
});
