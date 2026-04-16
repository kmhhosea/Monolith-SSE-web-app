import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AppBaseEntity } from 'src/common/entities/base.entity';
import { User } from './auth.entities';
import { GroupVisibility, MembershipRole, ProjectStage, TaskStatus } from './enums';

@Entity({ name: 'study_groups' })
export class StudyGroup extends AppBaseEntity {
  @Column({ length: 160 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ length: 160 })
  topic!: string;

  @Column({ type: 'varchar', nullable: true })
  meetingLink!: string | null;

  @Column({ type: 'enum', enum: GroupVisibility, default: GroupVisibility.OPEN })
  visibility!: GroupVisibility;

  @Column()
  createdById!: string;
}

@Entity({ name: 'study_group_members' })
@Index(['groupId', 'userId'], { unique: true })
export class StudyGroupMember extends AppBaseEntity {
  @ManyToOne(() => StudyGroup, { onDelete: 'CASCADE' })
  group!: StudyGroup;

  @Column()
  groupId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  userId!: string;

  @Column({ type: 'enum', enum: MembershipRole, default: MembershipRole.MEMBER })
  role!: MembershipRole;
}

@Entity({ name: 'projects' })
export class Project extends AppBaseEntity {
  @Column({ length: 160 })
  title!: string;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ type: 'enum', enum: ProjectStage, default: ProjectStage.IDEA })
  stage!: ProjectStage;

  @Column({ type: 'simple-json', default: '[]' })
  tags!: string[];

  @Column()
  ownerId!: string;
}

@Entity({ name: 'project_members' })
@Index(['projectId', 'userId'], { unique: true })
export class ProjectMember extends AppBaseEntity {
  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project!: Project;

  @Column()
  projectId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  userId!: string;

  @Column({ type: 'enum', enum: MembershipRole, default: MembershipRole.MEMBER })
  role!: MembershipRole;
}

@Entity({ name: 'project_tasks' })
export class ProjectTask extends AppBaseEntity {
  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project!: Project;

  @Column()
  projectId!: string;

  @Column({ length: 160 })
  title!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.BACKLOG })
  status!: TaskStatus;

  @Column({ type: 'uuid', nullable: true })
  assigneeId!: string | null;

  @Column()
  createdById!: string;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate!: Date | null;
}

@Entity({ name: 'resources' })
export class Resource extends AppBaseEntity {
  @Column({ length: 160 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  fileUrl!: string;

  @Column()
  fileName!: string;

  @Column()
  mimeType!: string;

  @Column({ type: 'bigint' })
  size!: number;

  @Column({ type: 'simple-json', default: '[]' })
  tags!: string[];

  @Column({ type: 'varchar', nullable: true })
  course!: string | null;

  @Column({ type: 'varchar', nullable: true })
  university!: string | null;

  @Column()
  uploadedById!: string;

  @Column({ type: 'uuid', nullable: true })
  projectId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  groupId!: string | null;
}

@Entity({ name: 'activity_logs' })
export class ActivityLog extends AppBaseEntity {
  @Column()
  actorId!: string;

  @Column({ length: 120 })
  action!: string;

  @Column({ length: 80 })
  entityType!: string;

  @Column()
  entityId!: string;

  @Column({ type: 'simple-json', default: '{}' })
  metadata!: Record<string, unknown>;
}
