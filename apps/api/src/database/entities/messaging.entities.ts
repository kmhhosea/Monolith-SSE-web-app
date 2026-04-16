import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AppBaseEntity } from 'src/common/entities/base.entity';
import { User } from './auth.entities';
import { ConversationType } from './enums';

@Entity({ name: 'conversations' })
export class Conversation extends AppBaseEntity {
  @Column({ type: 'enum', enum: ConversationType })
  type!: ConversationType;

  @Column({ type: 'varchar', nullable: true })
  name!: string | null;

  @Column({ type: 'uuid', nullable: true })
  studyGroupId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  projectId!: string | null;

  @Column()
  createdById!: string;
}

@Entity({ name: 'conversation_participants' })
@Index(['conversationId', 'userId'], { unique: true })
export class ConversationParticipant extends AppBaseEntity {
  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  conversation!: Conversation;

  @Column()
  conversationId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  userId!: string;

  @Column({ type: 'uuid', nullable: true })
  lastReadMessageId!: string | null;
}

@Entity({ name: 'messages' })
@Index(['conversationId', 'createdAt'])
export class Message extends AppBaseEntity {
  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  conversation!: Conversation;

  @Column()
  conversationId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  sender!: User;

  @Column()
  senderId!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'simple-json', default: '[]' })
  attachments!: Array<{ name: string; url: string }>;
}

@Entity({ name: 'read_receipts' })
@Index(['messageId', 'userId'], { unique: true })
export class ReadReceipt extends AppBaseEntity {
  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  message!: Message;

  @Column()
  messageId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  userId!: string;

  @Column({ type: 'timestamptz' })
  readAt!: Date;
}
