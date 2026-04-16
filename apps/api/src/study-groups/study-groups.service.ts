import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Conversation,
  ConversationParticipant,
  ConversationType,
  MembershipRole,
  StudyGroup,
  StudyGroupMember
} from 'src/database/entities';
import { CreateStudyGroupDto } from './dto/create-study-group.dto';

@Injectable()
export class StudyGroupsService {
  constructor(
    @InjectRepository(StudyGroup)
    private readonly groupRepository: Repository<StudyGroup>,
    @InjectRepository(StudyGroupMember)
    private readonly memberRepository: Repository<StudyGroupMember>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>
  ) {}

  async list() {
    const groups = await this.groupRepository.find({ order: { createdAt: 'DESC' }, take: 20 });
    return Promise.all(
      groups.map(async (group) => ({
        ...group,
        memberCount: await this.memberRepository.count({ where: { groupId: group.id } })
      }))
    );
  }

  async create(userId: string, dto: CreateStudyGroupDto) {
    const group = await this.groupRepository.save(
      this.groupRepository.create({
        ...dto,
        createdById: userId,
        meetingLink: dto.meetingLink ?? null
      })
    );

    await this.memberRepository.save(
      this.memberRepository.create({
        groupId: group.id,
        userId,
        role: MembershipRole.OWNER
      })
    );

    const conversation = await this.conversationRepository.save(
      this.conversationRepository.create({
        type: ConversationType.GROUP,
        name: group.name,
        studyGroupId: group.id,
        createdById: userId
      })
    );

    await this.participantRepository.save(
      this.participantRepository.create({
        conversationId: conversation.id,
        userId
      })
    );

    return group;
  }

  async join(groupId: string, userId: string) {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Study group not found.');
    }

    const existing = await this.memberRepository.findOne({ where: { groupId, userId } });
    if (!existing) {
      await this.memberRepository.save(
        this.memberRepository.create({
          groupId,
          userId,
          role: MembershipRole.MEMBER
        })
      );
    }

    const conversation = await this.conversationRepository.findOne({ where: { studyGroupId: groupId } });
    if (conversation) {
      const participant = await this.participantRepository.findOne({
        where: { conversationId: conversation.id, userId }
      });
      if (!participant) {
        await this.participantRepository.save(
          this.participantRepository.create({
            conversationId: conversation.id,
            userId
          })
        );
      }
    }

    return group;
  }

  async findOne(groupId: string) {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Study group not found.');
    }

    const members = await this.memberRepository.find({ where: { groupId } });
    return { ...group, members };
  }
}
