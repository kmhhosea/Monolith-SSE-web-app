import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationParticipant, Notification, User } from 'src/database/entities';
import { MailService } from './mail.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

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
    TypeOrmModule.forFeature([Notification, ConversationParticipant, User])
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, MailService],
  exports: [NotificationsService]
})
export class NotificationsModule {}
