import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedComment, FeedLike, FeedPost } from 'src/database/entities';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeedPost, FeedComment, FeedLike])],
  controllers: [FeedController],
  providers: [FeedService]
})
export class FeedModule {}
