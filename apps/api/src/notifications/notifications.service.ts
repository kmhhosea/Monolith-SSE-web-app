import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConversationParticipant,
  Notification,
  NotificationType,
  User
} from 'src/database/entities';
import { MailService } from './mail.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  listForUser(userId: string) {
    return this.notificationRepository.find({
      where: { userId },
      take: 25,
      order: { createdAt: 'DESC' }
    });
  }

  async markRead(userId: string, notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      return null;
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async create(userId: string, type: NotificationType, title: string, body: string, link?: string) {
    const notification = await this.notificationRepository.save(
      this.notificationRepository.create({
        userId,
        type,
        title,
        body,
        link: link ?? null
      })
    );

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      await this.mailService.send(
        user.email,
        title,
        `<p>${body}</p>${link ? `<p><a href="${link}">Open item</a></p>` : ''}`
      );
    }

    this.eventEmitter.emit('notification.created', {
      userId,
      notification
    });

    return notification;
  }

  @OnEvent('message.sent')
  async onMessageSent(event: {
    conversationId: string;
    senderId: string;
    preview: string;
  }) {
    const participants = await this.participantRepository.find({
      where: { conversationId: event.conversationId }
    });

    await Promise.all(
      participants
        .filter((participant) => participant.userId !== event.senderId)
        .map(async (participant) => {
          const notification = await this.create(
            participant.userId,
            NotificationType.MESSAGE,
            'New message',
            event.preview,
            `/messages?conversation=${event.conversationId}`
          );

          return {
            userId: participant.userId,
            notification
          };
        })
    );
  }

  @OnEvent('project.task.updated')
  async onProjectTaskUpdated(event: { userIds: string[]; projectId: string; title: string }) {
    await Promise.all(
      event.userIds.map((userId) =>
        this.create(
          userId,
          NotificationType.PROJECT,
          'Project task updated',
          event.title,
          `/projects?project=${event.projectId}`
        )
      )
    );
  }

  @OnEvent('resource.created')
  async onResourceCreated(event: { audienceUserIds: string[]; title: string; resourceId: string }) {
    await Promise.all(
      event.audienceUserIds.map((userId) =>
        this.create(
          userId,
          NotificationType.RESOURCE,
          'New shared resource',
          event.title,
          `/resources?resource=${event.resourceId}`
        )
      )
    );
  }

  @OnEvent('opportunity.created')
  async onOpportunityCreated(event: { audienceUserIds: string[]; title: string; opportunityId: string }) {
    await Promise.all(
      event.audienceUserIds.map((userId) =>
        this.create(
          userId,
          NotificationType.OPPORTUNITY,
          'New opportunity posted',
          event.title,
          `/opportunities?opportunity=${event.opportunityId}`
        )
      )
    );
  }
}
