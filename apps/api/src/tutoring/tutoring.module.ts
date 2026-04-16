import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutoringRequest } from 'src/database/entities';
import { TutoringController } from './tutoring.controller';
import { TutoringService } from './tutoring.service';

@Module({
  imports: [TypeOrmModule.forFeature([TutoringRequest])],
  controllers: [TutoringController],
  providers: [TutoringService]
})
export class TutoringModule {}
