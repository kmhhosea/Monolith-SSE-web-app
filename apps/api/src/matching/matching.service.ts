import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities';
import { RedisService } from 'src/database/redis.service';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService
  ) {}

  async recommend(userId: string) {
    const cacheKey = `matching:${userId}`;
    const cached = await this.redisService.getJson<unknown[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const currentUser = await this.userRepository.findOne({ where: { id: userId } });
    if (!currentUser) {
      return [];
    }

    const peers = await this.userRepository.find({ take: 100 });
    const recommendations = peers
      .filter((peer) => peer.id !== userId)
      .map((peer) => {
        const sharedSkills = peer.skills.filter((skill) => currentUser.skills.includes(skill));
        const sharedInterests = peer.interests.filter((interest) =>
          currentUser.interests.includes(interest)
        );

        return {
          user: peer,
          score:
            Number(peer.course === currentUser.course) * 5 +
            sharedSkills.length * 3 +
            sharedInterests.length * 2,
          reasons: [
            peer.course === currentUser.course ? `Both study ${peer.course}` : null,
            sharedSkills.length ? `Shared skills: ${sharedSkills.join(', ')}` : null,
            sharedInterests.length ? `Shared interests: ${sharedInterests.join(', ')}` : null
          ].filter(Boolean)
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    await this.redisService.setJson(cacheKey, recommendations, 300);
    return recommendations;
  }
}
