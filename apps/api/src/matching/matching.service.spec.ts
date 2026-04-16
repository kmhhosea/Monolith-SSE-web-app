import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MatchingService } from './matching.service';
import { User } from 'src/database/entities';
import { RedisService } from 'src/database/redis.service';

describe('MatchingService', () => {
  it('scores peers by course, skills, and interests', async () => {
    const userRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'user-1',
        course: 'Computer Science',
        skills: ['Python', 'Leadership'],
        interests: ['AI', 'Education']
      }),
      find: jest.fn().mockResolvedValue([
        {
          id: 'user-2',
          fullName: 'Amina',
          course: 'Computer Science',
          skills: ['Python'],
          interests: ['AI']
        },
        {
          id: 'user-3',
          fullName: 'John',
          course: 'Economics',
          skills: ['Writing'],
          interests: ['Policy']
        }
      ])
    };

    const redisService = {
      getJson: jest.fn().mockResolvedValue(null),
      setJson: jest.fn().mockResolvedValue(undefined)
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MatchingService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository
        },
        {
          provide: RedisService,
          useValue: redisService
        }
      ]
    }).compile();

    const service = moduleRef.get(MatchingService);
    const result = (await service.recommend('user-1')) as Array<{
      user: { fullName: string };
      reasons: string[];
    }>;

    expect(result[0].user.fullName).toBe('Amina');
    expect(result[0].reasons).toContain('Both study Computer Science');
    expect(redisService.setJson).toHaveBeenCalled();
  });
});
