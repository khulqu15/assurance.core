import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('idempotency_keys')
export class IdempotencyKey {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index({ unique: true })
    @Column({ length: 255 })
    key!: string;

    @ManyToOne(() => User, { eager: true, nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'actor_id' })
    actor!: User;

    @Column({ name: 'resource_type', length: 100 })
    resourceType!: string;

    @Column({ name: 'resource_id', type: 'uuid', nullable: true })
    resourceId!: string | null;

    @Column({ name: 'request_hash', type: 'text' })
    requestHash!: string;

    @Column({ name: 'response_code', type: 'int', nullable: true })
    responseCode!: number | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @Column({ name: 'expired_at', type: 'timestamptz' })
    expiredAt!: Date;
}