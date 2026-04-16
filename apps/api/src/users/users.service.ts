import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { User } from 'src/database/entities';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async discover(query?: string, currentUserId?: string): Promise<User[]> {
    if (!query) {
      return this.userRepository.find({
        where: currentUserId ? { id: Not(currentUserId) } : {},
        take: 20,
        order: { fullName: 'ASC' }
      });
    }

    return this.userRepository.find({
      where: [
        { fullName: ILike(`%${query}%`) },
        { university: ILike(`%${query}%`) },
        { course: ILike(`%${query}%`) }
      ],
      take: 20
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);
    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async getSuggestions(userId: string): Promise<User[]> {
    const user = await this.findById(userId);
    const peers = await this.userRepository.find({
      where: { id: Not(userId) },
      take: 50
    });

    return peers
      .map((peer) => ({
        peer,
        score:
          Number(peer.course === user.course) * 4 +
          peer.skills.filter((skill) => user.skills.includes(skill)).length * 2 +
          peer.interests.filter((interest) => user.interests.includes(interest)).length
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ peer }) => peer);
  }
}
