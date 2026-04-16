import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource, StudyGroupMember, User } from 'src/database/entities';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';

@Module({
  imports: [TypeOrmModule.forFeature([Resource, StudyGroupMember, User])],
  controllers: [ResourcesController],
  providers: [ResourcesService]
})
export class ResourcesModule {}
