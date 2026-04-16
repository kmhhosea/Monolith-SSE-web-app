import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActivityLog,
  Conversation,
  ConversationParticipant,
  ConversationType,
  MembershipRole,
  Project,
  ProjectMember,
  ProjectTask,
  TaskStatus
} from 'src/database/entities';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(ProjectTask)
    private readonly taskRepository: Repository<ProjectTask>,
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async list() {
    return this.projectRepository.find({ order: { createdAt: 'DESC' }, take: 20 });
  }

  async create(userId: string, dto: CreateProjectDto) {
    const project = await this.projectRepository.save(
      this.projectRepository.create({
        title: dto.title,
        summary: dto.summary,
        tags: dto.tags ?? [],
        ownerId: userId
      })
    );

    await this.projectMemberRepository.save(
      this.projectMemberRepository.create({
        projectId: project.id,
        userId,
        role: MembershipRole.OWNER
      })
    );

    const conversation = await this.conversationRepository.save(
      this.conversationRepository.create({
        type: ConversationType.GROUP,
        name: project.title,
        projectId: project.id,
        createdById: userId
      })
    );

    await this.participantRepository.save(
      this.participantRepository.create({
        conversationId: conversation.id,
        userId
      })
    );

    await this.logActivity(userId, 'project.created', 'project', project.id, {
      title: project.title
    });

    return project;
  }

  async findOne(projectId: string) {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    const [members, tasks] = await Promise.all([
      this.projectMemberRepository.find({ where: { projectId } }),
      this.taskRepository.find({ where: { projectId }, order: { sortOrder: 'ASC' } })
    ]);

    return { ...project, members, tasks };
  }

  async addMember(projectId: string, userId: string) {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    const existing = await this.projectMemberRepository.findOne({ where: { projectId, userId } });
    if (!existing) {
      await this.projectMemberRepository.save(
        this.projectMemberRepository.create({
          projectId,
          userId,
          role: MembershipRole.MEMBER
        })
      );
    }

    const conversation = await this.conversationRepository.findOne({ where: { projectId } });
    if (conversation) {
      const participant = await this.participantRepository.findOne({
        where: { conversationId: conversation.id, userId }
      });
      if (!participant) {
        await this.participantRepository.save(
          this.participantRepository.create({
            conversationId: conversation.id,
            userId
          })
        );
      }
    }

    return project;
  }

  async createTask(projectId: string, createdById: string, dto: CreateTaskDto) {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    const sortOrder = await this.taskRepository.count({ where: { projectId } });
    const task = await this.taskRepository.save(
      this.taskRepository.create({
        projectId,
        title: dto.title,
        description: dto.description ?? '',
        assigneeId: dto.assigneeId ?? null,
        createdById,
        status: TaskStatus.BACKLOG,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        sortOrder
      })
    );

    await this.logActivity(createdById, 'task.created', 'task', task.id, {
      projectId,
      title: task.title
    });

    return task;
  }

  async updateTaskStatus(taskId: string, dto: UpdateTaskStatusDto) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    task.status = dto.status;
    const savedTask = await this.taskRepository.save(task);
    const members = await this.projectMemberRepository.find({ where: { projectId: task.projectId } });

    this.eventEmitter.emit('project.task.updated', {
      userIds: members.map((member) => member.userId),
      projectId: task.projectId,
      title: `${task.title} moved to ${dto.status.toLowerCase().replaceAll('_', ' ')}`
    });

    return savedTask;
  }

  private async logActivity(
    actorId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata: Record<string, unknown>
  ) {
    await this.activityLogRepository.save(
      this.activityLogRepository.create({
        actorId,
        action,
        entityType,
        entityId,
        metadata
      })
    );
  }
}
