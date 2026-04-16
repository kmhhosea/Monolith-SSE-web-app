import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Conversation,
  ConversationParticipant,
  StudyGroup,
  StudyGroupMember
} from 'src/database/entities';
import { StudyGroupsController } from './study-groups.controller';
import { StudyGroupsService } from './study-groups.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudyGroup,
      StudyGroupMember,
      Conversation,
      ConversationParticipant
    ])
  ],
  controllers: [StudyGroupsController],
  providers: [StudyGroupsService]
})
export class StudyGroupsModule {}
