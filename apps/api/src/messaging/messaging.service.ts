import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  Conversation,
  ConversationParticipant,
  ConversationType,
  Message,
  ReadReceipt,
  User
} from 'src/database/entities';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(ReadReceipt)
    private readonly receiptRepository: Repository<ReadReceipt>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async listConversations(userId: string) {
    const participants = await this.participantRepository.find({ where: { userId } });
    const conversationIds = participants.map((participant) => participant.conversationId);
    const conversations = conversationIds.length
      ? await this.conversationRepository.find({
          where: { id: In(conversationIds) },
          order: { updatedAt: 'DESC' }
        })
      : [];

    return Promise.all(
      conversations.map(async (conversation) => {
        const [latestMessage, members] = await Promise.all([
          this.messageRepository.findOne({
            where: { conversationId: conversation.id },
            order: { createdAt: 'DESC' }
          }),
          this.participantRepository.find({ where: { conversationId: conversation.id } })
        ]);

        return {
          ...conversation,
          latestMessage,
          members
        };
      })
    );
  }

  async getMessages(conversationId: string, userId: string) {
    await this.ensureParticipant(conversationId, userId);
    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      take: 100
    });
  }

  async createDirectConversation(userId: string, peerId: string) {
    const [self, peer] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.userRepository.findOne({ where: { id: peerId } })
    ]);

    if (!self || !peer) {
      throw new NotFoundException('Both users must exist.');
    }

    const commonConversation = await this.findDirectConversation(userId, peerId);
    if (commonConversation) {
      return commonConversation;
    }

    const conversation = await this.conversationRepository.save(
      this.conversationRepository.create({
        type: ConversationType.DIRECT,
        createdById: userId
      })
    );

    await this.participantRepository.save([
      this.participantRepository.create({ conversationId: conversation.id, userId }),
      this.participantRepository.create({ conversationId: conversation.id, userId: peerId })
    ]);

    return conversation;
  }

  async sendMessage(conversationId: string, senderId: string, dto: CreateMessageDto) {
    await this.ensureParticipant(conversationId, senderId);

    const message = await this.messageRepository.save(
      this.messageRepository.create({
        conversationId,
        senderId,
        body: dto.body,
        attachments: dto.attachments ?? []
      })
    );

    await this.conversationRepository.update(conversationId, { updatedAt: new Date() });

    await this.receiptRepository.save(
      this.receiptRepository.create({
        messageId: message.id,
        userId: senderId,
        readAt: new Date()
      })
    );

    this.eventEmitter.emit('message.sent', {
      conversationId,
      id: message.id,
      messageId: message.id,
      senderId,
      body: message.body,
      preview: dto.body,
      createdAt: message.createdAt
    });

    return message;
  }

  async markConversationRead(conversationId: string, userId: string) {
    await this.ensureParticipant(conversationId, userId);

    const messages = await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      take: 50
    });

    const latestMessage = messages[0];
    if (!latestMessage) {
      return null;
    }

    const unreadMessages = messages.filter((message) => message.senderId !== userId);
    await Promise.all(
      unreadMessages.map(async (message) => {
        const existing = await this.receiptRepository.findOne({
          where: { messageId: message.id, userId }
        });

        if (!existing) {
          await this.receiptRepository.save(
            this.receiptRepository.create({
              messageId: message.id,
              userId,
              readAt: new Date()
            })
          );
        }
      })
    );

    const participant = await this.participantRepository.findOne({
      where: { conversationId, userId }
    });
    if (participant) {
      participant.lastReadMessageId = latestMessage.id;
      await this.participantRepository.save(participant);
    }

    this.eventEmitter.emit('message.read', {
      conversationId,
      userId,
      messageId: latestMessage.id,
      readAt: new Date().toISOString()
    });

    return { conversationId, messageId: latestMessage.id };
  }

  private async ensureParticipant(conversationId: string, userId: string) {
    const participant = await this.participantRepository.findOne({
      where: { conversationId, userId }
    });

    if (!participant) {
      throw new ForbiddenException('You are not part of this conversation.');
    }
  }

  private async findDirectConversation(userId: string, peerId: string) {
    const conversations = await this.conversationRepository.find({
      where: { type: ConversationType.DIRECT }
    });

    for (const conversation of conversations) {
      const participants = await this.participantRepository.find({
        where: { conversationId: conversation.id }
      });
      const participantIds = participants.map((participant) => participant.userId).sort();
      if (participantIds.length === 2 && participantIds.join(':') === [userId, peerId].sort().join(':')) {
        return conversation;
      }
    }

    return null;
  }
}
