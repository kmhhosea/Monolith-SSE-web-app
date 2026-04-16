import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [MatchingController],
  providers: [MatchingService],
  exports: [MatchingService]
})
export class MatchingModule {}
