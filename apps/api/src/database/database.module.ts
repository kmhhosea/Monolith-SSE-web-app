import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog, Conversation, ConversationParticipant, FeedComment, FeedLike, FeedPost, Message, Notification, Opportunity, Project, ProjectMember, ProjectTask, ReadReceipt, RefreshToken, Resource, StudyGroup, StudyGroupMember, TutoringRequest, User } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('app.databaseUrl'),
        autoLoadEntities: true,
        synchronize: process.env.TYPEORM_SYNC === 'true',
        logging: configService.get<string>('app.nodeEnv') === 'development',
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
        ]
      })
    })
  ]
})
export class DatabaseModule {}
