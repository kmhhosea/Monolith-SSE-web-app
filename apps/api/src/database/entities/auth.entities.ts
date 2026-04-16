import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AppBaseEntity } from 'src/common/entities/base.entity';
import { UserRole } from './enums';

@Entity({ name: 'users' })
@Index(['email'], { unique: true })
export class User extends AppBaseEntity {
  @Column({ length: 160 })
  fullName!: string;

  @Column({ length: 160, unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash!: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'text', default: '' })
  bio!: string;

  @Column({ length: 160 })
  university!: string;

  @Column({ length: 160 })
  course!: string;

  @Column({ length: 120, default: 'Tanzania' })
  country!: string;

  @Column({ type: 'simple-json', default: '[]' })
  skills!: string[];

  @Column({ type: 'simple-json', default: '[]' })
  interests!: string[];

  @Column({ type: 'simple-json', default: '[]' })
  goals!: string[];

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ type: 'varchar', nullable: true })
  googleId!: string | null;

  @Column({ default: 'Africa/Dar_es_Salaam' })
  timezone!: string;
}

@Entity({ name: 'refresh_tokens' })
export class RefreshToken extends AppBaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  userId!: string;

  @Column({ select: false })
  tokenHash!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ default: false })
  revoked!: boolean;
}
