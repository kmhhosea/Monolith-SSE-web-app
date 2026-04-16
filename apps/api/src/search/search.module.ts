import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedPost, Opportunity, Project, Resource, User } from 'src/database/entities';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project, Resource, FeedPost, Opportunity])],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule {}
