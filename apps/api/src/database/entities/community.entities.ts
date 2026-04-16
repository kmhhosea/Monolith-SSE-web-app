import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AppBaseEntity } from 'src/common/entities/base.entity';
import { User } from './auth.entities';
import { NotificationType, OpportunityType, TutoringStatus } from './enums';

@Entity({ name: 'feed_posts' })
export class FeedPost extends AppBaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  author!: User;

  @Column()
  authorId!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'simple-json', default: '[]' })
  tags!: string[];
}

@Entity({ name: 'feed_comments' })
export class FeedComment extends AppBaseEntity {
  @ManyToOne(() => FeedPost, { onDelete: 'CASCADE' })
  post!: FeedPost;

  @Column()
  postId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  author!: User;

  @Column()
  authorId!: string;

  @Column({ type: 'text' })
  content!: string;
}

@Entity({ name: 'feed_likes' })
@Index(['postId', 'userId'], { unique: true })
export class FeedLike extends AppBaseEntity {
  @ManyToOne(() => FeedPost, { onDelete: 'CASCADE' })
  post!: FeedPost;

  @Column()
  postId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  userId!: string;
}

@Entity({ name: 'notifications' })
@Index(['userId', 'isRead'])
export class Notification extends AppBaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  userId!: string;

  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType;

  @Column({ length: 160 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'varchar', nullable: true })
  link!: string | null;

  @Column({ default: false })
  isRead!: boolean;
}

@Entity({ name: 'opportunities' })
export class Opportunity extends AppBaseEntity {
  @Column({ length: 160 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: OpportunityType, default: OpportunityType.OTHER })
  type!: OpportunityType;

  @Column({ length: 160 })
  organization!: string;

  @Column({ length: 160, default: 'Remote / Tanzania' })
  location!: string;

  @Column({ type: 'timestamptz', nullable: true })
  deadline!: Date | null;

  @Column({ type: 'varchar', nullable: true })
  link!: string | null;

  @Column({ type: 'simple-json', default: '[]' })
  tags!: string[];

  @Column({ type: 'uuid', nullable: true })
  postedById!: string | null;
}

@Entity({ name: 'tutoring_requests' })
export class TutoringRequest extends AppBaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  requester!: User;

  @Column()
  requesterId!: string;

  @Column({ length: 160 })
  title!: string;

  @Column({ length: 160 })
  topic!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ length: 160 })
  course!: string;

  @Column({ type: 'enum', enum: TutoringStatus, default: TutoringStatus.OPEN })
  status!: TutoringStatus;

  @Column({ type: 'uuid', nullable: true })
  helperId!: string | null;

  @Column({ type: 'int', nullable: true })
  rating!: number | null;

  @Column({ type: 'text', nullable: true })
  feedback!: string | null;
}
