import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Opportunity, User } from 'src/database/entities';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';

@Module({
  imports: [TypeOrmModule.forFeature([Opportunity, User])],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService]
})
export class OpportunitiesModule {}
