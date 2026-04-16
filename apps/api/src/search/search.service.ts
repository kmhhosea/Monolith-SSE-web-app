import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import {
  FeedPost,
  Opportunity,
  Project,
  Resource,
  User
} from 'src/database/entities';
import { RedisService } from 'src/database/redis.service';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @InjectRepository(FeedPost)
    private readonly feedRepository: Repository<FeedPost>,
    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,
    private readonly redisService: RedisService
  ) {}

  async search(query: string) {
    const trimmed = query.trim();
    if (!trimmed) {
      return {
        users: [],
        projects: [],
        resources: [],
        feed: [],
        opportunities: []
      };
    }

    const cacheKey = `search:${trimmed.toLowerCase()}`;
    const cached = await this.redisService.getJson<Record<string, unknown[]>>(cacheKey);
    if (cached) {
      return cached;
    }

    const [users, projects, resources, feed, opportunities] = await Promise.all([
      this.userRepository.find({
        where: [
          { fullName: ILike(`%${trimmed}%`) },
          { university: ILike(`%${trimmed}%`) },
          { course: ILike(`%${trimmed}%`) }
        ],
        take: 8
      }),
      this.projectRepository.find({
        where: [{ title: ILike(`%${trimmed}%`) }, { summary: ILike(`%${trimmed}%`) }],
        take: 8
      }),
      this.resourceRepository.find({
        where: [{ title: ILike(`%${trimmed}%`) }, { description: ILike(`%${trimmed}%`) }],
        take: 8
      }),
      this.feedRepository.find({
        where: { content: ILike(`%${trimmed}%`) },
        take: 8
      }),
      this.opportunityRepository.find({
        where: [{ title: ILike(`%${trimmed}%`) }, { description: ILike(`%${trimmed}%`) }],
        take: 8
      })
    ]);

    const results = { users, projects, resources, feed, opportunities };
    await this.redisService.setJson(cacheKey, results, 180);
    return results;
  }
}
