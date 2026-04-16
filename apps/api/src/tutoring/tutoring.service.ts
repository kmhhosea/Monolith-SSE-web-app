import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutoringRequest, TutoringStatus } from 'src/database/entities';
import { CreateTutoringRequestDto } from './dto/create-tutoring-request.dto';

@Injectable()
export class TutoringService {
  constructor(
    @InjectRepository(TutoringRequest)
    private readonly requestRepository: Repository<TutoringRequest>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  list() {
    return this.requestRepository.find({
      order: { createdAt: 'DESC' },
      take: 20
    });
  }

  create(requesterId: string, dto: CreateTutoringRequestDto) {
    return this.requestRepository.save(
      this.requestRepository.create({
        requesterId,
        title: dto.title,
        topic: dto.topic,
        description: dto.description,
        course: dto.course,
        status: TutoringStatus.OPEN
      })
    );
  }

  async claim(id: string, helperId: string) {
    const request = await this.requestRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException('Tutoring request not found.');
    }

    request.helperId = helperId;
    request.status = TutoringStatus.MATCHED;
    const saved = await this.requestRepository.save(request);

    this.eventEmitter.emit('notification.created', {
      userId: request.requesterId,
      notification: {
        title: 'Tutoring help matched',
        body: `${request.title} now has a helper.`,
        link: `/tutoring?request=${request.id}`
      }
    });

    return saved;
  }

  async close(id: string, rating?: number, feedback?: string) {
    const request = await this.requestRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException('Tutoring request not found.');
    }

    request.status = TutoringStatus.CLOSED;
    request.rating = rating ?? null;
    request.feedback = feedback ?? null;
    return this.requestRepository.save(request);
  }
}
