import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Conversation,
  ConversationParticipant,
  Message,
  ReadReceipt,
  User
} from 'src/database/entities';
import { ChatGateway } from './chat.gateway';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.accessSecret')
      })
    }),
    TypeOrmModule.forFeature([Conversation, ConversationParticipant, Message, ReadReceipt, User])
  ],
  controllers: [MessagingController],
  providers: [MessagingService, ChatGateway],
  exports: [MessagingService]
})
export class MessagingModule {}
