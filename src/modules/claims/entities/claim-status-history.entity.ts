import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Claim } from './claim.entity';
import { ClaimStatus } from './claim-status.entity';
import { User } from '../../users/entities/user.entity';

@Entity('claim_status_histories')
export class ClaimStatusHistory {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Claim, (claim) => claim.histories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'claim_id' })
    claim!: Claim;

    @ManyToOne(() => ClaimStatus, { eager: true, nullable: true, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'from_status_id' })
    fromStatus?: ClaimStatus | null;

    @ManyToOne(() => ClaimStatus, { eager: true, nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'to_status_id' })
    toStatus!: ClaimStatus;

    @ManyToOne(() => User, { eager: true, nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'action_by' })
    actionBy!: User;

    @Column({ name: 'action_role', length: 50 })
    actionRole!: string;

    @Column({ type: 'text', nullable: true })
    note?: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}