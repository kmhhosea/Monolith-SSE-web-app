import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity, User } from 'src/database/entities';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  list() {
    return this.opportunityRepository.find({
      order: { createdAt: 'DESC' },
      take: 20
    });
  }

  async create(postedById: string, dto: CreateOpportunityDto) {
    const opportunity = await this.opportunityRepository.save(
      this.opportunityRepository.create({
        title: dto.title,
        description: dto.description,
        type: dto.type,
        organization: dto.organization,
        location: dto.location ?? 'Remote / Tanzania',
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        link: dto.link ?? null,
        tags: dto.tags ?? [],
        postedById
      })
    );

    const audienceUserIds = (await this.userRepository.find({ take: 50 })).map((user) => user.id);
    this.eventEmitter.emit('opportunity.created', {
      audienceUserIds,
      title: opportunity.title,
      opportunityId: opportunity.id
    });

    return opportunity;
  }
}
