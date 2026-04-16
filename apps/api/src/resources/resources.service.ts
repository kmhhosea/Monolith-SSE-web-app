import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Resource, StudyGroupMember, User } from 'src/database/entities';
import { CreateResourceDto } from './dto/create-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @InjectRepository(StudyGroupMember)
    private readonly groupMemberRepository: Repository<StudyGroupMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async list(query?: string) {
    return this.resourceRepository.find({
      where: query
        ? [
            { title: ILike(`%${query}%`) },
            { description: ILike(`%${query}%`) },
            { course: ILike(`%${query}%`) }
          ]
        : {},
      order: { createdAt: 'DESC' },
      take: 30
    });
  }

  async create(
    userId: string,
    dto: CreateResourceDto,
    file: Express.Multer.File
  ) {
    const resource = await this.resourceRepository.save(
      this.resourceRepository.create({
        title: dto.title,
        description: dto.description,
        course: dto.course ?? null,
        university: dto.university ?? null,
        projectId: dto.projectId ?? null,
        groupId: dto.groupId ?? null,
        tags: dto.tags ?? [],
        uploadedById: userId,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size
      })
    );

    const audienceUserIds = dto.groupId
      ? (await this.groupMemberRepository.find({ where: { groupId: dto.groupId } })).map(
          (member) => member.userId
        )
      : (await this.userRepository.find({ take: 10 })).map((user) => user.id);

    this.eventEmitter.emit('resource.created', {
      audienceUserIds,
      title: `${resource.title} was shared`,
      resourceId: resource.id
    });

    return resource;
  }
}
