import { randomUUID } from 'crypto';
import { BeforeInsert, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export abstract class AppBaseEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @BeforeInsert()
  ensureId() {
    this.id = this.id ?? randomUUID();
  }

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
